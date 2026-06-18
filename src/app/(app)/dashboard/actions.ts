"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [
    insumos, stockBajo, totalItems, insumosData, asignacionesData,
    movimientosData, logsActividad,
  ] = await Promise.all([
    prisma.insumo.count(),
    prisma.insumo.findMany({ where: {}, select: { stockActual: true, stockMinimo: true } }),
    prisma.insumo.aggregate({ _sum: { stockActual: true } }),
    prisma.insumo.findMany({
      select: { nombre: true, stockActual: true, categoria: { select: { nombre: true } } },
    }),
    prisma.asignacion.findMany({
      select: { colaborador: { select: { area: true } }, cantidad: true },
    }),
    prisma.movimiento.findMany({
      orderBy: { fecha: "desc" },
      take: 30,
      select: { fecha: true, tipo: true, cantidad: true },
    }),
    prisma.logAuditoria.findMany({
      orderBy: { fecha: "desc" },
      take: 30,
      include: { colaborador: { select: { nombre: true, apellidoPaterno: true } } },
    }),
  ]);

  const bajoCount = stockBajo.filter((i) => i.stockActual <= i.stockMinimo).length;
  const tasaUtilizacion = insumos > 0 ? Math.round(((insumos - bajoCount) / insumos) * 100) : 0;

  // Insumos bajo stock mínimo
  const todosInsumos = await prisma.insumo.findMany({
    select: { id: true, nombre: true, stockActual: true, stockMinimo: true, unidad: true, categoria: { select: { nombre: true } } },
    orderBy: { stockActual: "asc" },
  });
  const insumosAlerta = todosInsumos.filter(i => i.stockActual <= i.stockMinimo);

  // Procesar datos para gráficos
  const inventarioPorCategoria = Array.from(
    new Map(
      insumosData.map((i) => [
        i.categoria.nombre,
        insumosData.filter((x) => x.categoria.nombre === i.categoria.nombre).reduce((sum, x) => sum + x.stockActual, 0),
      ])
    )
  ).map(([nombre, cantidad]) => ({ nombre, cantidad: cantidad as number }));

  const distribucionEstado = [
    { name: "Disponible", value: insumos - bajoCount },
    { name: "Stock Bajo", value: bajoCount },
  ];

  const movimientosUltimos30 = movimientosData
    .reverse()
    .reduce(
      (acc, m) => {
        const fecha = new Date(m.fecha).toLocaleDateString("es-CL", { month: "short", day: "numeric" });
        const existing = acc.find((x) => x.fecha === fecha) || { fecha, entradas: 0, salidas: 0 };
        if (m.tipo === "entrada") existing.entradas += m.cantidad;
        else if (m.tipo === "salida") existing.salidas += m.cantidad;
        if (!acc.find((x) => x.fecha === fecha)) acc.push(existing);
        return acc;
      },
      [] as Array<{ fecha: string; entradas: number; salidas: number }>
    );

  const asignacionesPorArea = Array.from(
    new Map(
      asignacionesData.map((a) => [
        a.colaborador.area || "Sin área",
        asignacionesData
          .filter((x) => (x.colaborador.area || "Sin área") === (a.colaborador.area || "Sin área"))
          .reduce((sum, x) => sum + x.cantidad, 0),
      ])
    )
  ).map(([area, cantidad]) => ({ area, cantidad: cantidad as number }));

  const logsSer = logsActividad.map(l => ({
    ...l,
    fecha: l.fecha.toISOString(),
  }));

  return {
    insumos,
    bajoCount,
    totalItems,
    insumosAlerta,
    tasaUtilizacion,
    inventarioPorCategoria,
    distribucionEstado,
    movimientosUltimos30,
    asignacionesPorArea,
    logsSer,
  };
}

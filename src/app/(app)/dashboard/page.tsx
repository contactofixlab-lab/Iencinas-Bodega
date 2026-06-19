import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader, StatCard } from "@/components/ui";
import Tabs from "@/components/Tabs";
import GraficosResumen from "@/components/GraficosResumen";
import GestorReportes from "@/components/GestorReportes";
import AlertaStockBajo from "@/components/AlertaStockBajo";
import ActividadLogs from "@/components/ActividadLogs";

export default async function DashboardPage() {
  await requireModulo("dashboard");

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

  const todosInsumos = await prisma.insumo.findMany({
    select: { id: true, nombre: true, stockActual: true, stockMinimo: true, unidad: true, categoria: { select: { nombre: true } } },
    orderBy: { stockActual: "asc" },
  });
  const insumosAlerta = todosInsumos.filter(i => i.stockActual <= i.stockMinimo);

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

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Panel de control integral de la bodega"
      />

      <Tabs
        tabs={[
          {
            id: "resumen",
            label: "Resumen",
            content: (
              <div className="space-y-6">
                <AlertaStockBajo insumos={insumosAlerta} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Inventario Total" value={totalItems._sum.stockActual ?? 0} accent="green" hint="unidades en stock" />
                  <StatCard label="Tipos de Insumo" value={insumos} accent="blue" hint="en catálogo" />
                  <StatCard label="Stock Bajo" value={bajoCount} accent="warning" hint="bajo el mínimo" />
                  <StatCard label="Tasa Utilización" value={`${tasaUtilizacion}%`} accent="green" />
                </div>
                <GraficosResumen datos={{ inventarioPorCategoria, distribucionEstado, movimientosUltimos30, asignacionesPorArea }} />
              </div>
            ),
          },
          {
            id: "actividad",
            label: "Actividad",
            content: (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
                    Registro de Auditoría
                  </h3>
                  <span className="ml-auto text-xs text-text-soft bg-white/5 px-2 py-1 rounded-full">Todas las actividades</span>
                </div>
                <ActividadLogs logs={logsSer as any} />
              </div>
            ),
          },
          {
            id: "reportes",
            label: "Reportes",
            content: <GestorReportes />,
          },
        ]}
      />
    </div>
  );
}

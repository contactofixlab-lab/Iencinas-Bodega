import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import Tabs from "@/components/Tabs";
import DashboardResumenClient from "@/components/DashboardResumenClient";
import GestorReportes from "@/components/GestorReportes";
import ActividadLogs from "@/components/ActividadLogs";

export default async function DashboardPage() {
  await requireModulo("dashboard");

  const [insumosFull, movimientosFull, asignacionesFull, categorias, logsActividad] =
    await Promise.all([
      prisma.insumo.findMany({
        select: {
          id: true,
          nombre: true,
          stockActual: true,
          stockMinimo: true,
          unidad: true,
          ubicacion: true,
          tipoInsumo: true,
          categoriaId: true,
          categoria: { select: { id: true, nombre: true } },
          createdAt: true,
        },
        orderBy: { nombre: "asc" },
      }),
      prisma.movimiento.findMany({
        select: { id: true, fecha: true, tipo: true, cantidad: true, insumoId: true },
        orderBy: { fecha: "desc" },
      }),
      prisma.asignacion.findMany({
        select: {
          id: true,
          colaborador: { select: { area: true } },
          cantidad: true,
          fechaAsignacion: true,
          insumoId: true,
        },
        orderBy: { fechaAsignacion: "desc" },
      }),
      prisma.categoria.findMany({
        select: { id: true, nombre: true, tipo: true },
        orderBy: { nombre: "asc" },
      }),
      prisma.logAuditoria.findMany({
        orderBy: { fecha: "desc" },
        take: 30,
        include: { colaborador: { select: { nombre: true, apellidoPaterno: true } } },
      }),
    ]);

  // Serializar fechas para componentes cliente
  const insumosSer = insumosFull.map((i) => ({ ...i, createdAt: i.createdAt.toISOString() }));
  const movimientosSer = movimientosFull.map((m) => ({ ...m, fecha: m.fecha.toISOString() }));
  const asignacionesSer = asignacionesFull.map((a) => ({ ...a, fechaAsignacion: a.fechaAsignacion.toISOString() }));
  const logsSer = logsActividad.map((l) => ({ ...l, fecha: l.fecha.toISOString() }));

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Panel de control integral de la bodega" />

      <Tabs
        tabs={[
          {
            id: "resumen",
            label: "Resumen",
            content: (
              <DashboardResumenClient
                insumos={insumosSer}
                movimientos={movimientosSer}
                asignaciones={asignacionesSer}
                categorias={categorias}
              />
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
                  <span className="ml-auto text-xs text-text-soft bg-white/5 px-2 py-1 rounded-full">
                    Todas las actividades
                  </span>
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

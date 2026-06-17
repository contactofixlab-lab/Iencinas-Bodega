import { ArrowLeftRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import Tabs from "@/components/Tabs";
import AsignacionesClient from "./AsignacionesClient";

export default async function AsignacionesPage() {
  const { permisos } = await requireModulo("asignaciones");

  const [asignaciones, solicitudes, colaboradores, insumos] = await Promise.all([
    prisma.asignacion.findMany({
      include: { colaborador: true, insumo: true },
      orderBy: { fechaAsignacion: "desc" },
    }),
    prisma.solicitud.findMany({
      include: { colaborador: true, items: { include: { insumo: true } } },
      orderBy: { fecha: "desc" },
    }),
    prisma.colaborador.findMany({
      where: { estado: "activo" },
      select: { id: true, nombre: true, apellidoPaterno: true, area: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.insumo.findMany({
      where: { stockActual: { gt: 0 } },
      select: { id: true, nombre: true, stockActual: true, unidad: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  // Serializar fechas
  const asignSer = asignaciones.map(a => ({
    ...a,
    fechaAsignacion: a.fechaAsignacion.toISOString(),
    fechaDevolucion: a.fechaDevolucion?.toISOString() ?? null,
    createdAt: a.createdAt.toISOString(),
  }));
  const solSer = solicitudes.map(s => ({
    ...s,
    fecha: s.fecha.toISOString(),
    fechaResolucion: s.fechaResolucion?.toISOString() ?? null,
  }));

  const puedeAsignar = permisos.asignaciones.crear;
  const puedeAprobar = permisos.asignaciones.aprobar;

  const pendientes = solicitudes.filter(s => s.estado === "pendiente").length;

  return (
    <div>
      <PageHeader title="Asignaciones" subtitle="Entregas, historial y solicitudes" icon={<ArrowLeftRight className="h-5 w-5" />} />

      <Tabs
        tabs={[
          {
            id: "asignar",
            label: "Asignar / Historial",
            content: (
              <AsignacionesClient
                asignaciones={asignSer as any}
                solicitudes={solSer as any}
                colaboradores={colaboradores}
                insumos={insumos}
                puedeAsignar={puedeAsignar}
                puedeAprobar={puedeAprobar}
                activeTab="asignar"
              />
            ),
          },
          {
            id: "solicitudes",
            label: `Solicitudes${pendientes > 0 ? ` (${pendientes})` : ""}`,
            content: (
              <AsignacionesClient
                asignaciones={asignSer as any}
                solicitudes={solSer as any}
                colaboradores={colaboradores}
                insumos={insumos}
                puedeAsignar={puedeAsignar}
                puedeAprobar={puedeAprobar}
                activeTab="solicitudes"
              />
            ),
          },
        ]}
      />
    </div>
  );
}

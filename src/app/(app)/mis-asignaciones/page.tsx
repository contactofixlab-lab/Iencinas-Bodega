import { Package } from "@/components/icons";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PageHeader, Table, Badge, EmptyRow } from "@/components/ui";
import Tabs from "@/components/Tabs";
import MisAsignacionesClient from "./MisAsignacionesClient";
import HistorialTimeline from "./HistorialTimeline";

const fmt = (d: Date) => new Date(d).toLocaleDateString("es-CL");

const estadoTone: Record<string, "amber" | "green" | "red" | "blue"> = {
  pendiente: "amber", aprobada: "green", rechazada: "red", entregada: "blue",
};

export default async function MisAsignacionesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [asignaciones, solicitudes, insumos] = await Promise.all([
    prisma.asignacion.findMany({
      where: { colaboradorId: session.uid },
      include: { insumo: true },
      orderBy: { fechaAsignacion: "desc" },
    }),
    prisma.solicitud.findMany({
      where: { colaboradorId: session.uid },
      include: { items: { include: { insumo: true } } },
      orderBy: { fecha: "desc" },
    }),
    prisma.insumo.findMany({
      where: { stockActual: { gt: 0 } },
      select: { id: true, nombre: true, stockActual: true, unidad: true },
      orderBy: { nombre: "asc" },
    }),
  ]);

  const solSer = solicitudes.map(s => ({
    ...s,
    fecha: s.fecha.toISOString(),
    fechaResolucion: s.fechaResolucion?.toISOString() ?? null,
  }));

  return (
    <div>
      <PageHeader title="Mis asignaciones" subtitle="El historial completo de tus insumos" icon={<Package className="h-5 w-5" />} />

      <Tabs
        tabs={[
          {
            id: "historial",
            label: "Historial",
            content: <HistorialTimeline asignaciones={asignaciones} solicitudes={solicitudes} />,
          },
          {
            id: "asignados",
            label: "Asignados a mí",
            content: (
              <Table head={["Insumo", "Cantidad", "Serie", "Fecha", "Estado"]}>
                {asignaciones.length === 0 ? (
                  <EmptyRow colSpan={5} text="No tienes insumos asignados" />
                ) : (
                  asignaciones.map((a) => (
                    <tr key={a.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 font-medium">{a.insumo.nombre}</td>
                      <td className="px-4 py-3">{a.cantidad}</td>
                      <td className="px-4 py-3 text-text-soft">{a.numeroSerie ?? "—"}</td>
                      <td className="px-4 py-3 text-text-soft">{fmt(a.fechaAsignacion)}</td>
                      <td className="px-4 py-3"><Badge tone={a.estado === "vigente" ? "green" : "gray"}>{a.estado}</Badge></td>
                    </tr>
                  ))
                )}
              </Table>
            ),
          },
          {
            id: "solicitudes",
            label: "Mis solicitudes",
            content: (
              <MisAsignacionesClient
                solicitudes={solSer as any}
                insumos={insumos}
              />
            ),
          },
        ]}
      />
    </div>
  );
}

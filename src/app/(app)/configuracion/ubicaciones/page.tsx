import { MapPin } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import UbicacionesClient from "./UbicacionesClient";

export const metadata = { title: "Ubicaciones — Configuración" };

export default async function UbicacionesPage() {
  const { permisos } = await requireModulo("configuracion");
  const ubicaciones = await prisma.ubicacion.findMany({ orderBy: [{ esSedePrincipal: "desc" }, { nombre: "asc" }] });

  return (
    <div>
      <PageHeader
        title="Ubicaciones"
        subtitle="Sedes, bodegas y puntos de la organización"
        icon={<MapPin className="h-5 w-5" />}
      />
      <UbicacionesClient ubicaciones={ubicaciones} puedeEditar={permisos.configuracion.editar} />
    </div>
  );
}

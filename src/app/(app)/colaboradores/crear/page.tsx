import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ClientCrearColaborador from "./client";

export const metadata = {
  title: "Crear colaborador - Yencinas Bodega",
};

export default async function CrearColaboradorPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [perfiles, proyectos] = await Promise.all([
    prisma.perfil.findMany(),
    prisma.proyecto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">Crear nuevo colaborador</h1>
      <ClientCrearColaborador perfiles={perfiles} proyectos={proyectos} />
    </div>
  );
}

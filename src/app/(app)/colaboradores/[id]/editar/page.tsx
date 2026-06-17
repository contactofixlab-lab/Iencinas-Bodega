import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ClientEditarColaborador from "./client";

export const metadata = {
  title: "Editar colaborador - Yencinas Bodega",
};

export default async function EditarColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const usuario = await prisma.colaborador.findUnique({
    where: { id },
    include: { perfil: true, proyectos: { include: { proyecto: true } } },
  });

  if (!usuario) {
    return (
      <div className="p-6 text-center text-red-400">
        Usuario no encontrado
      </div>
    );
  }

  const [perfiles, proyectos] = await Promise.all([
    prisma.perfil.findMany(),
    prisma.proyecto.findMany({ where: { activo: true }, orderBy: { nombre: "asc" } }),
  ]);

  const proyectosAsignados = usuario.proyectos.map((cp) => cp.proyectoId);

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Editar {usuario.nombre} {usuario.apellidoPaterno}
      </h1>
      <ClientEditarColaborador
        colaborador={usuario}
        perfiles={perfiles}
        proyectos={proyectos}
        proyectosAsignados={proyectosAsignados}
      />
    </div>
  );
}

import { redirect } from "next/navigation";
import MiPerfil from "@/components/MiPerfil";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Mi perfil - Yencinas Bodega",
};

export default async function MiPerfilPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const [usuario, asignaciones, solicitudes] = await Promise.all([
    prisma.colaborador.findUnique({ where: { id: session.uid }, include: { perfil: true } }),
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
  ]);

  if (!usuario) redirect("/login");

  return <MiPerfil usuario={usuario} asignaciones={asignaciones} solicitudes={solicitudes} />;
}

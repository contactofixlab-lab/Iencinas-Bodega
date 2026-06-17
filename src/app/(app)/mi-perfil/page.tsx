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

  const usuario = await prisma.colaborador.findUnique({
    where: { id: session.uid },
    include: { perfil: true },
  });

  if (!usuario) redirect("/login");

  return <MiPerfil usuario={usuario} />;
}

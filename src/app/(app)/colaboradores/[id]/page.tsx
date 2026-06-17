import Link from "next/link";
import { ArrowLeft, Edit } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MiPerfil from "@/components/MiPerfil";

export const metadata = {
  title: "Perfil de colaborador - Yencinas Bodega",
};

export default async function ColaboradorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const usuario = await prisma.colaborador.findUnique({
    where: { id },
    include: { perfil: true },
  });

  if (!usuario) {
    return (
      <div className="p-6">
        <Link href="/colaboradores" className="inline-flex items-center gap-2 mb-4 text-brand-blue hover:text-brand-blue/80">
          <ArrowLeft className="h-5 w-5" />
          Volver
        </Link>
        <div className="glass-strong rounded-lg p-8 text-center text-red-400">
          Colaborador no encontrado
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link href="/colaboradores" className="inline-flex items-center gap-2 text-brand-blue hover:text-brand-blue/80">
          <ArrowLeft className="h-5 w-5" />
          Volver a colaboradores
        </Link>
        <Link
          href={`/colaboradores/${usuario.id}/editar`}
          className="btn-green flex items-center gap-2"
        >
          <Edit className="h-5 w-5" />
          Editar
        </Link>
      </div>

      <MiPerfil usuario={usuario} />
    </div>
  );
}

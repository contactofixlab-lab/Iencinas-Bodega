import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/ui";
import ProyectosClient from "./client";

export const metadata = { title: "Proyectos - Yencinas Bodega" };

export default async function ProyectosPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const proyectos = await prisma.proyecto.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="pt-5">
      <PageHeader
        title="Proyectos"
        subtitle="Gestiona los proyectos disponibles. Se sincronizarán con Movisuite."
        icon={<FolderOpen className="h-5 w-5" />}
      />
      <ProyectosClient proyectos={proyectos} />
    </div>
  );
}

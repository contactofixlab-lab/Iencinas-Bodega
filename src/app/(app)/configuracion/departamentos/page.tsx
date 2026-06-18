import { FolderKanban } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import DepartamentosClient from "./DepartamentosClient";

export const metadata = { title: "Departamentos — Configuración" };

export default async function DepartamentosPage() {
  const { permisos } = await requireModulo("configuracion");
  const departamentos = await prisma.departamento.findMany({ orderBy: { nombre: "asc" } });

  return (
    <div>
      <PageHeader
        title="Departamentos"
        subtitle="Áreas de trabajo de la organización — se usan en los formularios de colaboradores"
        icon={<FolderKanban className="h-5 w-5" />}
      />
      <DepartamentosClient departamentos={departamentos} puedeEditar={permisos.configuracion.editar} />
    </div>
  );
}

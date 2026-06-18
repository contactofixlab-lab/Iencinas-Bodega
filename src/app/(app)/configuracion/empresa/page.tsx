import { Building2 } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import EmpresaClient from "./client";

export const metadata = { title: "Empresa — Configuración" };

export default async function EmpresaPage() {
  await requireModulo("configuracion");
  const empresa = await prisma.empresa.findFirst();

  return (
    <div>
      <PageHeader
        title="Empresa"
        subtitle="Datos generales y configuración de la organización"
        icon={<Building2 className="h-5 w-5" />}
      />
      <EmpresaClient empresa={empresa} />
    </div>
  );
}

import { Truck } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import ProveedoresClient from "./ProveedoresClient";

export default async function ProveedoresPage() {
  const { permisos } = await requireModulo("proveedores");

  const proveedores = await prisma.proveedor.findMany({
    include: { _count: { select: { insumos: true } } },
    orderBy: { nombre: "asc" },
  });

  return (
    <div>
      <PageHeader title="Proveedores" subtitle="Catálogo de proveedores" icon={<Truck className="h-5 w-5" />} />
      <ProveedoresClient proveedores={proveedores} puedeCrear={permisos.proveedores.crear} />
    </div>
  );
}

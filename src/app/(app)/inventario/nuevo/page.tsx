import { redirect } from "next/navigation";
import { Boxes } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader } from "@/components/ui";
import NuevoInsumoClient from "./NuevoInsumoClient";

export default async function NuevoInsumoPage() {
  const { permisos } = await requireModulo("inventario");
  if (!permisos.inventario.crear) redirect("/inventario");

  const [categorias, proveedores] = await Promise.all([
    prisma.categoria.findMany({ include: { _count: { select: { insumos: true } } }, orderBy: { nombre: "asc" } }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);

  return (
    <div>
      <PageHeader title="Nuevo insumo" subtitle="Elige el catálogo y completa el formulario" icon={<Boxes className="h-5 w-5" />} />
      <NuevoInsumoClient categorias={categorias} proveedores={proveedores} />
    </div>
  );
}

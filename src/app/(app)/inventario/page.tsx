import { Boxes } from "@/components/icons";
import { prisma } from "@/lib/prisma";
import { requireModulo } from "@/lib/guard";
import { PageHeader, Table, Badge, EmptyRow } from "@/components/ui";
import Tabs from "@/components/Tabs";
import InventarioClient from "./InventarioClient";

const fmt = (d: Date) => new Date(d).toLocaleDateString("es-CL");

export default async function InventarioPage() {
  const { permisos } = await requireModulo("inventario");

  const [insumos, categorias, movimientos, proveedores] = await Promise.all([
    prisma.insumo.findMany({
      include: { categoria: true, proveedor: true },
      orderBy: { nombre: "asc" },
    }),
    prisma.categoria.findMany({ include: { _count: { select: { insumos: true } } }, orderBy: { nombre: "asc" } }),
    prisma.movimiento.findMany({ include: { insumo: true }, orderBy: { fecha: "desc" }, take: 50 }),
    prisma.proveedor.findMany({ orderBy: { nombre: "asc" }, select: { id: true, nombre: true } }),
  ]);

  const puedeCrear = permisos.inventario.crear;

  // Serializar fechas para el cliente
  const insumosSerial = insumos.map(i => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }));
  const categoriasSerial = categorias.map(c => ({ ...c }));

  return (
    <div>
      <PageHeader title="Inventario" subtitle="Catálogo, insumos y movimientos" icon={<Boxes className="h-5 w-5" />} />

      <Tabs
        tabs={[
          {
            id: "catalogo",
            label: "Catálogo",
            content: (
              <InventarioClient
                key="catalogo"
                categorias={categoriasSerial}
                insumos={insumosSerial as any}
                proveedores={proveedores}
                puedeCrear={puedeCrear}
                activeTab="catalogo"
              />
            ),
          },
          {
            id: "insumos",
            label: "Insumos",
            content: (
              <InventarioClient
                key="insumos"
                categorias={categoriasSerial}
                insumos={insumosSerial as any}
                proveedores={proveedores}
                puedeCrear={puedeCrear}
                activeTab="insumos"
              />
            ),
          },
          {
            id: "movimientos",
            label: "Movimientos",
            content: (
              <Table head={["Fecha", "Insumo", "Tipo", "Cantidad", "Usuario", "Motivo"]}>
                {movimientos.length === 0 ? (
                  <EmptyRow colSpan={6} text="Sin movimientos" />
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-white/5">
                      <td className="px-4 py-3 text-text-soft">{fmt(m.fecha)}</td>
                      <td className="px-4 py-3 font-medium">{m.insumo.nombre}</td>
                      <td className="px-4 py-3">
                        <Badge tone={m.tipo === "entrada" ? "green" : m.tipo === "salida" ? "amber" : "blue"}>{m.tipo}</Badge>
                      </td>
                      <td className="px-4 py-3">{m.cantidad}</td>
                      <td className="px-4 py-3 text-text-soft">{m.usuario ?? "—"}</td>
                      <td className="px-4 py-3 text-text-soft">{m.motivo ?? "—"}</td>
                    </tr>
                  ))
                )}
              </Table>
            ),
          },
        ]}
      />
    </div>
  );
}

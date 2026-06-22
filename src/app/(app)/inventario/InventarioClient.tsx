"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, ArrowUp, ArrowDown, RotateCcw, QrCode } from "@/components/icons";
import { Table, Badge, EmptyRow } from "@/components/ui";
import AppSelect from "@/components/AppSelect";
import Modal from "@/components/Modal";
import { crearCategoria, editarInsumo, registrarMovimiento } from "@/app/api/inventario/actions";
import QRModal from "@/components/QRModal";
import TipoInsumoSelect from "@/components/TipoInsumoSelect";
import { TIPOS_CATEGORIA } from "@/lib/categoriaTipos";

const ESTADO_EQUIPO_OPTIONS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "usado", label: "Usado" },
  { value: "dañado", label: "Dañado" },
  { value: "en_reparacion", label: "En reparación" },
];

type Categoria = { id: string; nombre: string; tipo: string; _count: { insumos: number } };
type Proveedor = { id: string; nombre: string };
type Insumo = {
  id: string; nombre: string; descripcion: string | null; sku: string | null;
  marca: string | null; modelo: string | null; unidad: string;
  stockActual: number; stockMinimo: number; ubicacion: string | null;
  esSerializable: boolean; categoriaId: string;
  categoria: { nombre: string; tipo: string }; proveedor: { nombre: string } | null;
  proveedorId: string | null;
  empresa: string | null; tipoInsumo: string | null; ram: number | null; almacenamiento: number | null;
  numeroSerie: string | null; sistemaOperativo: string | null; estadoEquipo: string | null;
  precioReferencia: number | null; precioVendible: number | null; precioVendido: number | null;
  formateado: boolean;
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs uppercase tracking-wider text-text-soft font-medium">{label}</label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-text-soft/50 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);


export default function InventarioClient({
  categorias, insumos, proveedores, puedeCrear, activeTab = "catalogo", tiposInsumoSugeridos = [],
}: {
  categorias: Categoria[]; insumos: Insumo[]; proveedores: Proveedor[]; puedeCrear: boolean; activeTab?: "catalogo" | "insumos";
  tiposInsumoSugeridos?: string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  // Modales
  const [modalCat, setModalCat] = useState(false);
  const [modalEditar, setModalEditar] = useState<Insumo | null>(null);
  const [modalMov, setModalMov] = useState<Insumo | null>(null);
  const [modalQR, setModalQR] = useState<{ id: string; nombre: string } | null>(null);
  const [error, setError] = useState("");

  // Form categoria
  const [fCat, setFCat] = useState({ nombre: "", tipo: "oficina" });
  // Form editar insumo
  const [fEdit, setFEdit] = useState<any>({});
  // Form movimiento
  const [fMov, setFMov] = useState({ tipo: "entrada" as "entrada"|"salida"|"ajuste", cantidad: 1, motivo: "" });

  const refresh = () => router.refresh();

  const handleCrearCat = async () => {
    setError("");
    const r = await crearCategoria({ nombre: fCat.nombre, tipo: fCat.tipo });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalCat(false); setFCat({ nombre: "", tipo: "oficina" }); refresh();
  };

  const handleEditarInsumo = async () => {
    if (!modalEditar) return;
    setError("");
    const r = await editarInsumo(modalEditar.id, {
      ...fEdit,
      ram: fEdit.ram ? +fEdit.ram : undefined,
      almacenamiento: fEdit.almacenamiento ? +fEdit.almacenamiento : undefined,
      precioReferencia: fEdit.precioReferencia ? +fEdit.precioReferencia : undefined,
      precioVendible: fEdit.precioVendible ? +fEdit.precioVendible : undefined,
      precioVendido: fEdit.precioVendido ? +fEdit.precioVendido : undefined,
    });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalEditar(null); refresh();
  };

  const handleMovimiento = async () => {
    if (!modalMov) return;
    setError("");
    const r = await registrarMovimiento({ insumoId: modalMov.id, ...fMov });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalMov(null); setFMov({ tipo: "entrada", cantidad: 1, motivo: "" }); refresh();
  };

  const openEditar = (ins: Insumo) => {
    setFEdit({
      nombre: ins.nombre, descripcion: ins.descripcion ?? "",
      sku: ins.sku ?? "", marca: ins.marca ?? "", modelo: ins.modelo ?? "",
      unidad: ins.unidad, stockMinimo: ins.stockMinimo,
      ubicacion: ins.ubicacion ?? "", proveedorId: ins.proveedorId ?? "",
      categoriaId: ins.categoriaId,
      empresa: ins.empresa ?? "", tipoInsumo: ins.tipoInsumo ?? "",
      ram: ins.ram ?? "", almacenamiento: ins.almacenamiento ?? "",
      numeroSerie: ins.numeroSerie ?? "", sistemaOperativo: ins.sistemaOperativo ?? "",
      estadoEquipo: ins.estadoEquipo ?? "",
      precioReferencia: ins.precioReferencia ?? "", precioVendible: ins.precioVendible ?? "",
      precioVendido: ins.precioVendido ?? "", formateado: ins.formateado,
    });
    setModalEditar(ins);
    setError("");
  };

  const categoriaEditarTipo = categorias.find((c) => c.id === fEdit.categoriaId)?.tipo;
  const editarEsTecnologia = categoriaEditarTipo === "tecnologia";

  return (
    <>
      {/* TAB Catálogo */}
      {activeTab === "catalogo" && <div>
        {puedeCrear && (
          <div className="mb-4 flex justify-end">
            <button onClick={() => { setModalCat(true); setError(""); }} className="btn-green flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
              <Plus className="h-4 w-4" /> Nuevo tipo de insumo
            </button>
          </div>
        )}
        <Table head={["Categoría", "Tipo", "Insumos"]}>
          {categorias.length === 0 ? <EmptyRow colSpan={3} text="Sin categorías" /> : (
            categorias.map((c) => (
              <tr key={c.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-medium">{c.nombre}</td>
                <td className="px-4 py-3 text-text-soft capitalize">{c.tipo}</td>
                <td className="px-4 py-3">{c._count.insumos}</td>
              </tr>
            ))
          )}
        </Table>
      </div>
      }

      {/* TAB Insumos */}
      {activeTab === "insumos" && <div>
        {puedeCrear && (
          <div className="mb-4 flex justify-end">
            <button onClick={() => router.push("/inventario/nuevo")} className="btn-green flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
              <Plus className="h-4 w-4" /> Agregar insumo
            </button>
          </div>
        )}
        <Table head={["Insumo", "Categoría", "SKU", "Stock", "Mínimo", "Ubicación", "Proveedor", ""]}>
          {insumos.length === 0 ? <EmptyRow colSpan={8} text="Sin insumos" /> : (
            insumos.map((i) => {
              const bajo = i.stockActual <= i.stockMinimo;
              return (
                <tr key={i.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="font-medium">{i.nombre}</div>
                    {i.marca && <div className="text-xs text-text-soft">{i.marca} {i.modelo}</div>}
                  </td>
                  <td className="px-4 py-3 text-text-soft">{i.categoria.nombre}</td>
                  <td className="px-4 py-3 text-text-soft">{i.sku ?? "—"}</td>
                  <td className="px-4 py-3"><Badge tone={bajo ? "amber" : "green"}>{i.stockActual} {i.unidad}</Badge></td>
                  <td className="px-4 py-3 text-text-soft">{i.stockMinimo}</td>
                  <td className="px-4 py-3 text-text-soft">{i.ubicacion ?? "—"}</td>
                  <td className="px-4 py-3 text-text-soft">{i.proveedor?.nombre ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setModalQR({ id: i.id, nombre: i.nombre }); }} title="Ver QR" className="rounded p-1.5 hover:bg-white/10 text-text-soft hover:text-brand-green transition-colors">
                        <QrCode className="h-4 w-4" />
                      </button>
                      {puedeCrear && (
                        <>
                          <button onClick={() => { setModalMov(i); setError(""); }} title="Movimiento" className="rounded p-1.5 hover:bg-white/10 text-text-soft hover:text-brand-green transition-colors">
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button onClick={() => openEditar(i)} title="Editar" className="rounded p-1.5 hover:bg-white/10 text-text-soft hover:text-brand-blue transition-colors">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </div>
      }

      {/* Modal crear categoría */}
      <Modal title="Nueva categoría de insumo" open={modalCat} onClose={() => setModalCat(false)} size="md">
        <div className="space-y-5">
          <Field label="Nombre de la categoría">
            <Input value={fCat.nombre} onChange={e => setFCat(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Papelería" />
          </Field>
          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-wider text-text-soft font-medium">Tipo</label>
            <div className="grid grid-cols-4 gap-2">
              {TIPOS_CATEGORIA.map((t) => {
                const Icon = t.icon;
                const active = fCat.tipo === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setFCat(p => ({ ...p, tipo: t.value }))}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                      active
                        ? "border-brand-green/50 bg-brand-green/10 text-brand-green"
                        : "border-white/10 bg-white/5 text-text-soft hover:border-white/25 hover:bg-white/8"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-[11px] font-medium leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalCat(false)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleCrearCat} disabled={!fCat.nombre} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">Crear categoría</button>
          </div>
        </div>
      </Modal>

      {/* Modal editar insumo */}
      <Modal title={`Editar: ${modalEditar?.nombre}`} open={!!modalEditar} onClose={() => setModalEditar(null)} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nombre"><Input value={fEdit.nombre ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, nombre: e.target.value }))} /></Field>
            <Field label="Categoría">
              <AppSelect
                value={fEdit.categoriaId ?? ""}
                onChange={(v) => setFEdit((p: any) => ({ ...p, categoriaId: v }))}
                options={categorias.map(c => ({ value: c.id, label: c.nombre }))}
              />
            </Field>
            <Field label="SKU"><Input value={fEdit.sku ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, sku: e.target.value }))} /></Field>
            <Field label="Marca"><Input value={fEdit.marca ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, marca: e.target.value }))} /></Field>
            <Field label="Modelo"><Input value={fEdit.modelo ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, modelo: e.target.value }))} /></Field>
            <Field label="Unidad">
              <AppSelect
                value={fEdit.unidad ?? "unidad"}
                onChange={(v) => setFEdit((p: any) => ({ ...p, unidad: v }))}
                options={["unidad","caja","paquete","resma","litro","kg","par","set"].map(u => ({ value: u, label: u }))}
              />
            </Field>
            <Field label="Stock mínimo"><Input type="number" min={0} value={fEdit.stockMinimo ?? 0} onChange={e => setFEdit((p: any) => ({ ...p, stockMinimo: +e.target.value }))} /></Field>
            <Field label="Ubicación"><Input value={fEdit.ubicacion ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, ubicacion: e.target.value }))} /></Field>
            <Field label="Proveedor">
              <AppSelect
                value={fEdit.proveedorId ?? ""}
                onChange={(v) => setFEdit((p: any) => ({ ...p, proveedorId: v }))}
                options={[{ value: "", label: "Sin proveedor" }, ...proveedores.map(p => ({ value: p.id, label: p.nombre }))]}
              />
            </Field>
          </div>
          <Field label="Descripción"><Input value={fEdit.descripcion ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, descripcion: e.target.value }))} /></Field>

          {editarEsTecnologia && (
            <div className="space-y-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-brand-green font-medium">Detalle técnico</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Empresa"><Input value={fEdit.empresa ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, empresa: e.target.value }))} /></Field>
                <Field label="Tipo de insumo">
                  <TipoInsumoSelect
                    value={fEdit.tipoInsumo ?? ""}
                    onChange={(v) => setFEdit((p: any) => ({ ...p, tipoInsumo: v }))}
                    sugerencias={tiposInsumoSugeridos}
                  />
                </Field>
                <Field label="RAM [GB]"><Input type="number" min={0} value={fEdit.ram ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, ram: e.target.value }))} /></Field>
                <Field label="Almacenamiento [GB]"><Input type="number" min={0} value={fEdit.almacenamiento ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, almacenamiento: e.target.value }))} /></Field>
                <Field label="Número de serie"><Input value={fEdit.numeroSerie ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, numeroSerie: e.target.value }))} /></Field>
                <Field label="Sistema operativo"><Input value={fEdit.sistemaOperativo ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, sistemaOperativo: e.target.value }))} /></Field>
                <Field label="Estado equipo">
                  <AppSelect
                    value={fEdit.estadoEquipo ?? ""}
                    onChange={(v) => setFEdit((p: any) => ({ ...p, estadoEquipo: v }))}
                    placeholder="Seleccionar…"
                    options={ESTADO_EQUIPO_OPTIONS}
                  />
                </Field>
                <Field label="Precio referencia"><Input type="number" min={0} step="0.01" value={fEdit.precioReferencia ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, precioReferencia: e.target.value }))} /></Field>
                <Field label="Precio vendible"><Input type="number" min={0} step="0.01" value={fEdit.precioVendible ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, precioVendible: e.target.value }))} /></Field>
                <Field label="Precio vendido"><Input type="number" min={0} step="0.01" value={fEdit.precioVendido ?? ""} onChange={e => setFEdit((p: any) => ({ ...p, precioVendido: e.target.value }))} /></Field>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={!!fEdit.formateado} onChange={e => setFEdit((p: any) => ({ ...p, formateado: e.target.checked }))} className="rounded" />
                Formateado
              </label>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalEditar(null)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleEditarInsumo} className="flex-1 btn-green rounded-lg py-2 text-sm">Guardar cambios</button>
          </div>
        </div>
      </Modal>

      {/* Modal movimiento */}
      <Modal title={`Movimiento: ${modalMov?.nombre}`} open={!!modalMov} onClose={() => setModalMov(null)} size="sm">
        <div className="space-y-4">
          <div className="rounded-lg bg-white/5 p-3 text-sm">
            Stock actual: <span className="font-bold text-brand-green">{modalMov?.stockActual} {modalMov?.unidad}</span>
          </div>
          <Field label="Tipo de movimiento">
            <AppSelect
              value={fMov.tipo}
              onChange={(v) => setFMov(p => ({ ...p, tipo: v as any }))}
              options={[
                { value: "entrada", label: "Entrada (suma stock)" },
                { value: "salida", label: "Salida (resta stock)" },
                { value: "ajuste", label: "Ajuste (fija el stock)" },
              ]}
            />
          </Field>
          <Field label="Cantidad"><Input type="number" min={1} value={fMov.cantidad} onChange={e => setFMov(p => ({ ...p, cantidad: +e.target.value }))} /></Field>
          <Field label="Motivo / Referencia"><Input value={fMov.motivo} onChange={e => setFMov(p => ({ ...p, motivo: e.target.value }))} placeholder="Ej: Compra a proveedor" /></Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalMov(null)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleMovimiento} className="flex-1 btn-green rounded-lg py-2 text-sm">Registrar</button>
          </div>
        </div>
      </Modal>

      {/* Modal QR */}
      {modalQR && <QRModal id={modalQR.id} nombre={modalQR.nombre} tipo="insumo" onClose={() => setModalQR(null)} />}
    </>
  );
}

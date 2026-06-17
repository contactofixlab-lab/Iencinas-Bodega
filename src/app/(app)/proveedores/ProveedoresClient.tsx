"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil } from "lucide-react";
import { Badge, Table, EmptyRow } from "@/components/ui";
import Modal from "@/components/Modal";
import { crearProveedor, editarProveedor } from "@/app/api/proveedores/actions";

type Proveedor = { id: string; nombre: string; rut: string | null; contacto: string | null; email: string | null; telefono: string | null; _count: { insumos: number } };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs uppercase tracking-wider text-text-soft font-medium">{label}</label>
    {children}
  </div>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

const EMPTY = { nombre: "", rut: "", contacto: "", email: "", telefono: "" };

export default function ProveedoresClient({
  proveedores, puedeCrear,
}: {
  proveedores: Proveedor[]; puedeCrear: boolean;
}) {
  const router = useRouter();
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<Proveedor | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const openEditar = (p: Proveedor) => {
    setForm({ nombre: p.nombre, rut: p.rut ?? "", contacto: p.contacto ?? "", email: p.email ?? "", telefono: p.telefono ?? "" });
    setModalEditar(p); setError("");
  };

  const handleCrear = async () => {
    setError("");
    const r = await crearProveedor({ nombre: form.nombre, rut: form.rut || undefined, contacto: form.contacto || undefined, email: form.email || undefined, telefono: form.telefono || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalCrear(false); setForm(EMPTY); router.refresh();
  };

  const handleEditar = async () => {
    if (!modalEditar) return;
    setError("");
    const r = await editarProveedor(modalEditar.id, { nombre: form.nombre, rut: form.rut || undefined, contacto: form.contacto || undefined, email: form.email || undefined, telefono: form.telefono || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalEditar(null); router.refresh();
  };

  const FormFields = () => (
    <div className="space-y-4">
      <Field label="Nombre *"><Input value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))} placeholder="Ej: Distribuidora ABC" /></Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="RUT"><Input value={form.rut} onChange={e => setForm(p => ({ ...p, rut: e.target.value }))} placeholder="76.XXX.XXX-X" /></Field>
        <Field label="Contacto"><Input value={form.contacto} onChange={e => setForm(p => ({ ...p, contacto: e.target.value }))} placeholder="Nombre contacto" /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="ventas@ejemplo.cl" /></Field>
        <Field label="Teléfono"><Input value={form.telefono} onChange={e => setForm(p => ({ ...p, telefono: e.target.value }))} placeholder="+56 9 XXXX XXXX" /></Field>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );

  return (
    <>
      {puedeCrear && (
        <div className="mb-4 flex justify-end">
          <button onClick={() => { setForm(EMPTY); setModalCrear(true); setError(""); }} className="btn-green flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
            <Plus className="h-4 w-4" /> Nuevo proveedor
          </button>
        </div>
      )}

      <Table head={["Proveedor", "RUT", "Contacto", "Email", "Teléfono", "Insumos", ""]}>
        {proveedores.length === 0 ? <EmptyRow colSpan={7} text="Sin proveedores" /> : (
          proveedores.map((p) => (
            <tr key={p.id} className="hover:bg-white/5">
              <td className="px-4 py-3 font-medium">{p.nombre}</td>
              <td className="px-4 py-3 text-text-soft">{p.rut ?? "—"}</td>
              <td className="px-4 py-3 text-text-soft">{p.contacto ?? "—"}</td>
              <td className="px-4 py-3 text-text-soft">{p.email ?? "—"}</td>
              <td className="px-4 py-3 text-text-soft">{p.telefono ?? "—"}</td>
              <td className="px-4 py-3"><Badge tone="blue">{p._count.insumos}</Badge></td>
              <td className="px-4 py-3">
                {puedeCrear && (
                  <button onClick={() => openEditar(p)} className="rounded p-1.5 hover:bg-white/10 text-text-soft hover:text-brand-blue transition-colors">
                    <Pencil className="h-4 w-4" />
                  </button>
                )}
              </td>
            </tr>
          ))
        )}
      </Table>

      <Modal title="Nuevo proveedor" open={modalCrear} onClose={() => setModalCrear(false)}>
        <div className="space-y-4">
          <FormFields />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalCrear(false)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleCrear} disabled={!form.nombre} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">Crear proveedor</button>
          </div>
        </div>
      </Modal>

      <Modal title={`Editar: ${modalEditar?.nombre}`} open={!!modalEditar} onClose={() => setModalEditar(null)}>
        <div className="space-y-4">
          <FormFields />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalEditar(null)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleEditar} disabled={!form.nombre} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">Guardar cambios</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

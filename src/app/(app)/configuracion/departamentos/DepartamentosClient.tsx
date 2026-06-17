"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Badge, Table, EmptyRow } from "@/components/ui";
import Modal from "@/components/Modal";
import { crearDepartamento, editarDepartamento, eliminarDepartamento } from "./actions";

type Departamento = {
  id: string; nombre: string; codigo: string | null; descripcion: string | null;
  responsable: string | null; centroCosto: string | null; color: string; activo: boolean;
};

const COLORES_PRESET = [
  "#84CE25", "#0671ae", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#10b981",
];

const EMPTY = {
  nombre: "", codigo: "", descripcion: "", responsable: "",
  centroCosto: "", color: "#84CE25", activo: true,
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-soft">{label}</label>
    {children}
  </div>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

export default function DepartamentosClient({
  departamentos, puedeEditar,
}: {
  departamentos: Departamento[]; puedeEditar: boolean;
}) {
  const router = useRouter();
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<Departamento | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<Departamento | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const setCheck = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.checked }));

  const openEditar = (d: Departamento) => {
    setForm({
      nombre: d.nombre, codigo: d.codigo ?? "", descripcion: d.descripcion ?? "",
      responsable: d.responsable ?? "", centroCosto: d.centroCosto ?? "",
      color: d.color, activo: d.activo,
    });
    setModalEditar(d); setError("");
  };

  const handleCrear = async () => {
    if (!form.nombre) { setError("El nombre es obligatorio"); return; }
    setError("");
    const r = await crearDepartamento({ ...form, codigo: form.codigo || undefined, descripcion: form.descripcion || undefined, responsable: form.responsable || undefined, centroCosto: form.centroCosto || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalCrear(false); setForm(EMPTY); router.refresh();
  };

  const handleEditar = async () => {
    if (!modalEditar || !form.nombre) return;
    setError("");
    const r = await editarDepartamento(modalEditar.id, { ...form, codigo: form.codigo || undefined, descripcion: form.descripcion || undefined, responsable: form.responsable || undefined, centroCosto: form.centroCosto || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalEditar(null); router.refresh();
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    await eliminarDepartamento(confirmEliminar.id);
    setConfirmEliminar(null); router.refresh();
  };

  const FormFields = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre *">
          <Input value={form.nombre} onChange={set("nombre")} placeholder="Ej: Tecnología" />
        </Field>
        <Field label="Código corto">
          <Input value={form.codigo} onChange={set("codigo")} placeholder="TI" maxLength={8} />
        </Field>
      </div>
      <Field label="Descripción">
        <textarea
          value={form.descripcion}
          onChange={(e) => setForm(p => ({ ...p, descripcion: e.target.value }))}
          rows={2}
          placeholder="¿Qué hace este departamento?"
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all resize-none"
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Responsable / Jefe">
          <Input value={form.responsable} onChange={set("responsable")} placeholder="Nombre del jefe" />
        </Field>
        <Field label="Centro de costo">
          <Input value={form.centroCosto} onChange={set("centroCosto")} placeholder="CC-001" />
        </Field>
      </div>
      <Field label="Color identificador">
        <div className="flex items-center gap-2 flex-wrap">
          {COLORES_PRESET.map(c => (
            <button
              key={c}
              onClick={() => setForm(p => ({ ...p, color: c }))}
              className={`h-7 w-7 rounded-full border-2 transition-all ${form.color === c ? "border-white scale-110" : "border-transparent opacity-70 hover:opacity-100"}`}
              style={{ backgroundColor: c }}
            />
          ))}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="color"
              value={form.color}
              onChange={set("color")}
              className="h-7 w-7 rounded cursor-pointer bg-transparent border-0"
            />
            <span className="text-xs text-text-soft">{form.color}</span>
          </div>
        </div>
      </Field>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={form.activo} onChange={setCheck("activo")}
          className="h-4 w-4 rounded border-white/20 bg-white/5 accent-brand-green" />
        <span className="text-sm text-text-soft">Departamento activo</span>
      </label>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );

  return (
    <>
      {puedeEditar && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => { setForm(EMPTY); setModalCrear(true); setError(""); }}
            className="btn-green flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
          >
            <Plus className="h-4 w-4" /> Nuevo departamento
          </button>
        </div>
      )}

      <Table head={["Departamento", "Código", "Responsable", "Centro costo", "Estado", ""]}>
        {departamentos.length === 0
          ? <EmptyRow colSpan={6} text="Sin departamentos registrados" />
          : departamentos.map(d => (
            <tr key={d.id} className="hover:bg-white/5">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="h-3 w-3 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <div>
                    <p className="font-medium">{d.nombre}</p>
                    {d.descripcion && <p className="text-xs text-text-soft/60 mt-0.5 max-w-xs truncate">{d.descripcion}</p>}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                {d.codigo
                  ? <span className="rounded-md bg-white/8 px-2 py-0.5 text-xs font-mono font-semibold text-text-soft">{d.codigo}</span>
                  : <span className="text-text-soft/40">—</span>}
              </td>
              <td className="px-4 py-3 text-text-soft text-sm">{d.responsable ?? "—"}</td>
              <td className="px-4 py-3 text-text-soft text-sm">{d.centroCosto ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge tone={d.activo ? "green" : "gray"}>{d.activo ? "Activo" : "Inactivo"}</Badge>
              </td>
              <td className="px-4 py-3">
                {puedeEditar && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditar(d)} className="rounded p-1.5 hover:bg-white/10 text-text-soft hover:text-brand-blue transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setConfirmEliminar(d)} className="rounded p-1.5 hover:bg-red-500/10 text-text-soft hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
      </Table>

      <Modal title="Nuevo departamento" open={modalCrear} onClose={() => setModalCrear(false)}>
        <div className="space-y-4">
          <FormFields />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalCrear(false)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleCrear} disabled={!form.nombre} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">Crear departamento</button>
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

      <Modal title="¿Eliminar departamento?" open={!!confirmEliminar} onClose={() => setConfirmEliminar(null)}>
        <div className="space-y-4">
          <p className="text-sm text-text-soft">
            Se eliminará el departamento <strong className="text-white">{confirmEliminar?.nombre}</strong>. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setConfirmEliminar(null)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleEliminar} className="btn-danger flex-1 rounded-lg py-2 text-sm">Eliminar</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

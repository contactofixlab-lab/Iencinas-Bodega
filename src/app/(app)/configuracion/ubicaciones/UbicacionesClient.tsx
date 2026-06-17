"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, MapPin, Star } from "lucide-react";
import { Badge, Table, EmptyRow } from "@/components/ui";
import AppSelect from "@/components/AppSelect";
import Modal from "@/components/Modal";
import { crearUbicacion, editarUbicacion, eliminarUbicacion } from "./actions";

type Ubicacion = {
  id: string; nombre: string; tipo: string;
  direccion: string | null; numero: string | null; piso: string | null;
  referencia: string | null; pais: string; region: string | null;
  ciudad: string | null; comuna: string | null; telefono: string | null;
  responsable: string | null; esSedePrincipal: boolean; activa: boolean;
};

export const TIPOS_UBICACION = [
  { value: "sede_principal",      label: "Sede principal / Casa matriz" },
  { value: "sucursal",            label: "Sucursal" },
  { value: "bodega",              label: "Bodega / Almacén" },
  { value: "oficina",             label: "Oficina" },
  { value: "local_comercial",     label: "Local comercial" },
  { value: "sala_ventas",         label: "Sala de ventas" },
  { value: "centro_distribucion", label: "Centro de distribución" },
  { value: "punto_retiro",        label: "Punto de retiro" },
  { value: "casa",                label: "Casa / Domicilio" },
  { value: "departamento",        label: "Departamento" },
];

const EMPTY = {
  nombre: "", tipo: "oficina", direccion: "", numero: "", piso: "", referencia: "",
  pais: "Chile", region: "", ciudad: "", comuna: "", telefono: "", responsable: "",
  esSedePrincipal: false, activa: true,
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

function tipoLabel(tipo: string) {
  return TIPOS_UBICACION.find(t => t.value === tipo)?.label ?? tipo;
}

export default function UbicacionesClient({
  ubicaciones, puedeEditar,
}: {
  ubicaciones: Ubicacion[]; puedeEditar: boolean;
}) {
  const router = useRouter();
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState<Ubicacion | null>(null);
  const [confirmEliminar, setConfirmEliminar] = useState<Ubicacion | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));
  const setCheck = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.checked }));

  const openEditar = (u: Ubicacion) => {
    setForm({
      nombre: u.nombre, tipo: u.tipo, direccion: u.direccion ?? "", numero: u.numero ?? "",
      piso: u.piso ?? "", referencia: u.referencia ?? "", pais: u.pais, region: u.region ?? "",
      ciudad: u.ciudad ?? "", comuna: u.comuna ?? "", telefono: u.telefono ?? "",
      responsable: u.responsable ?? "", esSedePrincipal: u.esSedePrincipal, activa: u.activa,
    });
    setModalEditar(u); setError("");
  };

  const handleCrear = async () => {
    if (!form.nombre) { setError("El nombre es obligatorio"); return; }
    setError("");
    const r = await crearUbicacion({ ...form, direccion: form.direccion || undefined, numero: form.numero || undefined, piso: form.piso || undefined, referencia: form.referencia || undefined, region: form.region || undefined, ciudad: form.ciudad || undefined, comuna: form.comuna || undefined, telefono: form.telefono || undefined, responsable: form.responsable || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalCrear(false); setForm(EMPTY); router.refresh();
  };

  const handleEditar = async () => {
    if (!modalEditar || !form.nombre) return;
    setError("");
    const r = await editarUbicacion(modalEditar.id, { ...form, direccion: form.direccion || undefined, numero: form.numero || undefined, piso: form.piso || undefined, referencia: form.referencia || undefined, region: form.region || undefined, ciudad: form.ciudad || undefined, comuna: form.comuna || undefined, telefono: form.telefono || undefined, responsable: form.responsable || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalEditar(null); router.refresh();
  };

  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    await eliminarUbicacion(confirmEliminar.id);
    setConfirmEliminar(null); router.refresh();
  };

  const FormFields = () => (
    <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Nombre *">
          <Input value={form.nombre} onChange={set("nombre")} placeholder="Ej: Bodega Central" />
        </Field>
        <Field label="Tipo">
          <AppSelect
            value={form.tipo}
            onChange={(v) => setForm(p => ({ ...p, tipo: v }))}
            options={TIPOS_UBICACION}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Dirección">
          <Input value={form.direccion} onChange={set("direccion")} placeholder="Calle / Av." />
        </Field>
        <Field label="Número">
          <Input value={form.numero} onChange={set("numero")} placeholder="1234" />
        </Field>
        <Field label="Piso / Oficina">
          <Input value={form.piso} onChange={set("piso")} placeholder="Piso 3, Of. 301" />
        </Field>
        <Field label="Referencia">
          <Input value={form.referencia} onChange={set("referencia")} placeholder="Frente al mall…" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="País">
          <Input value={form.pais} onChange={set("pais")} placeholder="Chile" />
        </Field>
        <Field label="Región">
          <Input value={form.region} onChange={set("region")} placeholder="Metropolitana" />
        </Field>
        <Field label="Ciudad">
          <Input value={form.ciudad} onChange={set("ciudad")} placeholder="Santiago" />
        </Field>
        <Field label="Comuna">
          <Input value={form.comuna} onChange={set("comuna")} placeholder="Las Condes" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Teléfono">
          <Input value={form.telefono} onChange={set("telefono")} placeholder="+56 2 XXXX XXXX" />
        </Field>
        <Field label="Responsable">
          <Input value={form.responsable} onChange={set("responsable")} placeholder="Nombre del encargado" />
        </Field>
      </div>
      <div className="flex items-center gap-6 pt-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.esSedePrincipal} onChange={setCheck("esSedePrincipal")}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-brand-green" />
          <span className="text-sm text-text-soft">Sede principal</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.activa} onChange={setCheck("activa")}
            className="h-4 w-4 rounded border-white/20 bg-white/5 accent-brand-green" />
          <span className="text-sm text-text-soft">Activa</span>
        </label>
      </div>
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
            <Plus className="h-4 w-4" /> Nueva ubicación
          </button>
        </div>
      )}

      <Table head={["Nombre", "Tipo", "Dirección", "Ciudad / Comuna", "Responsable", "Estado", ""]}>
        {ubicaciones.length === 0
          ? <EmptyRow colSpan={7} text="Sin ubicaciones registradas" />
          : ubicaciones.map(u => (
            <tr key={u.id} className="hover:bg-white/5">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {u.esSedePrincipal && <Star className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />}
                  <span className="font-medium">{u.nombre}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-text-soft text-sm">{tipoLabel(u.tipo)}</td>
              <td className="px-4 py-3 text-text-soft text-sm">
                {[u.direccion, u.numero].filter(Boolean).join(" ") || "—"}
              </td>
              <td className="px-4 py-3 text-text-soft text-sm">
                {[u.ciudad, u.comuna].filter(Boolean).join(", ") || "—"}
              </td>
              <td className="px-4 py-3 text-text-soft text-sm">{u.responsable ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge tone={u.activa ? "green" : "gray"}>{u.activa ? "Activa" : "Inactiva"}</Badge>
              </td>
              <td className="px-4 py-3">
                {puedeEditar && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => openEditar(u)} className="rounded p-1.5 hover:bg-white/10 text-text-soft hover:text-brand-blue transition-colors">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => setConfirmEliminar(u)} className="rounded p-1.5 hover:bg-red-500/10 text-text-soft hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
      </Table>

      <Modal title="Nueva ubicación" open={modalCrear} onClose={() => setModalCrear(false)}>
        <div className="space-y-4">
          <FormFields />
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalCrear(false)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleCrear} disabled={!form.nombre} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">Crear ubicación</button>
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

      <Modal title="¿Eliminar ubicación?" open={!!confirmEliminar} onClose={() => setConfirmEliminar(null)}>
        <div className="space-y-4">
          <p className="text-sm text-text-soft">
            Se eliminará <strong className="text-white">{confirmEliminar?.nombre}</strong>. Esta acción no se puede deshacer.
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

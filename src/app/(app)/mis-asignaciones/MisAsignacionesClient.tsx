"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui";
import Modal from "@/components/Modal";
import { crearSolicitud } from "@/app/api/asignaciones/actions";

type Insumo = { id: string; nombre: string; stockActual: number; unidad: string };
type Solicitud = {
  id: string; fecha: string; estado: string; comentarioAdmin: string | null;
  items: Array<{ id: string; cantidad: number; justificacion: string | null; insumo: { nombre: string } }>;
};

const estadoTone: Record<string, "amber"|"green"|"red"|"blue"> = {
  pendiente: "amber", aprobada: "green", rechazada: "red", entregada: "blue",
};
const fmt = (d: string) => new Date(d).toLocaleDateString("es-CL");

const Sel = (props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) => (
  <select {...props} className="w-full rounded-lg bg-bg-base border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none transition-all">
    {props.children}
  </select>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

export default function MisAsignacionesClient({
  solicitudes, insumos,
}: {
  solicitudes: Solicitud[]; insumos: Insumo[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  type Item = { insumoId: string; cantidad: number; justificacion: string };
  const [items, setItems] = useState<Item[]>([{ insumoId: insumos[0]?.id ?? "", cantidad: 1, justificacion: "" }]);

  const agregarItem = () => setItems(p => [...p, { insumoId: insumos[0]?.id ?? "", cantidad: 1, justificacion: "" }]);
  const quitarItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));
  const setItem = (i: number, key: keyof Item, val: any) => setItems(p => p.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  const handleSolicitar = async () => {
    setError(""); setLoading(true);
    const r = await crearSolicitud(items.map(it => ({ ...it, justificacion: it.justificacion || undefined })));
    setLoading(false);
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModal(false);
    setItems([{ insumoId: insumos[0]?.id ?? "", cantidad: 1, justificacion: "" }]);
    router.refresh();
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button onClick={() => { setModal(true); setError(""); }} className="btn-green flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
          <Plus className="h-4 w-4" /> Solicitar insumo
        </button>
      </div>

      <div className="space-y-3">
        {solicitudes.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-text-soft">No has hecho solicitudes</div>
        ) : (
          solicitudes.map((s) => (
            <div key={s.id} className="glass card-3d rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-soft">{fmt(s.fecha)}</span>
                <Badge tone={estadoTone[s.estado] ?? "gray"}>{s.estado}</Badge>
              </div>
              <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
                {s.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4">
                    <span>{it.cantidad}× {it.insumo.nombre}</span>
                    {it.justificacion && <span className="text-text-soft">{it.justificacion}</span>}
                  </li>
                ))}
              </ul>
              {s.comentarioAdmin && (
                <p className="mt-2 text-xs rounded-lg bg-white/5 px-3 py-2 text-text-soft">
                  Respuesta: {s.comentarioAdmin}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      <Modal title="Solicitar insumos" open={modal} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <p className="text-sm text-text-soft">Agrega los insumos que necesitas. El administrador recibirá tu solicitud para aprobarla.</p>
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div key={idx} className="rounded-lg border border-white/10 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-soft font-medium uppercase tracking-wider">Ítem {idx + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => quitarItem(idx)} className="text-red-400 hover:text-red-300 p-1 rounded transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <Sel value={it.insumoId} onChange={e => setItem(idx, "insumoId", e.target.value)}>
                  {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </Sel>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" min={1} value={it.cantidad} onChange={e => setItem(idx, "cantidad", +e.target.value)} placeholder="Cantidad" />
                  <Input value={it.justificacion} onChange={e => setItem(idx, "justificacion", e.target.value)} placeholder="Justificación (opcional)" />
                </div>
              </div>
            ))}
          </div>
          <button onClick={agregarItem} className="w-full rounded-lg border border-dashed border-white/20 py-2 text-sm text-text-soft hover:border-brand-green/50 hover:text-brand-green transition-colors">
            + Agregar otro insumo
          </button>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 rounded-lg border border-white/20 py-2 text-sm hover:bg-white/10 transition-colors">Cancelar</button>
            <button onClick={handleSolicitar} disabled={loading || !items.length} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">
              {loading ? "Enviando..." : "Enviar solicitud"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

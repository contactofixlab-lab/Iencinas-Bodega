"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, X } from "@/components/icons";
import { Badge, Table, EmptyRow } from "@/components/ui";
import AppSelect from "@/components/AppSelect";
import Modal from "@/components/Modal";
import { crearAsignacion, aprobarSolicitud, rechazarSolicitud } from "@/app/api/asignaciones/actions";

type Colaborador = { id: string; nombre: string; apellidoPaterno: string; area: string | null };
type Insumo = { id: string; nombre: string; stockActual: number; unidad: string };
type Asignacion = {
  id: string; fechaAsignacion: string; cantidad: number; numeroSerie: string | null;
  estado: string; entregadoPor: string | null; observaciones: string | null;
  colaborador: { nombre: string; apellidoPaterno: string };
  insumo: { nombre: string };
};
type Solicitud = {
  id: string; fecha: string; estado: string; comentarioAdmin: string | null;
  colaborador: { nombre: string; apellidoPaterno: string };
  items: Array<{ id: string; cantidad: number; justificacion: string | null; insumo: { nombre: string } }>;
};

const estadoTone: Record<string, "amber"|"green"|"red"|"blue"> = {
  pendiente: "amber", aprobada: "green", rechazada: "red", entregada: "blue",
};
const fmt = (d: string) => new Date(d).toLocaleDateString("es-CL");

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs uppercase tracking-wider text-text-soft font-medium">{label}</label>
    {children}
  </div>
);
const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

export default function AsignacionesClient({
  asignaciones, solicitudes, colaboradores, insumos, puedeAsignar, puedeAprobar, activeTab = "asignar",
}: {
  asignaciones: Asignacion[]; solicitudes: Solicitud[];
  colaboradores: Colaborador[]; insumos: Insumo[];
  puedeAsignar: boolean; puedeAprobar: boolean; activeTab?: "asignar" | "solicitudes";
}) {
  const router = useRouter();
  const refresh = () => router.refresh();

  const [modalAsignar, setModalAsignar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState<string | null>(null);
  const [comentario, setComentario] = useState("");
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const [fAsig, setFAsig] = useState({
    colaboradorId: colaboradores[0]?.id ?? "",
    insumoId: insumos[0]?.id ?? "",
    cantidad: 1, numeroSerie: "", observaciones: "",
  });

  const handleAsignar = async () => {
    setError("");
    const r = await crearAsignacion({ ...fAsig, numeroSerie: fAsig.numeroSerie || undefined, observaciones: fAsig.observaciones || undefined });
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModalAsignar(false);
    setFAsig({ colaboradorId: colaboradores[0]?.id ?? "", insumoId: insumos[0]?.id ?? "", cantidad: 1, numeroSerie: "", observaciones: "" });
    refresh();
  };

  const handleAprobar = async (id: string) => {
    setLoadingId(id);
    const r = await aprobarSolicitud(id);
    setLoadingId(null);
    if (!r.success) { alert(r.error); return; }
    refresh();
  };

  const handleRechazar = async () => {
    if (!modalRechazar) return;
    setLoadingId(modalRechazar);
    const r = await rechazarSolicitud(modalRechazar, comentario);
    setLoadingId(null);
    setModalRechazar(null);
    setComentario("");
    if (!r.success) { alert(r.error); return; }
    refresh();
  };

  const insumoSeleccionado = insumos.find(i => i.id === fAsig.insumoId);

  return (
    <>
      {/* Asignar / Historial */}
      {activeTab === "asignar" && <div>
        {puedeAsignar && (
          <div className="mb-4 flex justify-end">
            <button onClick={() => { setModalAsignar(true); setError(""); }} className="btn-green flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
              <Plus className="h-4 w-4" /> Asignar insumo
            </button>
          </div>
        )}
        <Table head={["Fecha", "Colaborador", "Insumo", "Cant.", "Serie", "Estado", "Entregó"]}>
          {asignaciones.length === 0 ? <EmptyRow colSpan={7} text="Sin asignaciones" /> : (
            asignaciones.map((a) => (
              <tr key={a.id} className="hover:bg-white/5">
                <td className="px-4 py-3 text-text-soft">{fmt(a.fechaAsignacion)}</td>
                <td className="px-4 py-3 font-medium">{a.colaborador.nombre} {a.colaborador.apellidoPaterno}</td>
                <td className="px-4 py-3">{a.insumo.nombre}</td>
                <td className="px-4 py-3">{a.cantidad}</td>
                <td className="px-4 py-3 text-text-soft">{a.numeroSerie ?? "—"}</td>
                <td className="px-4 py-3"><Badge tone={a.estado === "vigente" ? "green" : "gray"}>{a.estado}</Badge></td>
                <td className="px-4 py-3 text-text-soft">{a.entregadoPor ?? "—"}</td>
              </tr>
            ))
          )}
        </Table>
      </div>}

      {/* Solicitudes */}
      {activeTab === "solicitudes" && <div className="space-y-3">
        {solicitudes.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-text-soft">Sin solicitudes pendientes</div>
        ) : (
          solicitudes.map((s) => (
            <div key={s.id} className="glass card-3d rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-medium">{s.colaborador.nombre} {s.colaborador.apellidoPaterno}</span>
                  <span className="ml-2 text-sm text-text-soft">{fmt(s.fecha)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={estadoTone[s.estado] ?? "gray"}>{s.estado}</Badge>
                  {puedeAprobar && s.estado === "pendiente" && (
                    <>
                      <button
                        onClick={() => handleAprobar(s.id)}
                        disabled={loadingId === s.id}
                        className="btn-green flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> {loadingId === s.id ? "..." : "Aprobar"}
                      </button>
                      <button
                        onClick={() => { setModalRechazar(s.id); setComentario(""); }}
                        className="btn-danger flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs"
                      >
                        <X className="h-3.5 w-3.5" /> Rechazar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <ul className="mt-3 space-y-1 border-t border-white/10 pt-3 text-sm">
                {s.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-4">
                    <span>{it.cantidad}× {it.insumo.nombre}</span>
                    {it.justificacion && <span className="text-text-soft">{it.justificacion}</span>}
                  </li>
                ))}
              </ul>
              {s.comentarioAdmin && <p className="mt-2 text-xs text-text-soft border-t border-white/10 pt-2">Respuesta admin: {s.comentarioAdmin}</p>}
            </div>
          ))
        )}
      </div>}

      {/* Modal asignar insumo */}
      <Modal title="Asignar insumo a colaborador" open={modalAsignar} onClose={() => setModalAsignar(false)}>
        <div className="space-y-4">
          <Field label="Colaborador">
            <AppSelect
              value={fAsig.colaboradorId}
              onChange={(v) => setFAsig(p => ({ ...p, colaboradorId: v }))}
              options={colaboradores.map(c => ({ value: c.id, label: `${c.nombre} ${c.apellidoPaterno}${c.area ? ` (${c.area})` : ""}` }))}
            />
          </Field>
          <Field label="Insumo">
            <AppSelect
              value={fAsig.insumoId}
              onChange={(v) => setFAsig(p => ({ ...p, insumoId: v }))}
              options={insumos.map(i => ({ value: i.id, label: `${i.nombre} — Stock: ${i.stockActual} ${i.unidad}` }))}
            />
          </Field>
          {insumoSeleccionado && (
            <div className="rounded-lg bg-white/5 p-3 text-xs text-text-soft">
              Disponible: <span className={`font-bold ${insumoSeleccionado.stockActual <= 0 ? "text-red-400" : "text-brand-green"}`}>{insumoSeleccionado.stockActual} {insumoSeleccionado.unidad}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cantidad"><Input type="number" min={1} max={insumoSeleccionado?.stockActual ?? 999} value={fAsig.cantidad} onChange={e => setFAsig(p => ({ ...p, cantidad: +e.target.value }))} /></Field>
            <Field label="N° de serie (opcional)"><Input value={fAsig.numeroSerie} onChange={e => setFAsig(p => ({ ...p, numeroSerie: e.target.value }))} placeholder="SN-12345" /></Field>
          </div>
          <Field label="Observaciones"><Input value={fAsig.observaciones} onChange={e => setFAsig(p => ({ ...p, observaciones: e.target.value }))} placeholder="Observaciones opcionales" /></Field>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalAsignar(false)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleAsignar} disabled={!fAsig.colaboradorId || !fAsig.insumoId} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">Asignar</button>
          </div>
        </div>
      </Modal>

      {/* Modal rechazar */}
      <Modal title="Rechazar solicitud" open={!!modalRechazar} onClose={() => setModalRechazar(null)} size="sm">
        <div className="space-y-4">
          <Field label="Motivo de rechazo (opcional)">
            <Input value={comentario} onChange={e => setComentario(e.target.value)} placeholder="Ej: Stock insuficiente" />
          </Field>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalRechazar(null)} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
            <button onClick={handleRechazar} disabled={loadingId !== null} className="btn-danger flex-1 rounded-lg py-2 text-sm disabled:opacity-50">Rechazar solicitud</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

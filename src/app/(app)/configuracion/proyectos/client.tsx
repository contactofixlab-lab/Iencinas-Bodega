"use client";

import { useState } from "react";
import { FolderOpen, Plus, Pencil, Trash2, X, Check, Hash, FileText, ExternalLink } from "lucide-react";
import type { Proyecto } from "@prisma/client";
import { crearProyecto, actualizarProyecto, eliminarProyecto } from "./actions";

type Vista = "lista" | "nuevo" | "editar";

export default function ProyectosClient({ proyectos: inicial }: { proyectos: Proyecto[] }) {
  const [proyectos, setProyectos] = useState(inicial);
  const [vista, setVista] = useState<Vista>("lista");
  const [editando, setEditando] = useState<Proyecto | null>(null);
  const [form, setForm] = useState({ nombre: "", descripcion: "", codigoExterno: "" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function abrirNuevo() {
    setForm({ nombre: "", descripcion: "", codigoExterno: "" });
    setEditando(null);
    setVista("nuevo");
    setError(null);
  }

  function abrirEditar(p: Proyecto) {
    setForm({ nombre: p.nombre, descripcion: p.descripcion ?? "", codigoExterno: p.codigoExterno ?? "" });
    setEditando(p);
    setVista("editar");
    setError(null);
  }

  function cerrar() {
    setVista("lista");
    setEditando(null);
    setError(null);
  }

  async function guardar() {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setLoading(true);
    setError(null);
    try {
      if (vista === "nuevo") {
        const res = await crearProyecto(form);
        if (!res.success) { setError(res.error); return; }
        setProyectos((prev) => [...prev, res.data!]);
      } else if (editando) {
        const res = await actualizarProyecto(editando.id, { ...form, activo: editando.activo });
        if (!res.success) { setError(res.error); return; }
        setProyectos((prev) => prev.map((p) => (p.id === editando.id ? res.data! : p)));
      }
      cerrar();
    } finally {
      setLoading(false);
    }
  }

  async function toggleActivo(p: Proyecto) {
    const res = await actualizarProyecto(p.id, { nombre: p.nombre, descripcion: p.descripcion ?? "", codigoExterno: p.codigoExterno ?? "", activo: !p.activo });
    if (res.success) setProyectos((prev) => prev.map((x) => (x.id === p.id ? res.data! : x)));
  }

  async function borrar(id: string) {
    setLoading(true);
    const res = await eliminarProyecto(id);
    if (res.success) {
      setProyectos((prev) => prev.filter((p) => p.id !== id));
      setConfirmDelete(null);
    } else {
      setError(res.error ?? "Error al eliminar");
    }
    setLoading(false);
  }

  const formulario = vista !== "lista";

  return (
    <div className="space-y-5">
      {/* Header acción */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-soft">
          {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""} registrado{proyectos.length !== 1 ? "s" : ""}
        </p>
        {!formulario && (
          <button onClick={abrirNuevo} className="btn-green flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm">
            <Plus className="h-4 w-4" />
            Nuevo proyecto
          </button>
        )}
      </div>

      {/* Formulario nuevo / editar */}
      {formulario && (
        <div className="glass-strong rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-foreground">{vista === "nuevo" ? "Nuevo Proyecto" : "Editar Proyecto"}</h3>
            <button onClick={cerrar} className="rounded-lg p-1.5 hover:bg-white/10 text-text-soft hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Nombre */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-soft">
                <FolderOpen className="h-3.5 w-3.5 text-brand-green" />
                Nombre del proyecto *
              </label>
              <input
                autoFocus
                value={form.nombre}
                onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                placeholder="Ej: Torre Iencinas — Fase 1"
                className="input-glass"
              />
            </div>

            {/* Código externo (Movisuite) */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-soft">
                <Hash className="h-3.5 w-3.5 text-brand-green" />
                Código Movisuite
                <span className="ml-1 rounded border border-brand-blue/30 bg-brand-blue/10 px-1.5 py-0.5 text-[9px] font-bold text-brand-blue-bright uppercase tracking-wider">
                  API mañana
                </span>
              </label>
              <input
                value={form.codigoExterno}
                onChange={(e) => setForm((f) => ({ ...f, codigoExterno: e.target.value }))}
                placeholder="Se asignará al sincronizar"
                className="input-glass"
              />
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-text-soft">
                <FileText className="h-3.5 w-3.5 text-brand-green" />
                Descripción
              </label>
              <input
                value={form.descripcion}
                onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción breve (opcional)"
                className="input-glass"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={guardar} disabled={loading} className="btn-green flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm disabled:opacity-60">
              <Check className="h-4 w-4" />
              {loading ? "Guardando…" : "Guardar"}
            </button>
            <button onClick={cerrar} className="btn-ghost flex-1 rounded-xl py-2.5 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">Proyecto</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">Código</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">Estado</th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {proyectos.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5">
                        <FolderOpen className="h-5 w-5 text-text-soft/30" />
                      </div>
                      <p className="text-sm text-text-soft/50">No hay proyectos registrados</p>
                      <p className="text-xs text-text-soft/30">Crea uno manualmente o espera la sincronización con Movisuite</p>
                    </div>
                  </td>
                </tr>
              )}
              {proyectos.map((p) => (
                <tr key={p.id} className="group transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-brand-green/20 bg-brand-green/10">
                        <FolderOpen className="h-4 w-4 text-brand-green" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{p.nombre}</p>
                        {p.descripcion && <p className="text-xs text-text-soft/60">{p.descripcion}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {p.codigoExterno ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-brand-blue/30 bg-brand-blue/10 px-2.5 py-1 text-xs font-mono text-brand-blue-bright">
                        <ExternalLink className="h-3 w-3" />
                        {p.codigoExterno}
                      </span>
                    ) : (
                      <span className="text-xs text-text-soft/40 italic">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleActivo(p)} className="group/toggle flex items-center gap-1.5">
                      <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] transition-all ${p.activo ? "bg-brand-green/20 text-brand-green" : "bg-white/5 text-text-soft/30"}`}>
                        {p.activo ? "●" : "○"}
                      </span>
                      <span className={`text-xs font-medium ${p.activo ? "text-brand-green" : "text-text-soft/40"}`}>
                        {p.activo ? "Activo" : "Inactivo"}
                      </span>
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    {confirmDelete === p.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400">¿Eliminar?</span>
                        <button onClick={() => borrar(p.id)} disabled={loading} className="btn-danger rounded-lg px-2.5 py-1 text-xs disabled:opacity-50">
                          Sí
                        </button>
                        <button onClick={() => setConfirmDelete(null)} className="btn-ghost rounded-lg px-2.5 py-1 text-xs">
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={() => abrirEditar(p)} className="rounded-lg p-1.5 hover:bg-brand-blue/20 text-text-soft hover:text-brand-blue-bright transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => setConfirmDelete(p.id)} className="rounded-lg p-1.5 hover:bg-red-500/20 text-text-soft hover:text-red-400 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Aviso Movisuite */}
      <div className="flex items-start gap-3 rounded-xl border border-brand-blue/20 bg-brand-blue/[0.07] px-4 py-3">
        <ExternalLink className="h-4 w-4 flex-shrink-0 text-brand-blue-bright mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-brand-blue-bright">Integración Movisuite pendiente</p>
          <p className="mt-0.5 text-xs text-text-soft/60">
            Mañana se conectará la API de Movisuite para sincronizar proyectos automáticamente.
            Los proyectos creados manualmente hoy se conservarán.
          </p>
        </div>
      </div>
    </div>
  );
}

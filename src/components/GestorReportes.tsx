"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Eye, Download, Loader2, Table2, X, Check,
  FileText, Link2, ChevronDown, ChevronUp,
} from "@/components/icons";
import { previsualizarConEntidades } from "@/app/api/reportes/actions";
import {
  ENTIDADES_INFO, ESTRATEGIA_GRUPOS, ESTRATEGIA_CUBRE,
  ESTRATEGIA_LABELS, COLUMNAS_DEFAULT, resolverEstrategia,
  type EntidadKey, type EstrategiaKey,
} from "@/lib/reportes-config";
import ReportesDisponiblesGrid from "@/components/ReportesDisponiblesGrid";

type Preview = { columnas: string[]; filas: Record<string, string>[] };

const LIMITES = [10, 25, 50, 100];
const TODAS_ENTIDADES = Object.keys(ENTIDADES_INFO) as EntidadKey[];

function aplanarGrupos(estrategia: EstrategiaKey) {
  const grupos = ESTRATEGIA_GRUPOS[estrategia];
  const mapa: Record<string, string> = {};
  Object.values(grupos).forEach((g) => Object.assign(mapa, g.columnas));
  return mapa;
}

function cellClass(label: string, val: string) {
  const l = label.toLowerCase();
  if (!l.includes("estado") && !l.includes("stock")) return "";
  if (val.includes("Bajo") || val === "rechazada" || val === "baja") return "text-amber-400 font-medium";
  if (["✓ OK", "activo", "aprobada", "vigente", "entregada"].includes(val)) return "text-brand-green font-medium";
  if (val === "pendiente") return "text-yellow-300 font-medium";
  return "";
}

export default function GestorReportes() {
  const [nombre, setNombre] = useState("");
  const [entidades, setEntidades] = useState<EntidadKey[]>(["insumos"]);
  const [columnas, setColumnas] = useState<string[]>(COLUMNAS_DEFAULT["insumos"]);
  const [limite, setLimite] = useState(25);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [descargando, setDescargando] = useState<string | null>(null);
  const [colsCollapsed, setColsCollapsed] = useState(false);

  const estrategia = useMemo(() => resolverEstrategia(entidades), [entidades]);
  const grupos = ESTRATEGIA_GRUPOS[estrategia];
  const mapaCol = useMemo(() => aplanarGrupos(estrategia), [estrategia]);
  const totalCols = Object.keys(mapaCol).length;
  const entidadesCubiertas = ESTRATEGIA_CUBRE[estrategia];

  useEffect(() => {
    setColumnas(COLUMNAS_DEFAULT[estrategia] ?? []);
    setPreview(null);
  }, [estrategia]);

  const toggleEntidad = (e: EntidadKey) =>
    setEntidades((prev) =>
      prev.includes(e)
        ? prev.length > 1 ? prev.filter((x) => x !== e) : prev
        : [...prev, e]
    );

  const toggleCol = (key: string) =>
    setColumnas((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );

  const toggleTodas = () =>
    setColumnas(columnas.length === totalCols ? [] : Object.keys(mapaCol));

  const handlePreview = async () => {
    if (!columnas.length) return;
    setLoading(true);
    try {
      const result = await previsualizarConEntidades(estrategia, columnas, limite);
      setPreview(result);
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (formato: "pdf" | "excel" | "csv") => {
    if (!columnas.length) return;
    setDescargando(formato);
    try {
      const res = await fetch("/api/reportes/personalizado", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estrategia, columnas, formato,
          titulo: nombre || `Reporte ${ESTRATEGIA_LABELS[estrategia]}`,
        }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${nombre || `Reporte_${estrategia}`}_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* ── FILA SUPERIOR: Vista previa (izq) + Generador (derecha) ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ─── VISTA PREVIA (IZQUIERDA) ───────────────────────────────────── */}
        <div className="glass-strong rounded-2xl overflow-hidden" style={{ minHeight: "520px" }}>

        {/* Vacío */}
        {!preview && !loading && (
          <div
            className="flex flex-col items-center justify-center text-center text-text-soft"
            style={{ minHeight: "520px" }}
          >
            <Table2 className="h-16 w-16 mb-4 opacity-[0.07]" />
            <p className="text-sm font-medium text-white/40">Vista previa vacía</p>
            <p className="text-xs mt-1.5 text-text-soft/40">
              {columnas.length === 0
                ? "Selecciona al menos una columna"
                : `${columnas.length} columna${columnas.length !== 1 ? "s" : ""} listas — pulsa Previsualizar`}
            </p>
          </div>
        )}

        {/* Cargando */}
        {loading && (
          <div
            className="flex flex-col items-center justify-center"
            style={{ minHeight: "520px" }}
          >
            <Loader2 className="h-10 w-10 animate-spin text-brand-green mb-3" />
            <p className="text-sm text-text-soft">Consultando base de datos…</p>
          </div>
        )}

        {/* Tabla */}
        {preview && !loading && (
          <div className="flex flex-col h-full">
            {/* Barra superior */}
            <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="h-2 w-2 rounded-full bg-brand-green flex-shrink-0" />
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-green whitespace-nowrap">
                  {ESTRATEGIA_LABELS[estrategia]}
                </span>
                <span className="text-xs text-text-soft whitespace-nowrap">
                  · {preview.filas.length} registros · {preview.columnas.length} columnas
                </span>
              </div>
              <button
                onClick={() => setPreview(null)}
                className="rounded p-1 text-text-soft hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Contenido */}
            {preview.filas.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-16 text-sm text-text-soft/60">
                Sin registros para esta combinación
              </div>
            ) : (
              <div className="overflow-auto flex-1" style={{ maxHeight: "440px" }}>
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#04121d] border-b border-white/10">
                      {preview.columnas.map((col) => (
                        <th
                          key={col}
                          className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-soft whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {preview.filas.map((fila, idx) => (
                      <tr key={idx} className="hover:bg-white/4 transition-colors">
                        {preview.columnas.map((col) => (
                          <td
                            key={col}
                            className={`px-4 py-2.5 whitespace-nowrap text-sm ${cellClass(col, fila[col] ?? "")}`}
                          >
                            {fila[col] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Barra inferior */}
            <div className="flex items-center justify-between px-5 py-2.5 bg-white/3 border-t border-white/10 flex-shrink-0">
              <p className="text-[11px] text-text-soft/60">
                Vista previa:{" "}
                <strong className="text-white/70">{preview.filas.length}</strong> filas ·
                La descarga incluye{" "}
                <strong className="text-white/70">todos</strong> los registros
              </p>
              <div className="flex items-center gap-3">
                {(["pdf", "excel", "csv"] as const).map((fmt, i) => (
                  <span key={fmt} className="flex items-center gap-3">
                    {i > 0 && <span className="text-white/15">|</span>}
                    <button
                      onClick={() => handleDescargar(fmt)}
                      disabled={descargando !== null}
                      className={`text-[11px] font-medium disabled:opacity-40 transition-colors ${
                        fmt === "pdf"
                          ? "text-red-300 hover:text-red-200"
                          : fmt === "excel"
                            ? "text-emerald-300 hover:text-emerald-200"
                            : "text-purple-300 hover:text-purple-200"
                      }`}
                    >
                      ⬇ {fmt === "excel" ? "Excel" : fmt.toUpperCase()}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>

        {/* ─── GENERADOR (DERECHA) ───────────────────────────────────────────── */}
        <div className="glass-strong rounded-2xl p-6 space-y-5 overflow-y-auto" style={{ maxHeight: "520px" }}>

          {/* Header */}
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-brand-green" />
              Generador de Reportes a Medida
            </h2>
            <p className="text-xs text-text-soft mt-0.5">
              Selecciona las fuentes de datos, combínalas libremente, elige columnas y descarga en el formato que prefieras.
            </p>
          </div>

          {/* Fuentes de datos */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-soft">
                Fuente de datos
              </p>
              <span className="text-[11px] text-text-soft/50">
                {entidades.length} seleccionada{entidades.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
              {TODAS_ENTIDADES.map((ek) => {
                const info = ENTIDADES_INFO[ek];
                const activa = entidades.includes(ek);
                const cubierta = !activa && entidadesCubiertas.includes(ek);
                return (
                  <button
                    key={ek}
                    onClick={() => toggleEntidad(ek)}
                    className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                      activa
                        ? "border-brand-green/50 bg-brand-green/10"
                        : cubierta
                          ? "border-white/15 bg-white/3 opacity-75"
                          : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/3"
                    }`}
                  >
                    <div className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      activa
                        ? "border-brand-green bg-brand-green"
                        : cubierta
                          ? "border-white/30 bg-white/5"
                          : "border-white/25 bg-transparent"
                    }`}>
                      {activa && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                      {cubierta && <div className="h-1.5 w-1.5 rounded-full bg-brand-green/50" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-medium leading-tight truncate ${activa ? "text-brand-green" : "text-white/80"}`}>
                        {info.label}
                      </p>
                      <p className="text-[11px] text-text-soft/55 mt-0.5 leading-tight">
                        {info.descripcion}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Combinación resuelta */}
            <div className="flex items-center gap-2 rounded-lg bg-brand-green/6 border border-brand-green/20 px-3 py-2">
              <Link2 className="h-3 w-3 text-brand-green flex-shrink-0" />
              <p className="text-[11px] text-brand-green">
                <span className="font-semibold">Combinación:</span>{" "}
                {ESTRATEGIA_LABELS[estrategia]}
              </p>
            </div>
          </div>

          {/* Columnas a incluir */}
          <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-soft">
                Columnas a incluir
                <span className="ml-2 text-brand-green">{columnas.length} / {totalCols}</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleTodas}
                  className="text-[11px] text-brand-green hover:underline underline-offset-2"
                >
                  {columnas.length === totalCols ? "Desmarcar todo" : "Seleccionar todo"}
                </button>
                <button
                  onClick={() => setColsCollapsed((p) => !p)}
                  className="text-text-soft/60 hover:text-white transition-colors"
                >
                  {colsCollapsed
                    ? <ChevronDown className="h-3.5 w-3.5" />
                    : <ChevronUp className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {!colsCollapsed && (
              <div className="space-y-4">
                {Object.entries(grupos).map(([gKey, grupo]) => (
                  <div key={gKey}>
                    <p className="text-[10px] font-semibold text-text-soft/45 uppercase tracking-widest mb-2">
                      {grupo.label}
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                      {Object.entries(grupo.columnas).map(([key, label]) => {
                        const checked = columnas.includes(key);
                        return (
                          <button
                            key={key}
                            onClick={() => toggleCol(key)}
                            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all ${
                              checked
                                ? "border-brand-green/50 bg-brand-green/10"
                                : "border-white/10 bg-transparent hover:border-white/20 hover:bg-white/3"
                            }`}
                          >
                            <div className={`flex-shrink-0 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${
                              checked ? "border-brand-green bg-brand-green" : "border-white/25"
                            }`}>
                              {checked && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                            </div>
                            <span className={`text-sm leading-tight ${checked ? "text-white font-medium" : "text-white/55"}`}>
                              {label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nombre + límite */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[180px]">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-text-soft">
                Nombre del reporte
              </label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Inventario bajo stock enero 2026"
                className="mt-1.5 w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-text-soft">
                Filas previa
              </label>
              <select
                value={limite}
                onChange={(e) => setLimite(+e.target.value)}
                className="mt-1.5 block w-28 rounded-lg bg-bg-base border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none transition-all"
              >
                {LIMITES.map((l) => <option key={l} value={l}>{l} filas</option>)}
              </select>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-white/10">
            <button
              onClick={handlePreview}
              disabled={loading || !columnas.length}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-green to-brand-green/80 px-5 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-brand-green/30 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {loading ? "Cargando..." : "Previsualizar"}
            </button>

            <div className="flex-1" />
            <span className="text-xs text-text-soft/60">Descargar:</span>

            {(["pdf", "excel", "csv"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => handleDescargar(fmt)}
                disabled={descargando !== null || !columnas.length}
                className={`flex items-center gap-1.5 rounded-xl border px-4 py-2.5 text-sm font-medium disabled:opacity-40 transition-all ${
                  fmt === "pdf"
                    ? "border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20"
                    : fmt === "excel"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                }`}
              >
                {descargando === fmt
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : fmt === "pdf"
                    ? <FileText className="h-3.5 w-3.5" />
                    : <Download className="h-3.5 w-3.5" />}
                {fmt === "excel" ? "Excel" : fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── FILA INFERIOR: Reportes del Sistema ANCHO COMPLETO ────────────── */}
      <div className="glass-strong rounded-2xl p-6">
        <ReportesDisponiblesGrid />
      </div>
    </div>
  );
}

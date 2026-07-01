"use client";

import { useState, useMemo } from "react";
import { StatCard } from "@/components/ui";
import GraficosResumen from "@/components/GraficosResumen";
import AlertaStockBajo from "@/components/AlertaStockBajo";
import AppSelect from "@/components/AppSelect";

type InsumoRaw = {
  id: string;
  nombre: string;
  stockActual: number;
  stockMinimo: number;
  unidad: string;
  ubicacion: string | null;
  tipoInsumo: string | null;
  categoriaId: string;
  categoria: { id: string; nombre: string };
  createdAt: string;
};

type MovimientoRaw = {
  id: string;
  fecha: string;
  tipo: string;
  cantidad: number;
  insumoId: string;
};

type AsignacionRaw = {
  id: string;
  colaborador: { area: string | null };
  cantidad: number;
  fechaAsignacion: string;
  insumoId: string;
};

type CategoriaRaw = { id: string; nombre: string; tipo: string };

type Props = {
  insumos: InsumoRaw[];
  movimientos: MovimientoRaw[];
  asignaciones: AsignacionRaw[];
  categorias: CategoriaRaw[];
};

type DatePreset = "todo" | "hoy" | "semana" | "mes" | "año" | "personalizado";

const DATE_PRESETS: { value: DatePreset; label: string }[] = [
  { value: "todo", label: "Todo" },
  { value: "hoy", label: "Hoy" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mes" },
  { value: "año", label: "Año" },
  { value: "personalizado", label: "Personalizado" },
];

function getPresetRange(preset: DatePreset): { desde: Date | null; hasta: Date | null } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (preset) {
    case "hoy":
      return { desde: todayStart, hasta: now };
    case "semana": {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - 7);
      return { desde: d, hasta: now };
    }
    case "mes": {
      const d = new Date(todayStart);
      d.setDate(d.getDate() - 30);
      return { desde: d, hasta: now };
    }
    case "año":
      return { desde: new Date(now.getFullYear(), 0, 1), hasta: now };
    default:
      return { desde: null, hasta: null };
  }
}

export default function DashboardResumenClient({ insumos, movimientos, asignaciones, categorias }: Props) {
  const [datePreset, setDatePreset] = useState<DatePreset>("todo");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [tipoInsumo, setTipoInsumo] = useState("");
  const [estadoStock, setEstadoStock] = useState("");

  const ubicaciones = useMemo(
    () => [...new Set(insumos.map((i) => i.ubicacion).filter((u): u is string => !!u))].sort(),
    [insumos]
  );
  const tiposInsumo = useMemo(
    () => [...new Set(insumos.map((i) => i.tipoInsumo).filter((t): t is string => !!t))].sort(),
    [insumos]
  );

  const dateRange = useMemo(() => {
    if (datePreset === "personalizado") {
      return {
        desde: fechaDesde ? new Date(fechaDesde) : null,
        hasta: fechaHasta ? new Date(fechaHasta + "T23:59:59") : null,
      };
    }
    if (datePreset === "todo") return { desde: null, hasta: null };
    return getPresetRange(datePreset);
  }, [datePreset, fechaDesde, fechaHasta]);

  const hasDates = !!(dateRange.desde || dateRange.hasta);

  const filteredInsumos = useMemo(() => {
    return insumos.filter((i) => {
      if (categoriaId && i.categoriaId !== categoriaId) return false;
      if (ubicacion && i.ubicacion !== ubicacion) return false;
      if (tipoInsumo && i.tipoInsumo !== tipoInsumo) return false;
      if (estadoStock === "bajo" && i.stockActual > i.stockMinimo) return false;
      if (estadoStock === "ok" && i.stockActual <= i.stockMinimo) return false;
      return true;
    });
  }, [insumos, categoriaId, ubicacion, tipoInsumo, estadoStock]);

  const filteredInsumoIds = useMemo(() => new Set(filteredInsumos.map((i) => i.id)), [filteredInsumos]);
  const hasInsumoFilter = !!(categoriaId || ubicacion || tipoInsumo || estadoStock);

  const movimientosBase = useMemo(() => {
    return movimientos
      .filter((m) => {
        const fecha = new Date(m.fecha);
        if (dateRange.desde && fecha < dateRange.desde) return false;
        if (dateRange.hasta && fecha > dateRange.hasta) return false;
        if (hasInsumoFilter && !filteredInsumoIds.has(m.insumoId)) return false;
        return true;
      })
      .slice(0, hasDates ? movimientos.length : 30);
  }, [movimientos, dateRange, hasInsumoFilter, filteredInsumoIds, hasDates]);

  const filteredAsignaciones = useMemo(() => {
    return asignaciones.filter((a) => {
      const fecha = new Date(a.fechaAsignacion);
      if (dateRange.desde && fecha < dateRange.desde) return false;
      if (dateRange.hasta && fecha > dateRange.hasta) return false;
      if (hasInsumoFilter && !filteredInsumoIds.has(a.insumoId)) return false;
      return true;
    });
  }, [asignaciones, dateRange, hasInsumoFilter, filteredInsumoIds]);

  // Stats
  const totalStock = filteredInsumos.reduce((sum, i) => sum + i.stockActual, 0);
  const bajoCount = filteredInsumos.filter((i) => i.stockActual <= i.stockMinimo).length;
  const tasaUtilizacion =
    filteredInsumos.length > 0
      ? Math.round(((filteredInsumos.length - bajoCount) / filteredInsumos.length) * 100)
      : 0;

  const insumosAlerta = filteredInsumos
    .filter((i) => i.stockActual <= i.stockMinimo)
    .map((i) => ({
      id: i.id,
      nombre: i.nombre,
      stockActual: i.stockActual,
      stockMinimo: i.stockMinimo,
      unidad: i.unidad,
      categoria: { nombre: i.categoria.nombre },
    }));

  // Chart data
  const inventarioPorCategoria = useMemo(() => {
    const map = new Map<string, number>();
    for (const i of filteredInsumos) {
      const cat = i.categoria.nombre;
      map.set(cat, (map.get(cat) || 0) + i.stockActual);
    }
    return Array.from(map.entries()).map(([nombre, cantidad]) => ({ nombre, cantidad }));
  }, [filteredInsumos]);

  const distribucionEstado = [
    { name: "Disponible", value: filteredInsumos.length - bajoCount },
    { name: "Stock Bajo", value: bajoCount },
  ];

  const movimientosChart = useMemo(() => {
    const sorted = [...movimientosBase].reverse();
    const result: Array<{ fecha: string; entradas: number; salidas: number }> = [];
    for (const m of sorted) {
      const fecha = new Date(m.fecha).toLocaleDateString("es-CL", { month: "short", day: "numeric" });
      let entry = result.find((x) => x.fecha === fecha);
      if (!entry) { entry = { fecha, entradas: 0, salidas: 0 }; result.push(entry); }
      if (m.tipo === "entrada") entry.entradas += m.cantidad;
      else if (m.tipo === "salida") entry.salidas += m.cantidad;
    }
    return result;
  }, [movimientosBase]);

  const asignacionesPorArea = useMemo(() => {
    const map = new Map<string, number>();
    for (const a of filteredAsignaciones) {
      const area = a.colaborador.area || "Sin área";
      map.set(area, (map.get(area) || 0) + a.cantidad);
    }
    return Array.from(map.entries()).map(([area, cantidad]) => ({ area, cantidad }));
  }, [filteredAsignaciones]);

  const hasFilters = hasInsumoFilter || datePreset !== "todo";

  const clearFilters = () => {
    setCategoriaId(""); setUbicacion(""); setTipoInsumo(""); setEstadoStock("");
    setDatePreset("todo"); setFechaDesde(""); setFechaHasta("");
  };

  const activePresetLabel = DATE_PRESETS.find((p) => p.value === datePreset)?.label.toLowerCase();

  return (
    <div className="space-y-5">
      {/* ── Filtros ── */}
      <div className="glass-strong rounded-2xl p-4 space-y-3">

        {/* Fila 1: Presets de fecha */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wider text-text-soft/70 shrink-0">Período</span>
          <div className="flex gap-1.5 flex-wrap flex-1">
            {DATE_PRESETS.map((p) => (
              <button
                key={p.value}
                onClick={() => setDatePreset(p.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  datePreset === p.value
                    ? "bg-brand-green text-bg-base shadow-[0_0_10px_rgba(132,206,37,0.35)]"
                    : "bg-white/5 border border-white/10 text-text-soft hover:border-brand-green/40 hover:text-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={clearFilters} className="text-xs text-text-soft hover:text-red-400 transition-colors shrink-0">
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Fila 2: Rango personalizado */}
        {datePreset === "personalizado" && (
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-soft shrink-0">Desde</span>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 [color-scheme:dark]"
              />
            </div>
            <span className="text-text-soft/40">→</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-soft shrink-0">Hasta</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="rounded-lg bg-white/5 border border-white/10 px-3 py-1.5 text-sm text-foreground focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 [color-scheme:dark]"
              />
            </div>
          </div>
        )}

        {/* Fila 3: Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <AppSelect
            value={categoriaId}
            onChange={setCategoriaId}
            placeholder="Categoría"
            options={[
              { value: "", label: "Todas las categorías" },
              ...categorias.map((c) => ({ value: c.id, label: c.nombre })),
            ]}
          />
          <AppSelect
            value={ubicacion}
            onChange={setUbicacion}
            placeholder="Ubicación"
            options={[
              { value: "", label: "Todas las ubicaciones" },
              ...ubicaciones.map((u) => ({ value: u, label: u })),
            ]}
          />
          <AppSelect
            value={tipoInsumo}
            onChange={setTipoInsumo}
            placeholder="Tipo de insumo"
            options={[
              { value: "", label: "Todos los tipos" },
              ...tiposInsumo.map((t) => ({ value: t, label: t })),
            ]}
          />
          <AppSelect
            value={estadoStock}
            onChange={setEstadoStock}
            placeholder="Estado stock"
            options={[
              { value: "", label: "Todo el stock" },
              { value: "ok", label: "Stock normal" },
              { value: "bajo", label: "Stock bajo" },
            ]}
          />
        </div>

        {/* Indicador de filtros activos */}
        {hasFilters && (
          <p className="text-xs text-brand-green/70">
            Mostrando {filteredInsumos.length} de {insumos.length} insumos
            {datePreset !== "todo" && ` · período: ${activePresetLabel}`}
          </p>
        )}
      </div>

      {/* Alertas stock bajo */}
      <AlertaStockBajo insumos={insumosAlerta} />

      {/* Métricas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Inventario Total" value={totalStock} accent="green" hint="unidades en stock" />
        <StatCard label="Tipos de Insumo" value={filteredInsumos.length} accent="blue" hint="en catálogo" />
        <StatCard label="Stock Bajo" value={bajoCount} accent="warning" hint="bajo el mínimo" />
        <StatCard label="Tasa Utilización" value={`${tasaUtilizacion}%`} accent="green" />
      </div>

      {/* Gráficos */}
      <GraficosResumen
        datos={{
          inventarioPorCategoria,
          distribucionEstado,
          movimientosUltimos30: movimientosChart,
          asignacionesPorArea,
        }}
      />
    </div>
  );
}

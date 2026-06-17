"use client";

import { useState } from "react";
import { AlertTriangle, X, ChevronDown, ChevronUp } from "lucide-react";

type InsumoAlerta = { id: string; nombre: string; stockActual: number; stockMinimo: number; unidad: string; categoria: { nombre: string } };

export default function AlertaStockBajo({ insumos }: { insumos: InsumoAlerta[] }) {
  const [visible, setVisible] = useState(true);
  const [expandido, setExpandido] = useState(false);

  if (!insumos.length || !visible) return null;

  const mostrar = expandido ? insumos : insumos.slice(0, 3);
  const criticos = insumos.filter(i => i.stockActual === 0);

  return (
    <div className="mb-6 rounded-xl border border-amber-400/40 bg-amber-400/10 p-4 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-amber-300">
                {insumos.length} insumo{insumos.length !== 1 ? "s" : ""} bajo stock mínimo
              </p>
              {criticos.length > 0 && (
                <span className="rounded-full bg-red-500/20 border border-red-400/40 px-2 py-0.5 text-xs text-red-300">
                  {criticos.length} sin stock
                </span>
              )}
            </div>
            <div className="mt-3 space-y-2">
              {mostrar.map((i) => (
                <div key={i.id} className="flex items-center justify-between gap-4 rounded-lg bg-white/5 px-3 py-2 text-sm">
                  <div>
                    <span className="font-medium">{i.nombre}</span>
                    <span className="ml-2 text-xs text-text-soft">{i.categoria.nombre}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-bold text-xs ${i.stockActual === 0 ? "text-red-400" : "text-amber-400"}`}>
                      {i.stockActual} / {i.stockMinimo} {i.unidad}
                    </span>
                    <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${i.stockActual === 0 ? "bg-red-400" : "bg-amber-400"}`}
                        style={{ width: `${Math.min(100, (i.stockActual / i.stockMinimo) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {insumos.length > 3 && (
              <button
                onClick={() => setExpandido(p => !p)}
                className="mt-2 flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {expandido ? <><ChevronUp className="h-3 w-3" /> Ver menos</> : <><ChevronDown className="h-3 w-3" /> Ver {insumos.length - 3} más</>}
              </button>
            )}
          </div>
        </div>
        <button onClick={() => setVisible(false)} className="rounded-lg p-1 hover:bg-white/10 text-text-soft hover:text-foreground transition-colors shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

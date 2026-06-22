"use client";

import { useState } from "react";
import AppSelect from "@/components/AppSelect";

const NUEVO = "__nuevo__";

export default function TipoInsumoSelect({
  value, onChange, sugerencias,
}: {
  value: string; onChange: (v: string) => void; sugerencias: string[];
}) {
  const [modoNuevo, setModoNuevo] = useState(false);

  if (modoNuevo || (value !== "" && !sugerencias.includes(value))) {
    return (
      <div className="space-y-1">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ej: Notebook"
          className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-text-soft/50 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
        />
        {sugerencias.length > 0 && (
          <button
            type="button"
            onClick={() => { setModoNuevo(false); onChange(""); }}
            className="text-xs text-brand-blue-bright hover:underline"
          >
            Elegir de la lista
          </button>
        )}
      </div>
    );
  }

  return (
    <AppSelect
      value={value}
      onChange={(v) => {
        if (v === NUEVO) { setModoNuevo(true); onChange(""); return; }
        onChange(v);
      }}
      placeholder="Seleccionar tipo…"
      options={[
        ...sugerencias.map((t) => ({ value: t, label: t })),
        { value: NUEVO, label: "+ Agregar nuevo tipo…" },
      ]}
    />
  );
}

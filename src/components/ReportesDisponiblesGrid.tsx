"use client";

import { useState } from "react";
import { FileText, Download, Loader2, Users, Boxes, CheckSquare, BarChart3, TrendingUp } from "@/components/icons";

const reportes = [
  { id: "colaboradores", label: "Colaboradores", icon: Users, color: "text-brand-blue" },
  { id: "inventario", label: "Inventario", icon: Boxes, color: "text-brand-green" },
  { id: "asignaciones", label: "Asignaciones", icon: CheckSquare, color: "text-emerald-400" },
  { id: "solicitudes", label: "Solicitudes", icon: BarChart3, color: "text-amber-400" },
  { id: "movimientos", label: "Movimientos", icon: TrendingUp, color: "text-purple-400" },
];

export default function ReportesDisponiblesGrid() {
  const [descargando, setDescargando] = useState<string | null>(null);

  const descargar = async (tipo: string, formato: "pdf" | "excel" | "csv") => {
    const key = `${tipo}-${formato}`;
    setDescargando(key);
    try {
      const res = await fetch(`/api/reportes/descargar?tipo=${tipo}&formato=${formato}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Reporte_${tipo}_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
          Reportes del Sistema
        </h3>
        <p className="text-xs text-text-soft mt-0.5">Descarga inmediata con un clic</p>
      </div>

      {/* Grid de reportes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {reportes.map(({ id, label, icon: Icon, color }) => (
          <div
            key={id}
            className="glass rounded-xl p-4 flex flex-col items-center text-center gap-3 hover:border-brand-green/40 transition-all group"
          >
            {/* Icono */}
            <div className="rounded-lg bg-white/10 p-2.5 flex-shrink-0">
              <Icon className={`h-5 w-5 ${color}`} />
            </div>

            {/* Nombre */}
            <span className="text-sm font-medium text-foreground">{label}</span>

            {/* Botones de descarga */}
            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-white/10 w-full justify-center">
              {/* PDF */}
              <button
                onClick={() => descargar(id, "pdf")}
                disabled={descargando !== null}
                title="Descargar PDF"
                className="rounded-lg p-1.5 text-red-300 hover:bg-red-500/20 disabled:opacity-40 transition-all"
              >
                {descargando === `${id}-pdf` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />}
              </button>
              {/* Excel */}
              <button
                onClick={() => descargar(id, "excel")}
                disabled={descargando !== null}
                title="Descargar Excel"
                className="rounded-lg p-1.5 text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-40 transition-all"
              >
                {descargando === `${id}-excel` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              </button>
              {/* CSV */}
              <button
                onClick={() => descargar(id, "csv")}
                disabled={descargando !== null}
                title="Descargar CSV"
                className="rounded-lg p-1.5 text-purple-300 hover:bg-purple-500/20 disabled:opacity-40 transition-all"
              >
                {descargando === `${id}-csv` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-soft text-center pt-1 opacity-60">
        Los reportes incluyen todos los datos actuales
      </p>
    </div>
  );
}

"use client";

import { LogIn, Plus, Pencil, Check, X, Package, ArrowLeftRight, Trash2, AlertTriangle } from "lucide-react";

type LogEntry = {
  id: string;
  accion: string;
  entidad: string | null;
  detalle: string | null;
  fecha: string;
  colaborador: { nombre: string; apellidoPaterno: string } | null;
};

const ICONOS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  login:    { icon: LogIn,         color: "text-brand-green",  bg: "bg-brand-green/20" },
  crear:    { icon: Plus,          color: "text-blue-400",     bg: "bg-blue-400/20" },
  editar:   { icon: Pencil,        color: "text-brand-blue",   bg: "bg-brand-blue/20" },
  aprobar:  { icon: Check,         color: "text-brand-green",  bg: "bg-brand-green/20" },
  eliminar: { icon: X,             color: "text-red-400",      bg: "bg-red-400/20" },
  asignacion: { icon: ArrowLeftRight, color: "text-purple-400", bg: "bg-purple-400/20" },
  solicitud:  { icon: Package,     color: "text-amber-400",    bg: "bg-amber-400/20" },
};

const ENTIDAD_LABELS: Record<string, string> = {
  Colaborador: "colaborador",
  Insumo: "insumo",
  Asignacion: "asignación",
  Solicitud: "solicitud",
  Proveedor: "proveedor",
  Categoria: "categoría",
  Perfil: "perfil",
};

function formatFecha(fecha: string) {
  const d = new Date(fecha);
  const ahora = new Date();
  const diff = ahora.getTime() - d.getTime();
  const minutos = Math.floor(diff / 60000);
  const horas = Math.floor(diff / 3600000);
  const dias = Math.floor(diff / 86400000);
  if (minutos < 1) return "Ahora mismo";
  if (minutos < 60) return `Hace ${minutos} min`;
  if (horas < 24) return `Hace ${horas}h`;
  if (dias < 7) return `Hace ${dias}d`;
  return d.toLocaleDateString("es-CL", { day: "numeric", month: "short" });
}

export default function ActividadTimeline({ logs }: { logs: LogEntry[] }) {
  if (!logs.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-soft">
        <AlertTriangle className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm">Sin actividad registrada</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      {/* Línea vertical */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10" />

      {logs.map((log, idx) => {
        const config = ICONOS[log.accion] ?? { icon: AlertTriangle, color: "text-text-soft", bg: "bg-white/10" };
        const Icon = config.icon;
        const quien = log.colaborador
          ? `${log.colaborador.nombre} ${log.colaborador.apellidoPaterno}`
          : "Sistema";
        const entidad = log.entidad ? ENTIDAD_LABELS[log.entidad] ?? log.entidad.toLowerCase() : "";

        return (
          <div key={log.id} className={`relative flex items-start gap-4 pb-4 ${idx === logs.length - 1 ? "" : ""}`}>
            {/* Ícono */}
            <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} border border-white/10`}>
              <Icon className={`h-4 w-4 ${config.color}`} />
            </div>
            {/* Contenido */}
            <div className="flex-1 rounded-xl bg-white/3 border border-white/8 px-4 py-3 hover:bg-white/5 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    <span className="text-foreground">{quien}</span>
                    {entidad && <span className="text-text-soft"> · {entidad}</span>}
                  </p>
                  {log.detalle && (
                    <p className="text-xs text-text-soft mt-0.5 truncate">{log.detalle}</p>
                  )}
                </div>
                <span className="text-xs text-text-soft shrink-0 tabular-nums">{formatFecha(log.fecha)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

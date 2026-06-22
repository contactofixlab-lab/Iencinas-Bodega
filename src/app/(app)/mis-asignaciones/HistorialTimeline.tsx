import { Send, CheckCircle2, XCircle, PackageCheck, RotateCcw, AlertTriangle } from "@/components/icons";
import { Badge } from "@/components/ui";

type Tone = "green" | "blue" | "amber" | "red" | "gray";

type Evento = {
  id: string;
  fecha: Date;
  icon: typeof Send;
  titulo: string;
  detalle: string;
  estado: string;
  tone: Tone;
};

type Asignacion = {
  id: string; cantidad: number; numeroSerie: string | null;
  fechaAsignacion: Date; fechaDevolucion: Date | null; estado: string;
  insumo: { nombre: string };
};

type Solicitud = {
  id: string; fecha: Date; estado: string; comentarioAdmin: string | null; fechaResolucion: Date | null;
  items: Array<{ id: string; cantidad: number; insumo: { nombre: string } }>;
};

const fmt = (d: Date) => new Date(d).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });

function construirEventos(asignaciones: Asignacion[], solicitudes: Solicitud[]): Evento[] {
  const eventos: Evento[] = [];

  for (const s of solicitudes) {
    const detalle = s.items.map((it) => `${it.cantidad}× ${it.insumo.nombre}`).join(", ");
    eventos.push({
      id: `sol-${s.id}`,
      fecha: s.fecha,
      icon: Send,
      titulo: "Solicitud enviada",
      detalle,
      estado: "pendiente",
      tone: "amber",
    });
    if (s.fechaResolucion) {
      const aprobada = s.estado === "aprobada" || s.estado === "entregada";
      eventos.push({
        id: `sol-res-${s.id}`,
        fecha: s.fechaResolucion,
        icon: s.estado === "rechazada" ? XCircle : CheckCircle2,
        titulo: s.estado === "rechazada" ? "Solicitud rechazada" : s.estado === "entregada" ? "Solicitud entregada" : "Solicitud aprobada",
        detalle: s.comentarioAdmin ? `${detalle} — ${s.comentarioAdmin}` : detalle,
        estado: s.estado,
        tone: s.estado === "rechazada" ? "red" : aprobada ? "green" : "gray",
      });
    }
  }

  for (const a of asignaciones) {
    eventos.push({
      id: `asig-${a.id}`,
      fecha: a.fechaAsignacion,
      icon: PackageCheck,
      titulo: "Insumo entregado",
      detalle: `${a.cantidad}× ${a.insumo.nombre}${a.numeroSerie ? ` (N/S ${a.numeroSerie})` : ""}`,
      estado: "entregado",
      tone: "blue",
    });
    if (a.fechaDevolucion) {
      const extraviado = a.estado === "extraviado";
      eventos.push({
        id: `asig-dev-${a.id}`,
        fecha: a.fechaDevolucion,
        icon: extraviado ? AlertTriangle : RotateCcw,
        titulo: extraviado ? "Insumo reportado extraviado" : "Insumo devuelto",
        detalle: `${a.cantidad}× ${a.insumo.nombre}`,
        estado: a.estado,
        tone: extraviado ? "red" : "gray",
      });
    }
  }

  return eventos.sort((x, y) => y.fecha.getTime() - x.fecha.getTime());
}

export default function HistorialTimeline({
  asignaciones, solicitudes,
}: {
  asignaciones: Asignacion[]; solicitudes: Solicitud[];
}) {
  const eventos = construirEventos(asignaciones, solicitudes);

  if (eventos.length === 0) {
    return <div className="glass rounded-2xl p-8 text-center text-sm text-text-soft">Aún no tienes movimientos de insumos registrados</div>;
  }

  return (
    <div>
      {eventos.map((e, i) => {
        const Icon = e.icon;
        const dotTone: Record<Tone, string> = {
          green: "border-brand-green/50 bg-brand-green/15 text-brand-green",
          blue: "border-brand-blue/50 bg-brand-blue/15 text-brand-blue-bright",
          amber: "border-amber-400/50 bg-amber-400/15 text-amber-300",
          red: "border-red-400/50 bg-red-400/15 text-red-300",
          gray: "border-white/15 bg-white/8 text-text-soft",
        };
        return (
          <div key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < eventos.length - 1 && (
              <span className="absolute left-[15px] top-8 bottom-0 w-px bg-white/10" />
            )}
            <span className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border ${dotTone[e.tone]}`}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="glass card-3d flex-1 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{e.titulo}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-soft/60">{fmt(e.fecha)}</span>
                  <Badge tone={e.tone}>{e.estado}</Badge>
                </div>
              </div>
              <p className="mt-1.5 text-sm text-text-soft">{e.detalle}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

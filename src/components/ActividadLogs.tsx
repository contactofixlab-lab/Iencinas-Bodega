"use client";

import { useState, useMemo } from "react";
import { Filter, X, Activity } from "@/components/icons";
import { Table, EmptyRow, Badge } from "@/components/ui";
import AppSelect from "@/components/AppSelect";

type LogAuditoria = {
  id: string;
  fecha: string;
  accion: string;
  entidad: string | null;
  detalle: string | null;
  colaborador: { nombre: string; apellidoPaterno: string } | null;
  ip: string | null;
};

const ACCIONES_DISPONIBLES = [
  { value: "login", label: "Ingreso" },
  { value: "login_fallido", label: "Intento fallido" },
  { value: "crear", label: "Crear" },
  { value: "editar", label: "Editar" },
  { value: "eliminar", label: "Eliminar" },
  { value: "aprobar", label: "Aprobar" },
  { value: "rechazar", label: "Rechazar" },
  { value: "asignar", label: "Asignar" },
];

const ENTIDADES_DISPONIBLES = [
  { value: "Colaborador", label: "Colaboradores" },
  { value: "Insumo", label: "Inventario" },
  { value: "Asignacion", label: "Asignaciones" },
  { value: "Departamento", label: "Departamentos" },
  { value: "Ubicacion", label: "Ubicaciones" },
  { value: "Proveedor", label: "Proveedores" },
  { value: "Empresa", label: "Empresa" },
  { value: "Categoria", label: "Categorías" },
];

const getToneParaAccion = (accion: string): "green" | "blue" | "amber" | "red" | "gray" => {
  switch (accion) {
    case "crear":
    case "aprobar":
    case "asignar":
      return "green";
    case "editar":
      return "blue";
    case "eliminar":
    case "rechazar":
      return "red";
    case "login":
      return "gray";
    case "login_fallido":
      return "amber";
    default:
      return "gray";
  }
};

const getIconoParaAccion = (accion: string): string => {
  switch (accion) {
    case "crear":
      return "➕";
    case "editar":
      return "✏️";
    case "eliminar":
      return "🗑️";
    case "aprobar":
      return "✅";
    case "rechazar":
      return "❌";
    case "asignar":
      return "🎯";
    case "login":
      return "🔓";
    case "login_fallido":
      return "🔒";
    default:
      return "📝";
  }
};

const getEtiquetaAccion = (accion: string): string => {
  return ACCIONES_DISPONIBLES.find(a => a.value === accion)?.label || accion;
};

const getEtiquetaEntidad = (entidad: string | null): string => {
  return ENTIDADES_DISPONIBLES.find(e => e.value === entidad)?.label || entidad || "—";
};

const fmt = (fecha: string) => {
  const d = new Date(fecha);
  return d.toLocaleDateString("es-CL", { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
};

export default function ActividadLogs({
  logs,
}: {
  logs: LogAuditoria[];
}) {
  const [filtroAccion, setFiltroAccion] = useState("");
  const [filtroEntidad, setFiltroEntidad] = useState("");
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [busqueda, setBusqueda] = useState("");

  // Opciones únicas para el filtro de usuario
  const usuariosUnicos = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(log => {
      if (log.colaborador) {
        const nombre = `${log.colaborador.nombre} ${log.colaborador.apellidoPaterno}`;
        set.add(nombre);
      }
    });
    return Array.from(set).sort().map(u => ({ value: u, label: u }));
  }, [logs]);

  // Filtrar logs
  const logsFiltrados = useMemo(() => {
    return logs.filter(log => {
      // Filtro por acción
      if (filtroAccion && log.accion !== filtroAccion) return false;
      // Filtro por entidad
      if (filtroEntidad && log.entidad !== filtroEntidad) return false;
      // Filtro por usuario
      if (filtroUsuario) {
        const nombreCompleto = log.colaborador ? `${log.colaborador.nombre} ${log.colaborador.apellidoPaterno}` : "";
        if (nombreCompleto !== filtroUsuario) return false;
      }
      // Búsqueda en detalle
      if (busqueda && !log.detalle?.toLowerCase().includes(busqueda.toLowerCase())) return false;
      return true;
    });
  }, [logs, filtroAccion, filtroEntidad, filtroUsuario, busqueda]);

  const handleLimpiarFiltros = () => {
    setFiltroAccion("");
    setFiltroEntidad("");
    setFiltroUsuario("");
    setBusqueda("");
  };

  const filtrosActivos = filtroAccion || filtroEntidad || filtroUsuario || busqueda;

  return (
    <div className="space-y-4">
      {/* Panel de filtros */}
      <div className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-brand-green" />
          <h3 className="text-sm font-semibold text-foreground">Filtros</h3>
          {filtrosActivos && (
            <button
              onClick={handleLimpiarFiltros}
              className="ml-auto flex items-center gap-1 rounded-lg border border-white/20 bg-white/5 px-2.5 py-1 text-xs text-text-soft hover:bg-white/10 transition-colors"
            >
              <X className="h-3 w-3" /> Limpiar
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filtro Acción */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-soft">
              Acción
            </label>
            <AppSelect
              value={filtroAccion}
              onChange={setFiltroAccion}
              options={[{ value: "", label: "Todas" }, ...ACCIONES_DISPONIBLES]}
            />
          </div>

          {/* Filtro Entidad */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-soft">
              Módulo
            </label>
            <AppSelect
              value={filtroEntidad}
              onChange={setFiltroEntidad}
              options={[{ value: "", label: "Todos" }, ...ENTIDADES_DISPONIBLES]}
            />
          </div>

          {/* Filtro Usuario */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-soft">
              Usuario
            </label>
            <AppSelect
              value={filtroUsuario}
              onChange={setFiltroUsuario}
              options={[{ value: "", label: "Todos" }, ...usuariosUnicos]}
            />
          </div>

          {/* Búsqueda */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-text-soft">
              Buscar
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Detalle, IP, nombre..."
              className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-text-soft/40 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all"
            />
          </div>
        </div>

        {/* Estadística de resultados */}
        <p className="mt-3 text-xs text-text-soft/60">
          Mostrando <span className="font-semibold text-foreground">{logsFiltrados.length}</span> de <span className="font-semibold text-foreground">{logs.length}</span> actividades
        </p>
      </div>

      {/* Tabla de logs */}
      <Table head={["Fecha", "Usuario", "Acción", "Módulo", "Detalle", "IP"]}>
        {logsFiltrados.length === 0 ? (
          <EmptyRow colSpan={6} text={filtrosActivos ? "No hay actividades que coincidan con los filtros" : "Sin actividades registradas"} />
        ) : (
          logsFiltrados.map(log => (
            <tr key={log.id} className="hover:bg-white/[0.025] transition-colors group">
              <td className="px-5 py-3.5 text-sm text-text-soft whitespace-nowrap">
                {fmt(log.fecha)}
              </td>
              <td className="px-5 py-3.5 text-sm font-medium">
                {log.colaborador ? (
                  <div>
                    <p className="text-foreground">{log.colaborador.nombre} {log.colaborador.apellidoPaterno}</p>
                  </div>
                ) : (
                  <span className="text-text-soft/50">Sistema</span>
                )}
              </td>
              <td className="px-5 py-3.5">
                <Badge tone={getToneParaAccion(log.accion)}>
                  <span className="mr-1.5">{getIconoParaAccion(log.accion)}</span>
                  {getEtiquetaAccion(log.accion)}
                </Badge>
              </td>
              <td className="px-5 py-3.5">
                <Badge tone="blue">
                  {getEtiquetaEntidad(log.entidad)}
                </Badge>
              </td>
              <td className="px-5 py-3.5 text-sm text-text-soft max-w-xs truncate">
                {log.detalle || "—"}
              </td>
              <td className="px-5 py-3.5 text-xs text-text-soft/50 font-mono whitespace-nowrap">
                {log.ip || "—"}
              </td>
            </tr>
          ))
        )}
      </Table>
    </div>
  );
}

export type EntidadKey = "colaboradores" | "insumos" | "categorias" | "proveedores" | "asignaciones" | "solicitudes" | "movimientos";
export type EstrategiaKey = "colaboradores" | "insumos" | "asignaciones" | "solicitudes" | "movimientos";

export const ENTIDADES_INFO: Record<EntidadKey, { label: string; descripcion: string; color: string }> = {
  colaboradores: { label: "Colaboradores", descripcion: "Personas del equipo", color: "brand-blue" },
  insumos:       { label: "Insumos",       descripcion: "Artículos de inventario", color: "brand-green" },
  categorias:    { label: "Categorías",    descripcion: "Tipos de insumo", color: "purple-400" },
  proveedores:   { label: "Proveedores",   descripcion: "Empresas de suministro", color: "amber-400" },
  asignaciones:  { label: "Asignaciones",  descripcion: "Insumos entregados a personas", color: "emerald-400" },
  solicitudes:   { label: "Solicitudes",   descripcion: "Pedidos de insumos", color: "orange-400" },
  movimientos:   { label: "Movimientos",   descripcion: "Entradas y salidas de stock", color: "teal-400" },
};

// Grupos de columnas disponibles por estrategia
export interface ColGrupo { label: string; columnas: Record<string, string> }

export const ESTRATEGIA_GRUPOS: Record<EstrategiaKey, Record<string, ColGrupo>> = {
  colaboradores: {
    colaboradores: {
      label: "Colaborador",
      columnas: {
        colNombre:        "Nombre",
        colApellido:      "Apellido paterno",
        colApellidoM:     "Apellido materno",
        colCorreo:        "Correo corporativo",
        colArea:          "Área / Depto.",
        colCargo:         "Cargo",
        colEstado:        "Estado",
        colRut:           "RUT",
        colTelPersonal:   "Teléfono personal",
        colTelCorp:       "Teléfono corporativo",
        colCiudad:        "Ciudad",
        colRegion:        "Región",
        colCentrodeCosto: "Centro de costo",
        colFechaIngreso:  "Fecha ingreso",
      },
    },
  },
  insumos: {
    insumos: {
      label: "Insumo",
      columnas: {
        insNombre:      "Nombre insumo",
        insSKU:         "SKU",
        insMarca:       "Marca",
        insModelo:      "Modelo",
        insUnidad:      "Unidad",
        insStockActual: "Stock actual",
        insStockMinimo: "Stock mínimo",
        insEstadoStock: "Estado stock",
        insUbicacion:   "Ubicación",
      },
    },
    categorias: {
      label: "Categoría",
      columnas: {
        catNombre: "Nombre categoría",
      },
    },
    proveedores: {
      label: "Proveedor",
      columnas: {
        provNombre: "Nombre proveedor",
      },
    },
  },
  asignaciones: {
    colaboradores: {
      label: "Colaborador",
      columnas: {
        colNombre:       "Nombre colaborador",
        colApellido:     "Apellido",
        colArea:         "Área colaborador",
        colCargo:        "Cargo colaborador",
        colCorreo:       "Correo colaborador",
        colEstado:       "Estado colaborador",
        colRut:          "RUT colaborador",
        colCiudad:       "Ciudad",
        colFechaIngreso: "Fecha ingreso",
      },
    },
    asignaciones: {
      label: "Asignación",
      columnas: {
        asigCantidad:      "Cantidad asignada",
        asigFecha:         "Fecha asignación",
        asigEstado:        "Estado asignación",
        asigSerie:         "N° serie",
        asigEntregadoPor:  "Entregado por",
        asigObs:           "Observaciones",
      },
    },
    insumos: {
      label: "Insumo",
      columnas: {
        insNombre:      "Nombre insumo",
        insSKU:         "SKU",
        insMarca:       "Marca",
        insUnidad:      "Unidad",
        insStockActual: "Stock actual",
        insUbicacion:   "Ubicación",
        catNombre:      "Categoría",
        provNombre:     "Proveedor",
      },
    },
  },
  solicitudes: {
    colaboradores: {
      label: "Colaborador",
      columnas: {
        colNombre:   "Nombre colaborador",
        colApellido: "Apellido",
        colArea:     "Área",
        colCargo:    "Cargo",
      },
    },
    solicitudes: {
      label: "Solicitud",
      columnas: {
        solicEstado:     "Estado solicitud",
        solicFecha:      "Fecha solicitud",
        solicComentario: "Respuesta admin",
      },
    },
    insumos: {
      label: "Insumo solicitado",
      columnas: {
        insNombre:        "Nombre insumo",
        itemCantidad:     "Cantidad solicitada",
        itemJustificacion:"Justificación",
      },
    },
  },
  movimientos: {
    insumos: {
      label: "Insumo",
      columnas: {
        insNombre:      "Nombre insumo",
        insSKU:         "SKU",
        catNombre:      "Categoría",
        insStockActual: "Stock actual",
      },
    },
    movimientos: {
      label: "Movimiento",
      columnas: {
        movTipo:     "Tipo movimiento",
        movCantidad: "Cantidad",
        movFecha:    "Fecha",
        movUsuario:  "Usuario",
        movMotivo:   "Motivo",
      },
    },
  },
};

// Dado un set de entidades seleccionadas → qué estrategia de query usar
export function resolverEstrategia(entidades: EntidadKey[]): EstrategiaKey {
  const e = new Set(entidades);
  if (e.has("solicitudes")) return "solicitudes";
  if (e.has("movimientos")) return "movimientos";
  if (e.has("asignaciones") || (e.has("colaboradores") && (e.has("insumos") || e.has("categorias") || e.has("proveedores")))) return "asignaciones";
  if (e.has("colaboradores")) return "colaboradores";
  return "insumos";
}

// Qué entidades cubre cada estrategia (para mostrar indicador en UI)
export const ESTRATEGIA_CUBRE: Record<EstrategiaKey, EntidadKey[]> = {
  colaboradores: ["colaboradores"],
  insumos:       ["insumos", "categorias", "proveedores"],
  asignaciones:  ["colaboradores", "asignaciones", "insumos", "categorias", "proveedores"],
  solicitudes:   ["colaboradores", "solicitudes", "insumos"],
  movimientos:   ["insumos", "movimientos", "categorias"],
};

export const ESTRATEGIA_LABELS: Record<EstrategiaKey, string> = {
  colaboradores: "Solo Colaboradores",
  insumos:       "Inventario · Insumos + Categoría + Proveedor",
  asignaciones:  "Colaboradores ← Asignaciones → Insumos",
  solicitudes:   "Colaboradores ← Solicitudes → Insumos",
  movimientos:   "Insumos ← Movimientos de stock",
};

// Columnas sugeridas por defecto al cambiar de estrategia
export const COLUMNAS_DEFAULT: Record<EstrategiaKey, string[]> = {
  colaboradores: ["colNombre", "colApellido", "colArea", "colCargo", "colEstado"],
  insumos:       ["insNombre", "insSKU", "insStockActual", "insEstadoStock", "catNombre", "provNombre"],
  asignaciones:  ["colNombre", "colApellido", "colArea", "insNombre", "asigCantidad", "asigFecha", "asigEstado"],
  solicitudes:   ["colNombre", "colArea", "solicEstado", "solicFecha", "insNombre", "itemCantidad"],
  movimientos:   ["insNombre", "catNombre", "movTipo", "movCantidad", "movFecha", "movUsuario"],
};

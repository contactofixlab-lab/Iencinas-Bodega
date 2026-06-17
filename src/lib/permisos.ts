// Definición de módulos y permisos para los perfiles a medida.

export const MODULOS = [
  "dashboard",
  "inventario",
  "colaboradores",
  "asignaciones",
  "proveedores",
  "configuracion",
  "mi_espacio",
] as const;

export type Modulo = (typeof MODULOS)[number];

export type Acciones = {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
  aprobar: boolean;
};

export type Permisos = Record<Modulo, Acciones>;

export const MODULO_LABEL: Record<Modulo, string> = {
  dashboard: "Dashboard",
  inventario: "Inventario",
  colaboradores: "Colaboradores",
  asignaciones: "Asignaciones",
  proveedores: "Proveedores",
  configuracion: "Configuración",
  mi_espacio: "Mi Espacio",
};

function acciones(p: Partial<Acciones>): Acciones {
  return {
    ver: false,
    crear: false,
    editar: false,
    eliminar: false,
    aprobar: false,
    ...p,
  };
}

const TODO = acciones({ ver: true, crear: true, editar: true, eliminar: true, aprobar: true });

export const PERMISOS_ADMIN: Permisos = {
  dashboard: TODO,
  inventario: TODO,
  colaboradores: TODO,
  asignaciones: TODO,
  proveedores: TODO,
  configuracion: TODO,
  mi_espacio: TODO,
};

export const PERMISOS_BODEGUERO: Permisos = {
  dashboard: acciones({ ver: true }),
  inventario: TODO,
  colaboradores: acciones({ ver: true }),
  asignaciones: TODO,
  proveedores: TODO,
  configuracion: acciones({}),
  mi_espacio: acciones({ ver: true, crear: true }),
};

export const PERMISOS_COLABORADOR: Permisos = {
  dashboard: acciones({}),
  inventario: acciones({}),
  colaboradores: acciones({}),
  asignaciones: acciones({}),
  proveedores: acciones({}),
  configuracion: acciones({}),
  mi_espacio: acciones({ ver: true, crear: true }),
};

export function parsePermisos(json: string): Permisos {
  try {
    const base = JSON.parse(json) as Partial<Permisos>;
    const result = {} as Permisos;
    for (const m of MODULOS) result[m] = acciones(base[m] ?? {});
    return result;
  } catch {
    return PERMISOS_COLABORADOR;
  }
}

export function puedeVer(permisos: Permisos, modulo: Modulo): boolean {
  return permisos[modulo]?.ver ?? false;
}

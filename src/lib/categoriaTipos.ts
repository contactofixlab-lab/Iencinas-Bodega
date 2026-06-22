import {
  Cpu, Briefcase, ChefHat, Bath, SprayCan, Armchair, FileText, Package,
} from "@/components/icons";

export type TipoCategoriaConfig = {
  value: string;
  label: string;
  icon: typeof Cpu;
  placeholderNombre: string;
  marcaLabel: string;
  showModelo: boolean;
  showSku: boolean;
  esSerializableDefault: boolean;
  esSerializableHint: string;
  unidadDefault: string;
  unidadOptions: string[];
};

export const TIPO_CONFIG: Record<string, TipoCategoriaConfig> = {
  tecnologia: {
    value: "tecnologia", label: "Tecnología",
    icon: Cpu, placeholderNombre: "Ej: Mouse inalámbrico Logitech",
    marcaLabel: "Marca / Fabricante", showModelo: true, showSku: true,
    esSerializableDefault: true, esSerializableHint: "Los equipos electrónicos suelen tener N° de serie único",
    unidadDefault: "unidad", unidadOptions: ["unidad", "caja", "par", "set"],
  },
  oficina: {
    value: "oficina", label: "Oficina",
    icon: Briefcase, placeholderNombre: "Ej: Resma de papel carta",
    marcaLabel: "Marca", showModelo: false, showSku: true,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "resma", unidadOptions: ["unidad", "caja", "paquete", "resma", "set"],
  },
  cocina: {
    value: "cocina", label: "Cocina",
    icon: ChefHat, placeholderNombre: "Ej: Café molido 500g",
    marcaLabel: "Marca", showModelo: false, showSku: false,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "unidad", unidadOptions: ["unidad", "caja", "paquete", "litro", "kg"],
  },
  "baño": {
    value: "baño", label: "Baño",
    icon: Bath, placeholderNombre: "Ej: Papel higiénico",
    marcaLabel: "Marca", showModelo: false, showSku: false,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "paquete", unidadOptions: ["unidad", "paquete", "caja", "litro"],
  },
  aseo: {
    value: "aseo", label: "Aseo",
    icon: SprayCan, placeholderNombre: "Ej: Detergente multiuso",
    marcaLabel: "Marca", showModelo: false, showSku: false,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "litro", unidadOptions: ["unidad", "litro", "caja", "kg"],
  },
  mobiliario: {
    value: "mobiliario", label: "Mobiliario",
    icon: Armchair, placeholderNombre: "Ej: Silla ergonómica",
    marcaLabel: "Marca / Fabricante", showModelo: true, showSku: true,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "unidad", unidadOptions: ["unidad", "set", "par"],
  },
  papeleria: {
    value: "papeleria", label: "Papelería",
    icon: FileText, placeholderNombre: "Ej: Cuaderno universitario",
    marcaLabel: "Marca", showModelo: false, showSku: true,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "unidad", unidadOptions: ["unidad", "caja", "paquete", "resma", "set"],
  },
  otros: {
    value: "otros", label: "Otros",
    icon: Package, placeholderNombre: "Ej: Artículo varios",
    marcaLabel: "Marca", showModelo: true, showSku: true,
    esSerializableDefault: false, esSerializableHint: "Marca si esta unidad lleva un N° de serie individual",
    unidadDefault: "unidad", unidadOptions: ["unidad", "caja", "paquete", "litro", "kg", "par", "set"],
  },
};

export const DEFAULT_TIPO_CONFIG = TIPO_CONFIG.otros;

// Lista para selects/grids — agregar un tipo nuevo aquí lo propaga automáticamente
// al wizard de creación de insumo y al formulario de nueva categoría.
export const TIPOS_CATEGORIA = Object.values(TIPO_CONFIG);

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type UbicacionData = {
  nombre: string; tipo: string;
  direccion?: string; numero?: string; piso?: string; referencia?: string;
  pais?: string; region?: string; ciudad?: string; comuna?: string;
  telefono?: string; responsable?: string;
  esSedePrincipal?: boolean; activa?: boolean;
};

export async function crearUbicacion(data: UbicacionData) {
  try {
    if (data.esSedePrincipal) {
      await prisma.ubicacion.updateMany({ where: { esSedePrincipal: true }, data: { esSedePrincipal: false } });
    }
    await prisma.ubicacion.create({ data: { nombre: data.nombre, tipo: data.tipo, ...data } });
    revalidatePath("/configuracion/ubicaciones");
    return { success: true };
  } catch {
    return { success: false, error: "Error al crear la ubicación" };
  }
}

export async function editarUbicacion(id: string, data: UbicacionData) {
  try {
    if (data.esSedePrincipal) {
      await prisma.ubicacion.updateMany({ where: { esSedePrincipal: true, NOT: { id } }, data: { esSedePrincipal: false } });
    }
    await prisma.ubicacion.update({ where: { id }, data });
    revalidatePath("/configuracion/ubicaciones");
    return { success: true };
  } catch {
    return { success: false, error: "Error al editar la ubicación" };
  }
}

export async function eliminarUbicacion(id: string) {
  try {
    await prisma.ubicacion.delete({ where: { id } });
    revalidatePath("/configuracion/ubicaciones");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar la ubicación" };
  }
}

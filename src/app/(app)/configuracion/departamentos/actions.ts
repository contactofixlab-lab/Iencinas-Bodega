"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type DepartamentoData = {
  nombre: string; codigo?: string; descripcion?: string;
  responsable?: string; centroCosto?: string; color?: string; activo?: boolean;
};

export async function crearDepartamento(data: DepartamentoData) {
  try {
    await prisma.departamento.create({ data });
    revalidatePath("/configuracion/departamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Error al crear el departamento" };
  }
}

export async function editarDepartamento(id: string, data: DepartamentoData) {
  try {
    await prisma.departamento.update({ where: { id }, data });
    revalidatePath("/configuracion/departamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Error al editar el departamento" };
  }
}

export async function eliminarDepartamento(id: string) {
  try {
    await prisma.departamento.delete({ where: { id } });
    revalidatePath("/configuracion/departamentos");
    return { success: true };
  } catch {
    return { success: false, error: "Error al eliminar el departamento" };
  }
}

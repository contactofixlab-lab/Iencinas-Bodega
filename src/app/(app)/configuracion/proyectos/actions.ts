"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/login");
  const u = await prisma.colaborador.findUnique({ where: { id: session.uid }, include: { perfil: true } });
  if (!u || u.perfil.nombre !== "Administrador") throw new Error("No autorizado");
  return session;
}

export async function crearProyecto(data: { nombre: string; descripcion?: string; codigoExterno?: string }) {
  await requireAdmin();
  try {
    const proyecto = await prisma.proyecto.create({
      data: {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        codigoExterno: data.codigoExterno?.trim() || null,
      },
    });
    revalidatePath("/configuracion/proyectos");
    return { success: true, data: proyecto };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function actualizarProyecto(id: string, data: { nombre: string; descripcion?: string; codigoExterno?: string; activo?: boolean }) {
  await requireAdmin();
  try {
    const proyecto = await prisma.proyecto.update({
      where: { id },
      data: {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim() || null,
        codigoExterno: data.codigoExterno?.trim() || null,
        activo: data.activo ?? true,
      },
    });
    revalidatePath("/configuracion/proyectos");
    return { success: true, data: proyecto };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function eliminarProyecto(id: string) {
  await requireAdmin();
  try {
    await prisma.proyecto.delete({ where: { id } });
    revalidatePath("/configuracion/proyectos");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

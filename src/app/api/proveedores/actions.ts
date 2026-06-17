"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function sess() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function crearProveedor(data: {
  nombre: string; rut?: string; contacto?: string; email?: string; telefono?: string;
}) {
  const session = await sess();
  try {
    const prov = await prisma.proveedor.create({
      data: {
        nombre: data.nombre,
        rut: data.rut || null,
        contacto: data.contacto || null,
        email: data.email || null,
        telefono: data.telefono || null,
      },
    });
    await prisma.logAuditoria.create({
      data: { colaboradorId: session.uid, accion: "crear", entidad: "Proveedor", detalle: `Creado: ${data.nombre}` },
    });
    return { success: true, data: prov };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function editarProveedor(id: string, data: {
  nombre: string; rut?: string; contacto?: string; email?: string; telefono?: string;
}) {
  const session = await sess();
  try {
    const prov = await prisma.proveedor.update({
      where: { id },
      data: {
        nombre: data.nombre,
        rut: data.rut || null,
        contacto: data.contacto || null,
        email: data.email || null,
        telefono: data.telefono || null,
      },
    });
    await prisma.logAuditoria.create({
      data: { colaboradorId: session.uid, accion: "editar", entidad: "Proveedor", detalle: `Editado: ${prov.nombre}` },
    });
    return { success: true, data: prov };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

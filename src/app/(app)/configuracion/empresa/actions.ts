"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function guardarEmpresa(data: {
  nombre: string;
  razonSocial?: string;
  rut?: string;
  giro?: string;
  email?: string;
  telefono?: string;
  sitioWeb?: string;
  pais?: string;
  region?: string;
  ciudad?: string;
  direccion?: string;
  moneda?: string;
  zonaHoraria?: string;
  logo?: string;
}) {
  try {
    const existing = await prisma.empresa.findFirst();
    if (existing) {
      await prisma.empresa.update({ where: { id: existing.id }, data });
    } else {
      await prisma.empresa.create({ data });
    }
    revalidatePath("/configuracion/empresa");
    return { success: true };
  } catch (e) {
    return { success: false, error: "Error al guardar la empresa" };
  }
}

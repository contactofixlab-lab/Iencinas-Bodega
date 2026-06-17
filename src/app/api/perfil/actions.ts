"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export async function actualizarPerfilPersonal(data: {
  telefonoPersonal?: string; direccion?: string; ciudad?: string;
  region?: string; fechaNacimiento?: string; numeroEmergencia?: string;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  try {
    await prisma.colaborador.update({
      where: { id: session.uid },
      data: {
        telefonoPersonal: data.telefonoPersonal || null,
        direccion: data.direccion || null,
        ciudad: data.ciudad || null,
        region: data.region || null,
        fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
        numeroEmergencia: data.numeroEmergencia || null,
      },
    });
    await prisma.logAuditoria.create({
      data: { colaboradorId: session.uid, accion: "editar", entidad: "Perfil", detalle: "Datos personales actualizados" },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

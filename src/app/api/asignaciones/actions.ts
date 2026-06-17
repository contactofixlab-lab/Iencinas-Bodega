"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function sess() {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

export async function crearAsignacion(data: {
  colaboradorId: string; insumoId: string; cantidad: number;
  numeroSerie?: string; observaciones?: string;
}) {
  const session = await sess();
  try {
    const insumo = await prisma.insumo.findUnique({ where: { id: data.insumoId } });
    if (!insumo) return { success: false, error: "Insumo no encontrado" };
    if (insumo.stockActual < data.cantidad) return { success: false, error: "Stock insuficiente" };

    const asignacion = await prisma.asignacion.create({
      data: {
        colaboradorId: data.colaboradorId,
        insumoId: data.insumoId,
        cantidad: data.cantidad,
        numeroSerie: data.numeroSerie || null,
        observaciones: data.observaciones || null,
        entregadoPor: session.nombre,
      },
    });

    await prisma.insumo.update({
      where: { id: data.insumoId },
      data: { stockActual: { decrement: data.cantidad } },
    });

    await prisma.movimiento.create({
      data: {
        insumoId: data.insumoId, tipo: "asignacion",
        cantidad: data.cantidad, usuario: session.nombre,
        motivo: `Asignado a colaborador`,
      },
    });

    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid, accion: "crear", entidad: "Asignacion",
        detalle: `Asignado ${data.cantidad}x ${insumo.nombre}`,
      },
    });

    return { success: true, data: asignacion };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function aprobarSolicitud(solicitudId: string, comentario?: string) {
  const session = await sess();
  try {
    const solicitud = await prisma.solicitud.findUnique({
      where: { id: solicitudId },
      include: { items: { include: { insumo: true } }, colaborador: true },
    });
    if (!solicitud) return { success: false, error: "Solicitud no encontrada" };
    if (solicitud.estado !== "pendiente") return { success: false, error: "La solicitud ya fue procesada" };

    for (const item of solicitud.items) {
      if (item.insumo.stockActual < item.cantidad) {
        return { success: false, error: `Stock insuficiente para ${item.insumo.nombre}` };
      }
    }

    await prisma.solicitud.update({
      where: { id: solicitudId },
      data: {
        estado: "aprobada",
        comentarioAdmin: comentario || null,
        resueltaPor: session.nombre,
        fechaResolucion: new Date(),
      },
    });

    for (const item of solicitud.items) {
      await prisma.asignacion.create({
        data: {
          colaboradorId: solicitud.colaboradorId,
          insumoId: item.insumoId,
          cantidad: item.cantidad,
          entregadoPor: session.nombre,
        },
      });
      await prisma.insumo.update({
        where: { id: item.insumoId },
        data: { stockActual: { decrement: item.cantidad } },
      });
      await prisma.movimiento.create({
        data: {
          insumoId: item.insumoId, tipo: "asignacion",
          cantidad: item.cantidad, usuario: session.nombre,
          motivo: `Solicitud aprobada #${solicitudId.slice(-6)}`,
        },
      });
    }

    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid, accion: "aprobar", entidad: "Solicitud",
        detalle: `Aprobada solicitud de ${solicitud.colaborador.nombre}`,
      },
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function rechazarSolicitud(solicitudId: string, comentario?: string) {
  const session = await sess();
  try {
    await prisma.solicitud.update({
      where: { id: solicitudId },
      data: {
        estado: "rechazada",
        comentarioAdmin: comentario || null,
        resueltaPor: session.nombre,
        fechaResolucion: new Date(),
      },
    });
    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid, accion: "eliminar", entidad: "Solicitud",
        detalle: `Rechazada solicitud #${solicitudId.slice(-6)}`,
      },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function crearSolicitud(items: Array<{ insumoId: string; cantidad: number; justificacion?: string }>) {
  const session = await sess();
  if (!items.length) return { success: false, error: "Agrega al menos un insumo" };
  try {
    const solicitud = await prisma.solicitud.create({
      data: {
        colaboradorId: session.uid,
        items: {
          create: items.map((it) => ({
            insumoId: it.insumoId,
            cantidad: it.cantidad,
            justificacion: it.justificacion || null,
          })),
        },
      },
    });
    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid, accion: "crear", entidad: "Solicitud",
        detalle: `Nueva solicitud con ${items.length} ítems`,
      },
    });
    return { success: true, data: solicitud };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

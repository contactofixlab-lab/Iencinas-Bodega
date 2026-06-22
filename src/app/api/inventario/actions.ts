"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

async function getSessionOrRedirect() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function crearCategoria(data: { nombre: string; tipo: string; icono?: string }) {
  const session = await getSessionOrRedirect();
  try {
    const cat = await prisma.categoria.create({ data });
    await prisma.logAuditoria.create({
      data: { colaboradorId: session.uid, accion: "crear", entidad: "Categoria", detalle: `Creada: ${data.nombre}` },
    });
    return { success: true, data: cat };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function crearInsumo(data: {
  nombre: string; descripcion?: string; categoriaId: string; sku?: string;
  marca?: string; modelo?: string; unidad: string; stockActual: number;
  stockMinimo: number; ubicacion?: string; proveedorId?: string; esSerializable: boolean;
  empresa?: string; tipoInsumo?: string; ram?: number; almacenamiento?: number;
  numeroSerie?: string; sistemaOperativo?: string; estadoEquipo?: string;
  precioReferencia?: number; precioVendible?: number; precioVendido?: number; formateado?: boolean;
}) {
  const session = await getSessionOrRedirect();
  try {
    const insumo = await prisma.insumo.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        categoriaId: data.categoriaId,
        sku: data.sku || null,
        marca: data.marca || null,
        modelo: data.modelo || null,
        unidad: data.unidad,
        stockActual: data.stockActual,
        stockMinimo: data.stockMinimo,
        ubicacion: data.ubicacion || null,
        proveedorId: data.proveedorId || null,
        esSerializable: data.esSerializable,
        empresa: data.empresa || null,
        tipoInsumo: data.tipoInsumo || null,
        ram: data.ram ?? null,
        almacenamiento: data.almacenamiento ?? null,
        numeroSerie: data.numeroSerie || null,
        sistemaOperativo: data.sistemaOperativo || null,
        estadoEquipo: data.estadoEquipo || null,
        precioReferencia: data.precioReferencia ?? null,
        precioVendible: data.precioVendible ?? null,
        precioVendido: data.precioVendido ?? null,
        formateado: data.formateado ?? false,
      },
    });
    if (data.stockActual > 0) {
      await prisma.movimiento.create({
        data: {
          insumoId: insumo.id, tipo: "entrada",
          cantidad: data.stockActual, motivo: "Stock inicial",
          usuario: session.nombre,
        },
      });
    }
    await prisma.logAuditoria.create({
      data: { colaboradorId: session.uid, accion: "crear", entidad: "Insumo", detalle: `Creado: ${data.nombre}` },
    });
    return { success: true, data: insumo };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function editarInsumo(id: string, data: {
  nombre?: string; descripcion?: string; sku?: string; marca?: string;
  modelo?: string; unidad?: string; stockMinimo?: number; ubicacion?: string;
  proveedorId?: string; categoriaId?: string;
  empresa?: string; tipoInsumo?: string; ram?: number; almacenamiento?: number;
  numeroSerie?: string; sistemaOperativo?: string; estadoEquipo?: string;
  precioReferencia?: number; precioVendible?: number; precioVendido?: number; formateado?: boolean;
}) {
  const session = await getSessionOrRedirect();
  try {
    const insumo = await prisma.insumo.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        sku: data.sku || null,
        marca: data.marca || null,
        modelo: data.modelo || null,
        unidad: data.unidad,
        stockMinimo: data.stockMinimo,
        ubicacion: data.ubicacion || null,
        proveedorId: data.proveedorId || null,
        categoriaId: data.categoriaId,
        empresa: data.empresa || null,
        tipoInsumo: data.tipoInsumo || null,
        ram: data.ram ?? null,
        almacenamiento: data.almacenamiento ?? null,
        numeroSerie: data.numeroSerie || null,
        sistemaOperativo: data.sistemaOperativo || null,
        estadoEquipo: data.estadoEquipo || null,
        precioReferencia: data.precioReferencia ?? null,
        precioVendible: data.precioVendible ?? null,
        precioVendido: data.precioVendido ?? null,
        formateado: data.formateado ?? false,
      },
    });
    await prisma.logAuditoria.create({
      data: { colaboradorId: session.uid, accion: "editar", entidad: "Insumo", detalle: `Editado: ${insumo.nombre}` },
    });
    return { success: true, data: insumo };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function registrarMovimiento(data: {
  insumoId: string; tipo: "entrada" | "salida" | "ajuste"; cantidad: number; motivo?: string;
}) {
  const session = await getSessionOrRedirect();
  try {
    const insumo = await prisma.insumo.findUnique({ where: { id: data.insumoId } });
    if (!insumo) return { success: false, error: "Insumo no encontrado" };

    let nuevoStock = insumo.stockActual;
    if (data.tipo === "entrada") nuevoStock += data.cantidad;
    else if (data.tipo === "salida") {
      if (insumo.stockActual < data.cantidad) return { success: false, error: "Stock insuficiente" };
      nuevoStock -= data.cantidad;
    } else {
      nuevoStock = data.cantidad;
    }

    await prisma.insumo.update({ where: { id: data.insumoId }, data: { stockActual: nuevoStock } });
    const mov = await prisma.movimiento.create({
      data: {
        insumoId: data.insumoId, tipo: data.tipo,
        cantidad: data.cantidad, motivo: data.motivo || null,
        usuario: session.nombre,
      },
    });
    await prisma.logAuditoria.create({
      data: {
        colaboradorId: session.uid, accion: "editar", entidad: "Insumo",
        detalle: `Movimiento ${data.tipo}: ${data.cantidad} de ${insumo.nombre}`,
      },
    });
    return { success: true, data: mov };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

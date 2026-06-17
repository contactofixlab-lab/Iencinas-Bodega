"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { stringify } from "csv-stringify/sync";

interface ReporteConfig {
  tipo: string;
  formato: "pdf" | "excel" | "csv";
  filtros?: Record<string, any>;
}

async function verificarSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

// Reporte 1: Colaboradores por Departamento
export async function generarReporteColaboradoresDepartamento(config: ReporteConfig) {
  await verificarSession();

  const colaboradores = await prisma.colaborador.groupBy({
    by: ["area"],
    _count: { id: true },
  });

  const datos = await prisma.colaborador.findMany({
    select: {
      nombre: true,
      apellidoPaterno: true,
      area: true,
      cargo: true,
      estado: true,
    },
    orderBy: { area: "asc" },
  });

  if (config.formato === "pdf") {
    return generarPDF("Reporte de Colaboradores por Departamento", datos);
  } else if (config.formato === "excel") {
    return generarExcel("Colaboradores", datos);
  } else {
    return generarCSV(datos);
  }
}

// Reporte 2: Inventario Disponible
export async function generarReporteInventario(config: ReporteConfig) {
  await verificarSession();

  const insumos = await prisma.insumo.findMany({
    select: {
      nombre: true,
      sku: true,
      stockActual: true,
      stockMinimo: true,
      categoria: { select: { nombre: true } },
      ubicacion: true,
    },
    orderBy: { categoria: { nombre: "asc" } },
  });

  const datos = insumos.map((item) => ({
    "Nombre": item.nombre,
    "SKU": item.sku || "N/A",
    "Categoría": item.categoria.nombre,
    "Stock Actual": item.stockActual,
    "Stock Mínimo": item.stockMinimo,
    "Ubicación": item.ubicacion || "N/A",
    "Estado": item.stockActual < item.stockMinimo ? "Bajo" : "OK",
  }));

  if (config.formato === "pdf") {
    return generarPDF("Reporte de Inventario Disponible", datos);
  } else if (config.formato === "excel") {
    return generarExcel("Inventario", datos);
  } else {
    return generarCSV(datos);
  }
}

// Reporte 3: Asignaciones Activas
export async function generarReporteAsignaciones(config: ReporteConfig) {
  await verificarSession();

  const asignaciones = await prisma.asignacion.findMany({
    where: { estado: "vigente" },
    select: {
      colaborador: { select: { nombre: true, apellidoPaterno: true } },
      insumo: { select: { nombre: true } },
      cantidad: true,
      fechaAsignacion: true,
      entregadoPor: true,
    },
    orderBy: { fechaAsignacion: "desc" },
  });

  const datos = asignaciones.map((a) => ({
    "Colaborador": `${a.colaborador.nombre} ${a.colaborador.apellidoPaterno}`,
    "Insumo": a.insumo.nombre,
    "Cantidad": a.cantidad,
    "Fecha Asignación": new Date(a.fechaAsignacion).toLocaleDateString("es-CL"),
    "Entregado por": a.entregadoPor || "N/A",
  }));

  if (config.formato === "pdf") {
    return generarPDF("Reporte de Asignaciones Activas", datos);
  } else if (config.formato === "excel") {
    return generarExcel("Asignaciones", datos);
  } else {
    return generarCSV(datos);
  }
}

// Reporte 4: Solicitudes Pendientes
export async function generarReporteSolicitudes(config: ReporteConfig) {
  await verificarSession();

  const solicitudes = await prisma.solicitud.findMany({
    where: { estado: { in: ["pendiente", "aprobada"] } },
    select: {
      id: true,
      colaborador: { select: { nombre: true, apellidoPaterno: true } },
      fecha: true,
      estado: true,
      items: {
        select: {
          insumo: { select: { nombre: true } },
          cantidad: true,
          justificacion: true,
        },
      },
    },
    orderBy: { fecha: "desc" },
  });

  const datos = solicitudes.flatMap((s) =>
    s.items.map((item) => ({
      "ID Solicitud": s.id.slice(0, 8),
      "Colaborador": `${s.colaborador.nombre} ${s.colaborador.apellidoPaterno}`,
      "Insumo": item.insumo.nombre,
      "Cantidad": item.cantidad,
      "Justificación": item.justificacion || "N/A",
      "Estado": s.estado,
      "Fecha": new Date(s.fecha).toLocaleDateString("es-CL"),
    }))
  );

  if (config.formato === "pdf") {
    return generarPDF("Reporte de Solicitudes Pendientes", datos);
  } else if (config.formato === "excel") {
    return generarExcel("Solicitudes", datos);
  } else {
    return generarCSV(datos);
  }
}

// Reporte 5: Movimientos de Inventario (Últimos 30 días)
export async function generarReporteMovimientos(config: ReporteConfig) {
  await verificarSession();

  const hace30Dias = new Date();
  hace30Dias.setDate(hace30Dias.getDate() - 30);

  const movimientos = await prisma.movimiento.findMany({
    where: { fecha: { gte: hace30Dias } },
    select: {
      insumo: { select: { nombre: true } },
      tipo: true,
      cantidad: true,
      fecha: true,
      usuario: true,
      motivo: true,
    },
    orderBy: { fecha: "desc" },
  });

  const datos = movimientos.map((m) => ({
    "Insumo": m.insumo.nombre,
    "Tipo": m.tipo,
    "Cantidad": m.cantidad,
    "Fecha": new Date(m.fecha).toLocaleDateString("es-CL"),
    "Usuario": m.usuario || "Sistema",
    "Motivo": m.motivo || "N/A",
  }));

  if (config.formato === "pdf") {
    return generarPDF("Reporte de Movimientos (Últimos 30 días)", datos);
  } else if (config.formato === "excel") {
    return generarExcel("Movimientos", datos);
  } else {
    return generarCSV(datos);
  }
}

// Preview con datos reales (retorna JSON, no Buffer)
export async function previsualizarDatos(tipo: string, limite: number = 10): Promise<{ columnas: string[]; filas: Record<string, string>[] }> {
  await verificarSession();

  switch (tipo) {
    case "colaboradores": {
      const datos = await prisma.colaborador.findMany({
        take: limite,
        select: { nombre: true, apellidoPaterno: true, area: true, cargo: true, disponibilidad: true },
        orderBy: { nombre: "asc" },
      });
      return {
        columnas: ["Nombre", "Apellido", "Área", "Cargo", "Estado"],
        filas: datos.map(d => ({ "Nombre": d.nombre, "Apellido": d.apellidoPaterno, "Área": d.area || "—", "Cargo": d.cargo || "—", "Estado": d.disponibilidad })),
      };
    }
    case "inventario": {
      const datos = await prisma.insumo.findMany({
        take: limite,
        select: { nombre: true, sku: true, stockActual: true, stockMinimo: true, categoria: { select: { nombre: true } }, ubicacion: true },
        orderBy: { nombre: "asc" },
      });
      return {
        columnas: ["Nombre", "SKU", "Categoría", "Stock", "Mínimo", "Ubicación", "Estado"],
        filas: datos.map(d => ({
          "Nombre": d.nombre, "SKU": d.sku || "—", "Categoría": d.categoria.nombre,
          "Stock": String(d.stockActual), "Mínimo": String(d.stockMinimo),
          "Ubicación": d.ubicacion || "—",
          "Estado": d.stockActual <= d.stockMinimo ? "⚠ Bajo" : "✓ OK",
        })),
      };
    }
    case "asignaciones": {
      const datos = await prisma.asignacion.findMany({
        take: limite, where: { estado: "vigente" },
        select: { colaborador: { select: { nombre: true, apellidoPaterno: true } }, insumo: { select: { nombre: true } }, cantidad: true, fechaAsignacion: true, entregadoPor: true },
        orderBy: { fechaAsignacion: "desc" },
      });
      return {
        columnas: ["Colaborador", "Insumo", "Cantidad", "Fecha", "Entregó"],
        filas: datos.map(d => ({
          "Colaborador": `${d.colaborador.nombre} ${d.colaborador.apellidoPaterno}`,
          "Insumo": d.insumo.nombre, "Cantidad": String(d.cantidad),
          "Fecha": new Date(d.fechaAsignacion).toLocaleDateString("es-CL"),
          "Entregó": d.entregadoPor || "—",
        })),
      };
    }
    case "solicitudes": {
      const datos = await prisma.solicitud.findMany({
        take: limite,
        select: { colaborador: { select: { nombre: true, apellidoPaterno: true } }, fecha: true, estado: true, items: { select: { insumo: { select: { nombre: true } }, cantidad: true } } },
        orderBy: { fecha: "desc" },
      });
      return {
        columnas: ["Colaborador", "Insumos", "Estado", "Fecha"],
        filas: datos.map(d => ({
          "Colaborador": `${d.colaborador.nombre} ${d.colaborador.apellidoPaterno}`,
          "Insumos": d.items.map(i => `${i.cantidad}× ${i.insumo.nombre}`).join(", "),
          "Estado": d.estado, "Fecha": new Date(d.fecha).toLocaleDateString("es-CL"),
        })),
      };
    }
    case "movimientos": {
      const datos = await prisma.movimiento.findMany({
        take: limite,
        select: { insumo: { select: { nombre: true } }, tipo: true, cantidad: true, fecha: true, usuario: true, motivo: true },
        orderBy: { fecha: "desc" },
      });
      return {
        columnas: ["Insumo", "Tipo", "Cantidad", "Fecha", "Usuario", "Motivo"],
        filas: datos.map(d => ({
          "Insumo": d.insumo.nombre, "Tipo": d.tipo, "Cantidad": String(d.cantidad),
          "Fecha": new Date(d.fecha).toLocaleDateString("es-CL"),
          "Usuario": d.usuario || "Sistema", "Motivo": d.motivo || "—",
        })),
      };
    }
    default:
      return { columnas: [], filas: [] };
  }
}

// ─── REPORTE PERSONALIZADO CON ENTIDADES ────────────────────────────────────

async function extraerDatosEstrategia(estrategia: string, limite?: number): Promise<Record<string, string>[]> {
  const take = limite ?? 9999;

  switch (estrategia) {
    case "colaboradores": {
      const d = await prisma.colaborador.findMany({ take, orderBy: { nombre: "asc" } });
      return d.map(r => ({
        colNombre: r.nombre, colApellido: r.apellidoPaterno,
        colApellidoM: r.apellidoMaterno ?? "—", colCorreo: r.correo,
        colArea: r.area ?? "—", colCargo: r.cargo ?? "—",
        colEstado: r.disponibilidad, colRut: r.rutPersonal ?? "—",
        colTelPersonal: r.telefonoPersonal ?? "—", colTelCorp: r.telefonoCorporativo ?? "—",
        colCiudad: r.ciudad ?? "—", colRegion: r.region ?? "—",
        colCentrodeCosto: r.centrodeCosto ?? "—",
        colFechaIngreso: new Date(r.fechaIngreso).toLocaleDateString("es-CL"),
      }));
    }
    case "insumos": {
      const d = await prisma.insumo.findMany({ take, include: { categoria: true, proveedor: true }, orderBy: { nombre: "asc" } });
      return d.map(r => ({
        insNombre: r.nombre, insSKU: r.sku ?? "—", insMarca: r.marca ?? "—",
        insModelo: r.modelo ?? "—", insUnidad: r.unidad,
        insStockActual: String(r.stockActual), insStockMinimo: String(r.stockMinimo),
        insEstadoStock: r.stockActual <= r.stockMinimo ? "⚠ Bajo" : "✓ OK",
        insUbicacion: r.ubicacion ?? "—",
        catNombre: r.categoria.nombre,
        provNombre: r.proveedor?.nombre ?? "—",
      }));
    }
    case "asignaciones": {
      const d = await prisma.asignacion.findMany({
        take,
        include: { colaborador: true, insumo: { include: { categoria: true, proveedor: true } } },
        orderBy: { fechaAsignacion: "desc" },
      });
      return d.map(r => ({
        colNombre: r.colaborador.nombre, colApellido: r.colaborador.apellidoPaterno,
        colArea: r.colaborador.area ?? "—", colCargo: r.colaborador.cargo ?? "—",
        colCorreo: r.colaborador.correo, colEstado: r.colaborador.disponibilidad,
        colRut: r.colaborador.rutPersonal ?? "—", colCiudad: r.colaborador.ciudad ?? "—",
        colFechaIngreso: new Date(r.colaborador.fechaIngreso).toLocaleDateString("es-CL"),
        asigCantidad: String(r.cantidad),
        asigFecha: new Date(r.fechaAsignacion).toLocaleDateString("es-CL"),
        asigEstado: r.estado, asigSerie: r.numeroSerie ?? "—",
        asigEntregadoPor: r.entregadoPor ?? "—", asigObs: r.observaciones ?? "—",
        insNombre: r.insumo.nombre, insSKU: r.insumo.sku ?? "—",
        insMarca: r.insumo.marca ?? "—", insUnidad: r.insumo.unidad,
        insStockActual: String(r.insumo.stockActual), insUbicacion: r.insumo.ubicacion ?? "—",
        catNombre: r.insumo.categoria.nombre, provNombre: r.insumo.proveedor?.nombre ?? "—",
      }));
    }
    case "solicitudes": {
      const d = await prisma.solicitud.findMany({
        take, include: { colaborador: true, items: { include: { insumo: true } } },
        orderBy: { fecha: "desc" },
      });
      return d.flatMap(s =>
        s.items.map(item => ({
          colNombre: s.colaborador.nombre, colApellido: s.colaborador.apellidoPaterno,
          colArea: s.colaborador.area ?? "—", colCargo: s.colaborador.cargo ?? "—",
          solicEstado: s.estado,
          solicFecha: new Date(s.fecha).toLocaleDateString("es-CL"),
          solicComentario: s.comentarioAdmin ?? "—",
          insNombre: item.insumo.nombre, itemCantidad: String(item.cantidad),
          itemJustificacion: item.justificacion ?? "—",
        }))
      );
    }
    case "movimientos": {
      const d = await prisma.movimiento.findMany({
        take, include: { insumo: { include: { categoria: true } } },
        orderBy: { fecha: "desc" },
      });
      return d.map(r => ({
        insNombre: r.insumo.nombre, insSKU: r.insumo.sku ?? "—",
        catNombre: r.insumo.categoria.nombre, insStockActual: String(r.insumo.stockActual),
        movTipo: r.tipo, movCantidad: String(r.cantidad),
        movFecha: new Date(r.fecha).toLocaleDateString("es-CL"),
        movUsuario: r.usuario ?? "Sistema", movMotivo: r.motivo ?? "—",
      }));
    }
    default:
      return [];
  }
}

// Helpers para aplanar columnas de todos los grupos de la estrategia
function todosColsDeEstrategia(grupos: Record<string, { columnas: Record<string, string> }>) {
  const map: Record<string, string> = {};
  Object.values(grupos).forEach(g => Object.assign(map, g.columnas));
  return map;
}

export async function previsualizarConEntidades(
  estrategia: string,
  columnasSeleccionadas: string[],
  limite: number = 25
): Promise<{ columnas: string[]; filas: Record<string, string>[] }> {
  await verificarSession();
  if (!columnasSeleccionadas.length) return { columnas: [], filas: [] };

  const { ESTRATEGIA_GRUPOS } = await import("@/lib/reportes-config");
  const grupos = ESTRATEGIA_GRUPOS[estrategia as keyof typeof ESTRATEGIA_GRUPOS];
  if (!grupos) return { columnas: [], filas: [] };

  const mapaCol = todosColsDeEstrategia(grupos);
  const cols = columnasSeleccionadas.filter(c => c in mapaCol);
  const labels = cols.map(c => mapaCol[c]);
  const rawData = await extraerDatosEstrategia(estrategia, limite);

  const filas = rawData.map(row => {
    const fila: Record<string, string> = {};
    cols.forEach(c => { fila[mapaCol[c]] = row[c] ?? "—"; });
    return fila;
  });

  return { columnas: labels, filas };
}

export async function generarArchivoConEntidades(
  estrategia: string,
  columnasSeleccionadas: string[],
  formato: "pdf" | "excel" | "csv",
  titulo: string = "Reporte personalizado"
): Promise<Buffer> {
  await verificarSession();
  const { ESTRATEGIA_GRUPOS } = await import("@/lib/reportes-config");
  const grupos = ESTRATEGIA_GRUPOS[estrategia as keyof typeof ESTRATEGIA_GRUPOS];
  if (!grupos) return Buffer.alloc(0);

  const mapaCol = todosColsDeEstrategia(grupos);
  const cols = columnasSeleccionadas.filter(c => c in mapaCol);
  const rawData = await extraerDatosEstrategia(estrategia);

  const datos = rawData.map(row => {
    const fila: Record<string, string> = {};
    cols.forEach(c => { fila[mapaCol[c]] = row[c] ?? "—"; });
    return fila;
  });

  if (formato === "pdf") return generarPDF(titulo, datos);
  if (formato === "excel") return generarExcel(estrategia, datos);
  return generarCSV(datos);
}

// Funciones auxiliares
function generarPDF(titulo: string, datos: any[]) {
  const doc = new PDFDocument();
  let buffer = Buffer.alloc(0);

  doc.on("data", (chunk: Buffer) => {
    buffer = Buffer.concat([buffer, chunk]);
  });

  doc.fontSize(16).text(titulo, { align: "center" });
  doc.moveDown();
  doc.fontSize(10);

  if (datos.length > 0) {
    const headers = Object.keys(datos[0]);
    const columnWidth = (doc.page.width - 40) / headers.length;

    // Headers
    doc.font("Helvetica-Bold");
    headers.forEach((header) => {
      doc.text(header, { width: columnWidth, continued: true });
    });
    doc.moveDown();

    // Datos
    doc.font("Helvetica");
    datos.forEach((row) => {
      headers.forEach((header) => {
        doc.text(String(row[header] || ""), { width: columnWidth, continued: true });
      });
      doc.moveDown();
    });
  }

  doc.end();

  return new Promise<Buffer>((resolve) => {
    doc.on("finish", () => resolve(buffer));
  });
}

async function generarExcel(nombre: string, datos: any[]) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(nombre);

  if (datos.length > 0) {
    worksheet.columns = Object.keys(datos[0]).map((key) => ({
      header: key,
      key,
      width: 15,
    }));

    datos.forEach((row) => {
      worksheet.addRow(row);
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

function generarCSV(datos: any[]) {
  return Buffer.from(stringify(datos, { header: true }));
}

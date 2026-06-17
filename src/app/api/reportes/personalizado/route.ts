import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { generarArchivoConEntidades } from "../actions";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { estrategia, columnas, formato, titulo } = await request.json();

  if (!estrategia || !columnas?.length || !formato) {
    return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
  }

  const buffer = await generarArchivoConEntidades(estrategia, columnas, formato, titulo);

  const ext = formato === "excel" ? "xlsx" : formato;
  const filename = `${titulo || `Reporte_${estrategia}`}_${new Date().toISOString().split("T")[0]}.${ext}`;

  const contentType =
    formato === "pdf" ? "application/pdf"
    : formato === "excel" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv";

  return new Response(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
    },
  });
}

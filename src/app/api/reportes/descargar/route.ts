import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  generarReporteColaboradoresDepartamento,
  generarReporteInventario,
  generarReporteAsignaciones,
  generarReporteSolicitudes,
  generarReporteMovimientos,
} from "../actions";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const tipo = searchParams.get("tipo") || "colaboradores";
    const formato = (searchParams.get("formato") || "pdf") as "pdf" | "excel" | "csv";

    let buffer: Buffer;
    let filename: string;
    let contentType: string;

    switch (tipo) {
      case "colaboradores":
        buffer = await generarReporteColaboradoresDepartamento({ tipo, formato });
        filename = `Reporte_Colaboradores_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
        break;
      case "inventario":
        buffer = await generarReporteInventario({ tipo, formato });
        filename = `Reporte_Inventario_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
        break;
      case "asignaciones":
        buffer = await generarReporteAsignaciones({ tipo, formato });
        filename = `Reporte_Asignaciones_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
        break;
      case "solicitudes":
        buffer = await generarReporteSolicitudes({ tipo, formato });
        filename = `Reporte_Solicitudes_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
        break;
      case "movimientos":
        buffer = await generarReporteMovimientos({ tipo, formato });
        filename = `Reporte_Movimientos_${new Date().toISOString().split("T")[0]}.${formato === "excel" ? "xlsx" : formato}`;
        break;
      default:
        return NextResponse.json({ error: "Tipo de reporte inválido" }, { status: 400 });
    }

    if (formato === "pdf") {
      contentType = "application/pdf";
    } else if (formato === "excel") {
      contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    } else {
      contentType = "text/csv";
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

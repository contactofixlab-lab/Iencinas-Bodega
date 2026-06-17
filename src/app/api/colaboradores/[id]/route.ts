import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const colaborador = await prisma.colaborador.findUnique({
      where: { id: params.id },
      include: { perfil: true },
    });

    if (!colaborador) {
      return NextResponse.json(
        { error: "Colaborador no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(colaborador);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

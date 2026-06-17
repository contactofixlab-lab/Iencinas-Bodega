import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/session";

const schema = z.object({
  correo: z.string().email("Correo inválido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const MAX_INTENTOS = 5;
const BLOQUEO_MIN = 10;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { correo, password } = parsed.data;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  const user = await prisma.colaborador.findUnique({
    where: { correo: correo.toLowerCase() },
    include: { perfil: true },
  });

  // Respuesta genérica para no revelar si el correo existe.
  const credsInvalidas = NextResponse.json(
    { error: "Correo o contraseña incorrectos" },
    { status: 401 },
  );

  if (!user) {
    await prisma.logAuditoria.create({
      data: { accion: "login_fallido", detalle: `correo inexistente: ${correo}`, ip },
    });
    return credsInvalidas;
  }

  if (user.estado !== "activo") {
    return NextResponse.json({ error: "Usuario inactivo. Contacta al administrador." }, { status: 403 });
  }

  if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
    return NextResponse.json(
      { error: "Cuenta bloqueada temporalmente por intentos fallidos. Intenta más tarde." },
      { status: 429 },
    );
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const intentos = user.intentosFallidos + 1;
    const bloquear = intentos >= MAX_INTENTOS;
    await prisma.colaborador.update({
      where: { id: user.id },
      data: {
        intentosFallidos: bloquear ? 0 : intentos,
        bloqueadoHasta: bloquear ? new Date(Date.now() + BLOQUEO_MIN * 60_000) : null,
      },
    });
    await prisma.logAuditoria.create({
      data: { colaboradorId: user.id, accion: "login_fallido", ip, detalle: `intento ${intentos}` },
    });
    return credsInvalidas;
  }

  // Éxito: resetear intentos, registrar acceso y crear sesión.
  await prisma.colaborador.update({
    where: { id: user.id },
    data: { intentosFallidos: 0, bloqueadoHasta: null, ultimoAcceso: new Date() },
  });
  await prisma.logAuditoria.create({
    data: { colaboradorId: user.id, accion: "login", ip },
  });

  await setSessionCookie({
    uid: user.id,
    nombre: `${user.nombre} ${user.apellidoPaterno}`,
    correo: user.correo,
    perfil: user.perfil.nombre,
    perfilId: user.perfilId,
  });

  return NextResponse.json({ ok: true });
}

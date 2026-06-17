import "server-only";
import { redirect } from "next/navigation";
import { getSession, type SessionData } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parsePermisos, type Modulo, type Permisos } from "@/lib/permisos";

/** Exige sesión + permiso de lectura sobre un módulo. Redirige si no cumple. */
export async function requireModulo(
  modulo: Modulo,
): Promise<{ session: SessionData; permisos: Permisos }> {
  const session = await getSession();
  if (!session) redirect("/login");

  const perfil = await prisma.perfil.findUnique({ where: { id: session.perfilId } });
  const permisos = parsePermisos(perfil?.permisos ?? "{}");

  if (!permisos[modulo].ver) {
    // Sin acceso al módulo → enviar a Mi Espacio (disponible para todos)
    redirect("/mi-perfil");
  }
  return { session, permisos };
}

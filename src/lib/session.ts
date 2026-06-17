import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "yb_session";
const MAX_AGE = 60 * 60 * 8; // 8 horas

export type SessionData = {
  uid: string;
  nombre: string;
  correo: string;
  perfil: string; // nombre del perfil
  perfilId: string;
};

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET en el entorno");
  return new TextEncoder().encode(secret);
}

export async function encryptSession(data: SessionData): Promise<string> {
  return new SignJWT({ ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function decryptSession(token: string | undefined): Promise<SessionData | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: ["HS256"] });
    return {
      uid: String(payload.uid),
      nombre: String(payload.nombre),
      correo: String(payload.correo),
      perfil: String(payload.perfil),
      perfilId: String(payload.perfilId),
    };
  } catch {
    return null;
  }
}

/** Lee la sesión desde la cookie (Server Components / Route Handlers). */
export async function getSession(): Promise<SessionData | null> {
  const store = await cookies();
  return decryptSession(store.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(data: SessionData): Promise<void> {
  const token = await encryptSession(data);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

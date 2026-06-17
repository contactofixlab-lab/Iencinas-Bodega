import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "yb_session";

async function tieneSesionValida(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret), { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const autenticado = await tieneSesionValida(token);

  const esLogin = pathname === "/login";

  // Usuario autenticado que visita /login → al dashboard
  if (esLogin && autenticado) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Ruta protegida sin sesión → al login (guardando destino)
  if (!esLogin && !autenticado) {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Protege todo menos: API, estáticos, imágenes, assets y favicon.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

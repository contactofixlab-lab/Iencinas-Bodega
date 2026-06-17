import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parsePermisos, MODULOS, type Modulo } from "@/lib/permisos";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const perfil = await prisma.perfil.findUnique({ where: { id: session.perfilId } });
  const permisos = parsePermisos(perfil?.permisos ?? "{}");
  const visibles = MODULOS.filter((m: Modulo) => permisos[m].ver);

  return (
    <div className="relative">
      {/* Sidebar flotante fijo */}
      <Sidebar nombre={session.nombre} perfil={session.perfil} visibles={visibles} />

      {/* Contenido principal con margen para el sidebar */}
      <div className="md:ml-[264px] min-h-screen flex flex-col">
        {/* Topbar flotante sticky */}
        <div className="sticky top-3 z-20 px-3 pt-0">
          <Topbar nombre={session.nombre} perfil={session.perfil} />
        </div>

        <main className="flex-1 px-5 pb-10 pt-4">{children}</main>
      </div>
    </div>
  );
}

"use client";

import { useRouter, usePathname } from "next/navigation";
import { LogOut } from "@/components/icons";

const PAGE_NAMES: Record<string, string> = {
  "/dashboard":                    "Dashboard",
  "/inventario":                   "Inventario",
  "/colaboradores":                "Colaboradores",
  "/asignaciones":                 "Asignaciones",
  "/proveedores":                  "Proveedores",
  "/configuracion/empresa":        "Empresa",
  "/configuracion/ubicaciones":    "Ubicaciones",
  "/configuracion/departamentos":  "Departamentos",
  "/configuracion/proyectos":      "Proyectos",
  "/mi-perfil":                    "Mi Perfil",
  "/mis-asignaciones":             "Mis Asignaciones",
};

export default function Topbar({ nombre, perfil }: { nombre: string; perfil: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const pageName = PAGE_NAMES[pathname] ?? "Office Manager";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="glass-nav flex items-center justify-between rounded-2xl px-5 py-3">
      {/* Izquierda: nombre de sección actual */}
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 w-1.5 rounded-full bg-brand-blue shadow-[0_0_8px_rgba(6,113,174,0.9)] flex-shrink-0" />
        <span className="text-[11px] font-semibold uppercase tracking-widest text-text-soft/60">
          iencinas
        </span>
        <span className="text-text-soft/30">/</span>
        <span className="text-sm font-semibold text-foreground">{pageName}</span>
      </div>

      {/* Derecha: usuario + logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2.5">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green shadow-[0_0_6px_rgba(132,206,37,0.9)]" />
          <span className="text-sm text-text-soft">{nombre}</span>
          <span className="rounded-full border border-brand-green/30 bg-brand-green/10 px-2.5 py-0.5 text-[11px] font-medium text-brand-green">
            {perfil}
          </span>
        </div>
        <div className="hidden sm:block h-4 w-px bg-white/12" />
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-text-soft transition-all hover:border-red-400/40 hover:bg-red-500/8 hover:text-red-300"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:block">Salir</span>
        </button>
      </div>
    </header>
  );
}

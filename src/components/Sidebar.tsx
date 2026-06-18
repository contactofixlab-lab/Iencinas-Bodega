"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  Users,
  ArrowLeftRight,
  Truck,
  UserCircle,
  Package,
  Building2,
  MapPin,
  FolderKanban,
  Settings2,
  type LucideIcon,
} from "@/components/icons";
import type { Modulo } from "@/lib/permisos";

type Item = { label: string; href: string; icon: LucideIcon; modulo: Modulo };

const ADMIN: Item[] = [
  { label: "Dashboard",     href: "/dashboard",     icon: LayoutDashboard, modulo: "dashboard" },
  { label: "Inventario",    href: "/inventario",    icon: Boxes,           modulo: "inventario" },
  { label: "Colaboradores", href: "/colaboradores", icon: Users,           modulo: "colaboradores" },
  { label: "Asignaciones",  href: "/asignaciones",  icon: ArrowLeftRight,  modulo: "asignaciones" },
  { label: "Proveedores",   href: "/proveedores",   icon: Truck,           modulo: "proveedores" },
];

const CONFIGURACION: Item[] = [
  { label: "Empresa",       href: "/configuracion/empresa",       icon: Building2,    modulo: "configuracion" },
  { label: "Ubicaciones",   href: "/configuracion/ubicaciones",   icon: MapPin,       modulo: "configuracion" },
  { label: "Departamentos", href: "/configuracion/departamentos", icon: FolderKanban, modulo: "configuracion" },
];

const MI_ESPACIO: Item[] = [
  { label: "Mi perfil",        href: "/mi-perfil",        icon: UserCircle, modulo: "mi_espacio" },
  { label: "Mis asignaciones", href: "/mis-asignaciones", icon: Package,    modulo: "mi_espacio" },
];

export default function Sidebar({
  nombre,
  perfil,
  visibles,
}: {
  nombre: string;
  perfil: string;
  visibles: Modulo[];
}) {
  const pathname = usePathname();
  const adminItems  = ADMIN.filter((i) => visibles.includes(i.modulo));
  const configItems = visibles.includes("configuracion") ? CONFIGURACION : [];
  const miEspacio   = visibles.includes("mi_espacio")   ? MI_ESPACIO    : [];

  return (
    <aside className="glass-nav fixed left-3 top-3 bottom-3 z-30 hidden w-[240px] flex-col rounded-2xl md:flex overflow-hidden">
      {/* Línea superior de brillo */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <Image src="/logo-iencinas.svg" alt="iencinas" width={140} height={44} priority />
        <div className="mt-2.5 flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(132,206,37,1)] flex-shrink-0" />
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-green text-glow-green">
            Office Manager
          </p>
        </div>
      </div>

      {/* Separador */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/12 to-transparent flex-shrink-0" />

      {/* Navegación */}
      <nav className="scrollbar-thin flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {adminItems.length > 0 && (
          <Section title="Área Administrativa" icon={<LayoutDashboard className="h-3 w-3" />}>
            {adminItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </Section>
        )}

        {configItems.length > 0 && (
          <Section title="Configuración" icon={<Settings2 className="h-3 w-3" />}>
            {configItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </Section>
        )}

        {miEspacio.length > 0 && (
          <Section title="Mi Espacio" icon={<UserCircle className="h-3 w-3" />}>
            {miEspacio.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </Section>
        )}
      </nav>

      {/* Separador */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent flex-shrink-0" />

      {/* Usuario */}
      <div className="p-3 flex-shrink-0">
        <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5 backdrop-blur">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/70 to-brand-blue/30 text-sm font-bold text-white ring-2 ring-brand-green/30">
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-foreground">{nombre}</p>
            <p className="truncate text-[10px] text-text-soft/70">{perfil}</p>
          </div>
        </div>
      </div>

      {/* Línea inferior de brillo */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-blue/30 to-transparent pointer-events-none" />
    </aside>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-1">
      <div className="mb-1.5 flex items-center gap-1.5 px-3 pt-3">
        {icon && <span className="text-brand-green/60">{icon}</span>}
        <p className="text-[10px] font-bold uppercase tracking-widest bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
          {title}
        </p>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function NavLink({ item, pathname }: { item: Item; pathname: string }) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 overflow-hidden ${
        active
          ? "bg-gradient-to-r from-brand-blue/30 via-brand-blue/12 to-transparent text-white font-semibold"
          : "text-text-soft hover:bg-white/[0.06] hover:text-foreground"
      }`}
    >
      {/* Acento izquierdo activo */}
      {active && (
        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-brand-green shadow-[0_0_12px_rgba(132,206,37,0.9)]" />
      )}
      <Icon
        className={`h-[17px] w-[17px] flex-shrink-0 transition-all duration-200 ${
          active
            ? "text-brand-green drop-shadow-[0_0_6px_rgba(132,206,37,0.8)]"
            : "text-text-soft/60 group-hover:text-foreground"
        }`}
      />
      <span className="leading-none tracking-tight">{item.label}</span>
    </Link>
  );
}

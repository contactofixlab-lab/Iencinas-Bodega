import Link from "next/link";
import { Users, Plus, Edit, Eye } from "lucide-react";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Colaboradores - Yencinas Bodega",
};

export default async function ColaboradoresPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const colaboradores = await prisma.colaborador.findMany({
    include: { perfil: true },
    orderBy: { nombre: "asc" },
  });

  const perfiles = await prisma.perfil.findMany();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-brand-green" />
          <h1 className="text-3xl font-bold">Colaboradores</h1>
        </div>
        <Link
          href="/colaboradores/crear"
          className="btn-green flex items-center gap-2"
        >
          <Plus className="h-5 w-5" /> Nuevo colaborador
        </Link>
      </div>

      {/* Tabla de colaboradores */}
      <div className="glass overflow-hidden rounded-2xl">
        <div className="scrollbar-thin overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.03]">
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Nombre
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Correo
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Cargo
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Área
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Perfil
                </th>
                <th className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Estado
                </th>
                <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-widest text-text-soft/60">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {colaboradores.map((col) => (
                <tr key={col.id} className="group transition-colors hover:bg-white/[0.025]">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-foreground">{col.nombre} {col.apellidoPaterno}</p>
                    {col.telefonoPersonal && (
                      <p className="text-xs text-text-soft/60">{col.telefonoPersonal}</p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-text-soft">{col.correo}</td>
                  <td className="px-5 py-3.5 text-sm text-text-soft">{col.cargo || "—"}</td>
                  <td className="px-5 py-3.5 text-sm text-text-soft">{col.area || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center rounded-full border border-brand-green/40 bg-brand-green/10 px-2.5 py-1 text-[11px] font-medium text-brand-green">
                      {col.perfil.nombre}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                        col.estado === "activo"
                          ? "border-green-500/30 bg-green-500/10 text-green-400"
                          : "border-gray-500/30 bg-gray-500/10 text-gray-400"
                      }`}
                    >
                      {col.estado}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/colaboradores/${col.id}`}
                        className="rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-1.5 text-brand-blue-bright hover:bg-brand-blue/20 transition-all"
                        title="Ver perfil"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/colaboradores/${col.id}/editar`}
                        className="rounded-lg border border-brand-green/30 bg-brand-green/10 p-1.5 text-brand-green hover:bg-brand-green/20 transition-all"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {colaboradores.length === 0 && (
        <div className="glass-strong rounded-lg p-8 text-center">
          <Users className="mx-auto mb-4 h-12 w-12 text-text-soft/50" />
          <p className="text-text-soft">No hay colaboradores registrados</p>
          <Link href="/colaboradores/crear" className="btn-green mt-4 inline-block">
            Crear el primer colaborador
          </Link>
        </div>
      )}
    </div>
  );
}

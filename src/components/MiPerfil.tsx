"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Calendar, Building, Briefcase, User, Shield } from "@/components/icons";
import type { Colaborador, Perfil } from "@prisma/client";
import Modal from "@/components/Modal";
import { actualizarPerfilPersonal } from "@/app/api/perfil/actions";
import { useRouter } from "next/navigation";

type ColaboradorConPerfil = Colaborador & { perfil: Perfil };

const Inp = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

export default function MiPerfil({ usuario }: { usuario: ColaboradorConPerfil }) {
  const router = useRouter();
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    telefonoPersonal: usuario.telefonoPersonal ?? "",
    direccion: usuario.direccion ?? "",
    ciudad: usuario.ciudad ?? "",
    region: usuario.region ?? "",
    fechaNacimiento: usuario.fechaNacimiento ? new Date(usuario.fechaNacimiento).toISOString().split("T")[0] : "",
    numeroEmergencia: usuario.numeroEmergencia ?? "",
  });

  const handleGuardar = async () => {
    setLoading(true); setError("");
    const r = await actualizarPerfilPersonal(form);
    setLoading(false);
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setModal(false); router.refresh();
  };

  const nombreCompleto = `${usuario.nombre} ${usuario.apellidoPaterno}${usuario.apellidoMaterno ? ` ${usuario.apellidoMaterno}` : ""}`;
  const iniciales = `${usuario.nombre.charAt(0)}${usuario.apellidoPaterno.charAt(0)}`;

  return (
    <div className="space-y-8 p-6">
      {/* Encabezado con avatar y nombre */}
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-brand-blue/40 to-brand-green/40 text-2xl font-bold text-brand-green">
          {iniciales}
        </div>
        <div>
          <h1 className="text-3xl font-bold">{nombreCompleto}</h1>
          <p className="text-text-soft">{usuario.cargo || "Sin cargo asignado"}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Burbuja 1: Datos Personales */}
        <div className="glass-strong rounded-xl p-6">
          <div className="mb-6 flex items-center gap-2">
            <User className="h-5 w-5 text-brand-green" />
            <h2 className="text-xl font-semibold">Datos Personales</h2>
          </div>

          <div className="space-y-4">
            {/* Correo Personal */}
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-text-soft">Correo Personal</p>
                <p className="text-sm font-medium">No disponible</p>
                <p className="text-xs text-text-soft">(Próximamente editable en tu perfil)</p>
              </div>
            </div>

            {/* Teléfono Personal */}
            {usuario.telefonoPersonal && (
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Teléfono Personal</p>
                  <p className="text-sm font-medium">{usuario.telefonoPersonal}</p>
                </div>
              </div>
            )}

            {/* RUT */}
            {usuario.rutPersonal && (
              <div className="flex items-start gap-3">
                <Shield className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">RUT</p>
                  <p className="text-sm font-medium">{usuario.rutPersonal}</p>
                </div>
              </div>
            )}

            {/* Dirección */}
            {usuario.direccion && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Dirección</p>
                  <p className="text-sm font-medium">{usuario.direccion}</p>
                  {usuario.ciudad && <p className="text-xs text-text-soft">{usuario.ciudad}, {usuario.region}</p>}
                </div>
              </div>
            )}

            {/* Fecha Nacimiento */}
            {usuario.fechaNacimiento && (
              <div className="flex items-start gap-3">
                <Calendar className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Fecha Nacimiento</p>
                  <p className="text-sm font-medium">{new Date(usuario.fechaNacimiento).toLocaleDateString("es-CL")}</p>
                </div>
              </div>
            )}

            {/* Número de Emergencia */}
            {usuario.numeroEmergencia && (
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-brand-green flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Contacto Emergencia</p>
                  <p className="text-sm font-medium text-brand-green">{usuario.numeroEmergencia}</p>
                </div>
              </div>
            )}
          </div>

          {/* Botón editar */}
          <div className="mt-6 border-t border-white/10 pt-4">
            <button onClick={() => setModal(true)} className="btn-green w-full py-2 text-sm">Editar datos personales</button>
          </div>
        </div>

        {/* Burbuja 2: Datos Empresa */}
        <div className="glass-strong rounded-xl p-6">
          <div className="mb-6 flex items-center gap-2">
            <Building className="h-5 w-5 text-brand-green" />
            <h2 className="text-xl font-semibold">Datos Empresa</h2>
          </div>

          <div className="space-y-4">
            {/* Correo Corporativo */}
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-text-soft">Correo Corporativo</p>
                <p className="text-sm font-medium">{usuario.correo}</p>
              </div>
            </div>

            {/* Teléfono Corporativo */}
            {usuario.telefonoCorporativo && (
              <div className="flex items-start gap-3">
                <Phone className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Teléfono Corporativo</p>
                  <p className="text-sm font-medium">{usuario.telefonoCorporativo}</p>
                </div>
              </div>
            )}

            {/* Área / Departamento */}
            {usuario.area && (
              <div className="flex items-start gap-3">
                <Building className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Área / Departamento</p>
                  <p className="text-sm font-medium">{usuario.area}</p>
                </div>
              </div>
            )}

            {/* Cargo */}
            {usuario.cargo && (
              <div className="flex items-start gap-3">
                <Briefcase className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Cargo</p>
                  <p className="text-sm font-medium">{usuario.cargo}</p>
                </div>
              </div>
            )}

            {/* Perfil / Rol */}
            <div className="flex items-start gap-3">
              <Shield className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-text-soft">Perfil / Rol</p>
                <p className="text-sm font-medium text-brand-green">{usuario.perfil.nombre}</p>
              </div>
            </div>

            {/* Centro de Costo */}
            {usuario.centrodeCosto && (
              <div className="flex items-start gap-3">
                <Building className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-wider text-text-soft">Centro de Costo</p>
                  <p className="text-sm font-medium">{usuario.centrodeCosto}</p>
                </div>
              </div>
            )}

            {/* Disponibilidad */}
            <div className="flex items-start gap-3">
              <div className={`mt-1 h-3 w-3 rounded-full flex-shrink-0 ${
                usuario.disponibilidad === "activo" ? "bg-brand-green" :
                usuario.disponibilidad === "baja" ? "bg-yellow-500" :
                "bg-gray-500"
              }`} />
              <div>
                <p className="text-xs uppercase tracking-wider text-text-soft">Disponibilidad</p>
                <p className="text-sm font-medium capitalize">{usuario.disponibilidad}</p>
              </div>
            </div>

            {/* Fecha Ingreso */}
            <div className="flex items-start gap-3">
              <Calendar className="mt-1 h-4 w-4 text-brand-blue flex-shrink-0" />
              <div>
                <p className="text-xs uppercase tracking-wider text-text-soft">Fecha Ingreso</p>
                <p className="text-sm font-medium">{new Date(usuario.fechaIngreso).toLocaleDateString("es-CL")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal editar datos personales */}
      <Modal title="Editar datos personales" open={modal} onClose={() => setModal(false)}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><label className="text-xs uppercase tracking-wider text-text-soft font-medium">Teléfono personal</label><Inp value={form.telefonoPersonal} onChange={e => setForm(p => ({ ...p, telefonoPersonal: e.target.value }))} placeholder="+56 9 XXXX XXXX" /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wider text-text-soft font-medium">Contacto emergencia</label><Inp value={form.numeroEmergencia} onChange={e => setForm(p => ({ ...p, numeroEmergencia: e.target.value }))} placeholder="+56 9 XXXX XXXX" /></div>
            <div className="space-y-1 col-span-2"><label className="text-xs uppercase tracking-wider text-text-soft font-medium">Dirección</label><Inp value={form.direccion} onChange={e => setForm(p => ({ ...p, direccion: e.target.value }))} placeholder="Calle, número, depto" /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wider text-text-soft font-medium">Ciudad</label><Inp value={form.ciudad} onChange={e => setForm(p => ({ ...p, ciudad: e.target.value }))} placeholder="Santiago" /></div>
            <div className="space-y-1"><label className="text-xs uppercase tracking-wider text-text-soft font-medium">Región</label><Inp value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} placeholder="Metropolitana" /></div>
            <div className="space-y-1 col-span-2"><label className="text-xs uppercase tracking-wider text-text-soft font-medium">Fecha de nacimiento</label><Inp type="date" value={form.fechaNacimiento} onChange={e => setForm(p => ({ ...p, fechaNacimiento: e.target.value }))} /></div>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModal(false)} className="flex-1 rounded-lg border border-white/20 py-2 text-sm hover:bg-white/10 transition-colors">Cancelar</button>
            <button onClick={handleGuardar} disabled={loading} className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50">{loading ? "Guardando..." : "Guardar cambios"}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

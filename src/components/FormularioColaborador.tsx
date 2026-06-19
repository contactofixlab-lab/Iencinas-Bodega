"use client";

import { useState } from "react";
import { User, Mail, Lock, Phone, FileText, MapPin, Briefcase, Building, Calendar, AlertCircle, FolderOpen, Check } from "@/components/icons";
import type { Colaborador, Perfil, Proyecto } from "@prisma/client";
import AppSelect from "@/components/AppSelect";

interface FormularioColaboradorProps {
  colaborador?: Colaborador | null;
  perfiles: Perfil[];
  proyectos?: Proyecto[];
  proyectosAsignados?: string[];
  onSubmit: (data: any) => Promise<void>;
  loading?: boolean;
}

const InputField = ({ icon: Icon, label, placeholder, type = "text", value, onChange, required = false, disabled = false, name }: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-soft font-medium">
      <Icon className="h-4 w-4 text-brand-green" />
      {label}
    </label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-text-soft/50 focus:border-brand-green focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all duration-300 disabled:opacity-50"
    />
  </div>
);

const SelectField = ({ icon: Icon, label, name, value, onChange, options, required = false }: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-soft font-medium">
      <Icon className="h-4 w-4 text-brand-green" />
      {label}
    </label>
    <AppSelect
      value={value}
      onChange={(val) => onChange({ target: { name, value: val } } as any)}
      options={options}
    />
  </div>
);

const TextAreaField = ({ icon: Icon, label, name, value, onChange, required = false }: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-soft font-medium">
      <Icon className="h-4 w-4 text-brand-green" />
      {label}
    </label>
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      rows={3}
      className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-3 text-sm placeholder:text-text-soft/50 focus:border-brand-green focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all duration-300 resize-none"
    />
  </div>
);

const SectionCard = ({ title, icon: Icon, children }: any) => (
  <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 p-8 hover:border-brand-green/50 hover:shadow-[0_0_20px_rgba(132,206,37,0.1)] transition-all duration-500">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-green/0 to-brand-green/0 group-hover:from-brand-green/5 group-hover:to-brand-green/0 transition-all duration-500" />
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-brand-green/20">
          <Icon className="h-5 w-5 text-brand-green" />
        </div>
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
          {title}
        </h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  </div>
);

export default function FormularioColaborador({
  colaborador,
  perfiles,
  proyectos = [],
  proyectosAsignados = [],
  onSubmit,
  loading = false,
}: FormularioColaboradorProps) {
  const [form, setForm] = useState({
    nombre: colaborador?.nombre ?? "",
    apellidoPaterno: colaborador?.apellidoPaterno ?? "",
    apellidoMaterno: colaborador?.apellidoMaterno ?? "",
    correo: colaborador?.correo ?? "",
    password: "",
    telefonoPersonal: colaborador?.telefonoPersonal ?? "",
    rutPersonal: colaborador?.rutPersonal ?? "",
    direccion: colaborador?.direccion ?? "",
    ciudad: colaborador?.ciudad ?? "",
    region: colaborador?.region ?? "",
    fechaNacimiento: colaborador?.fechaNacimiento ? new Date(colaborador.fechaNacimiento).toISOString().split("T")[0] : "",
    numeroEmergencia: colaborador?.numeroEmergencia ?? "",
    area: colaborador?.area ?? "",
    cargo: colaborador?.cargo ?? "",
    telefonoCorporativo: colaborador?.telefonoCorporativo ?? "",
    centrodeCosto: colaborador?.centrodeCosto ?? "",
    disponibilidad: colaborador?.disponibilidad ?? "activo",
    fechaEgresoEsperado: colaborador?.fechaEgresoEsperado ? new Date(colaborador.fechaEgresoEsperado).toISOString().split("T")[0] : "",
    perfilId: colaborador?.perfilId ?? "",
  });

  const [proyectosIds, setProyectosIds] = useState<string[]>(proyectosAsignados);

  function toggleProyecto(id: string) {
    setProyectosIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({ ...form, proyectosIds });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-8">
      {/* IDENTIDAD */}
      <SectionCard title="Identidad" icon={User}>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField icon={User} label="Nombre" placeholder="Juan" name="nombre" value={form.nombre} onChange={handleChange} required />
          <InputField icon={User} label="Apellido Paterno" placeholder="García" name="apellidoPaterno" value={form.apellidoPaterno} onChange={handleChange} required />
          <InputField icon={User} label="Apellido Materno" placeholder="López" name="apellidoMaterno" value={form.apellidoMaterno} onChange={handleChange} />
          <InputField icon={Mail} label="Correo Corporativo" type="email" placeholder="juan.garcia@iencinas.cl" name="correo" value={form.correo} onChange={handleChange} required disabled={!!colaborador} />
        </div>
        {!colaborador && (
          <InputField icon={Lock} label="Contraseña Inicial" type="password" placeholder="••••••••" name="password" value={form.password} onChange={handleChange} required />
        )}
      </SectionCard>

      {/* DATOS PERSONALES */}
      <SectionCard title="Datos Personales" icon={FileText}>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField icon={Phone} label="Teléfono Personal" placeholder="+56 9 1234 5678" name="telefonoPersonal" value={form.telefonoPersonal} onChange={handleChange} />
          <InputField icon={FileText} label="RUT" placeholder="18.765.432-5" name="rutPersonal" value={form.rutPersonal} onChange={handleChange} />
          <div className="md:col-span-2">
            <TextAreaField icon={MapPin} label="Dirección" name="direccion" value={form.direccion} onChange={handleChange} />
          </div>
          <InputField icon={MapPin} label="Ciudad" placeholder="Santiago" name="ciudad" value={form.ciudad} onChange={handleChange} />
          <InputField icon={MapPin} label="Región" placeholder="Región Metropolitana" name="region" value={form.region} onChange={handleChange} />
          <InputField icon={Calendar} label="Fecha de Nacimiento" type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
          <InputField icon={AlertCircle} label="Contacto Emergencia" placeholder="+56 9 9876 5432" name="numeroEmergencia" value={form.numeroEmergencia} onChange={handleChange} />
        </div>
      </SectionCard>

      {/* DATOS EMPRESA */}
      <SectionCard title="Datos Empresa" icon={Building}>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField icon={Building} label="Área / Departamento" placeholder="Recursos Humanos" name="area" value={form.area} onChange={handleChange} />
          <InputField icon={Briefcase} label="Cargo" placeholder="Especialista RH" name="cargo" value={form.cargo} onChange={handleChange} />
          <InputField icon={Phone} label="Teléfono Corporativo" placeholder="+56 2 2345 6789" name="telefonoCorporativo" value={form.telefonoCorporativo} onChange={handleChange} />
          <InputField icon={FileText} label="Centro de Costo" placeholder="CC-RH-001" name="centrodeCosto" value={form.centrodeCosto} onChange={handleChange} />
          <SelectField
            icon={Briefcase}
            label="Perfil / Rol"
            name="perfilId"
            value={form.perfilId}
            onChange={handleChange}
            required
            options={[
              { value: "", label: "Selecciona un perfil" },
              ...perfiles.map((p) => ({ value: p.id, label: p.nombre }))
            ]}
          />
          <SelectField
            icon={AlertCircle}
            label="Disponibilidad"
            name="disponibilidad"
            value={form.disponibilidad}
            onChange={handleChange}
            options={[
              { value: "activo", label: "Activo" },
              { value: "baja", label: "Baja" },
              { value: "excedencia", label: "Excedencia" },
            ]}
          />
          <InputField icon={Calendar} label="Fecha Egreso Esperado" type="date" name="fechaEgresoEsperado" value={form.fechaEgresoEsperado} onChange={handleChange} />
        </div>
      </SectionCard>

      {/* PROYECTOS ASIGNADOS */}
      {proyectos.length > 0 && (
        <SectionCard title="Proyectos Asignados" icon={FolderOpen}>
          <p className="text-xs text-text-soft/60 -mt-2 mb-3">
            Seleccioná los proyectos a los que este colaborador tendrá acceso.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {proyectos.map((p) => {
              const seleccionado = proyectosIds.includes(p.id);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleProyecto(p.id)}
                  className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
                    seleccionado
                      ? "border-brand-green/40 bg-brand-green/10 text-foreground"
                      : "border-white/10 bg-white/[0.03] text-text-soft hover:border-white/20 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all ${
                    seleccionado
                      ? "border-brand-green bg-brand-green text-[#06210a]"
                      : "border-white/20 bg-white/5"
                  }`}>
                    {seleccionado && <Check className="h-3 w-3" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate font-medium ${seleccionado ? "text-foreground" : ""}`}>{p.nombre}</p>
                    {p.codigoExterno && (
                      <p className="text-[10px] font-mono text-brand-blue-bright/70">{p.codigoExterno}</p>
                    )}
                  </div>
                  {seleccionado && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-green shadow-[0_0_8px_rgba(132,206,37,0.9)]" />
                  )}
                </button>
              );
            })}
          </div>
          {proyectosIds.length > 0 && (
            <p className="mt-3 text-xs text-brand-green/70">
              {proyectosIds.length} proyecto{proyectosIds.length !== 1 ? "s" : ""} seleccionado{proyectosIds.length !== 1 ? "s" : ""}
            </p>
          )}
        </SectionCard>
      )}

      {/* BOTONES */}
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 relative overflow-hidden rounded-lg bg-gradient-to-r from-brand-green to-brand-green/80 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-brand-green/30 disabled:opacity-50 transition-all duration-300 group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative">{loading ? "Guardando..." : colaborador ? "Guardar Cambios" : "Crear Colaborador"}</span>
        </button>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="btn-ghost flex-1 rounded-lg px-6 py-3 font-semibold"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

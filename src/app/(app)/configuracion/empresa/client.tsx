"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2, Globe, Phone, Mail, MapPin, DollarSign } from "lucide-react";
import AppSelect from "@/components/AppSelect";
import { guardarEmpresa } from "./actions";

type Empresa = {
  id: string; nombre: string; razonSocial: string | null; rut: string | null;
  giro: string | null; email: string | null; telefono: string | null;
  sitioWeb: string | null; pais: string; region: string | null; ciudad: string | null;
  direccion: string | null; moneda: string; zonaHoraria: string; logo: string | null;
};

const MONEDAS = ["CLP", "USD", "EUR", "UF"];
const ZONAS = ["America/Santiago", "America/Buenos_Aires", "America/Lima", "America/Bogota", "UTC"];

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold uppercase tracking-wider text-text-soft">{label}</label>
    {children}
  </div>
);
const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...p} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

export default function EmpresaClient({ empresa }: { empresa: Empresa | null }) {
  const router = useRouter();
  const [form, setForm] = useState({
    nombre:      empresa?.nombre      ?? "",
    razonSocial: empresa?.razonSocial ?? "",
    rut:         empresa?.rut         ?? "",
    giro:        empresa?.giro        ?? "",
    email:       empresa?.email       ?? "",
    telefono:    empresa?.telefono    ?? "",
    sitioWeb:    empresa?.sitioWeb    ?? "",
    pais:        empresa?.pais        ?? "Chile",
    region:      empresa?.region      ?? "",
    ciudad:      empresa?.ciudad      ?? "",
    direccion:   empresa?.direccion   ?? "",
    moneda:      empresa?.moneda      ?? "CLP",
    zonaHoraria: empresa?.zonaHoraria ?? "America/Santiago",
    logo:        empresa?.logo        ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const [error, setError]   = useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.nombre) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError("");
    const r = await guardarEmpresa({
      ...form,
      razonSocial: form.razonSocial || undefined,
      rut:         form.rut         || undefined,
      giro:        form.giro        || undefined,
      email:       form.email       || undefined,
      telefono:    form.telefono    || undefined,
      sitioWeb:    form.sitioWeb    || undefined,
      region:      form.region      || undefined,
      ciudad:      form.ciudad      || undefined,
      direccion:   form.direccion   || undefined,
      logo:        form.logo        || undefined,
    });
    setSaving(false);
    if (!r.success) { setError(r.error ?? "Error"); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* Identidad */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-brand-green" />
          <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            Identidad legal
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre comercial *">
            <Input value={form.nombre} onChange={set("nombre")} placeholder="Ej: Iencinas" />
          </Field>
          <Field label="Razón social">
            <Input value={form.razonSocial} onChange={set("razonSocial")} placeholder="Nombre legal completo" />
          </Field>
          <Field label="RUT">
            <Input value={form.rut} onChange={set("rut")} placeholder="76.XXX.XXX-X" />
          </Field>
          <Field label="Giro / Actividad económica">
            <Input value={form.giro} onChange={set("giro")} placeholder="Ej: Comercio al por mayor" />
          </Field>
        </div>
      </div>

      {/* Contacto */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4 text-brand-green" />
          <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            Contacto
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Email corporativo">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-soft/50" />
              <input value={form.email} onChange={set("email")} type="email" placeholder="contacto@empresa.cl"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
            </div>
          </Field>
          <Field label="Teléfono">
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-soft/50" />
              <input value={form.telefono} onChange={set("telefono")} placeholder="+56 2 XXXX XXXX"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
            </div>
          </Field>
          <Field label="Sitio web (opcional)">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-soft/50" />
              <input value={form.sitioWeb} onChange={set("sitioWeb")} placeholder="https://www.empresa.cl"
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-9 pr-3 py-2 text-sm focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
            </div>
          </Field>
        </div>
      </div>

      {/* Ubicación */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-brand-green" />
          <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            Ubicación
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="País">
            <Input value={form.pais} onChange={set("pais")} placeholder="Chile" />
          </Field>
          <Field label="Región">
            <Input value={form.region} onChange={set("region")} placeholder="Ej: Metropolitana" />
          </Field>
          <Field label="Ciudad">
            <Input value={form.ciudad} onChange={set("ciudad")} placeholder="Ej: Santiago" />
          </Field>
          <Field label="Dirección">
            <Input value={form.direccion} onChange={set("direccion")} placeholder="Calle, número" />
          </Field>
        </div>
      </div>

      {/* Región / Moneda */}
      <div className="glass-strong rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-brand-green" />
          <h3 className="text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-brand-green to-brand-blue bg-clip-text text-transparent">
            Región y moneda
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Moneda de trabajo">
            <AppSelect
              value={form.moneda}
              onChange={(v) => setForm(p => ({ ...p, moneda: v }))}
              options={MONEDAS.map(m => ({ value: m, label: m }))}
            />
          </Field>
          <Field label="Zona horaria">
            <AppSelect
              value={form.zonaHoraria}
              onChange={(v) => setForm(p => ({ ...p, zonaHoraria: v }))}
              options={ZONAS.map(z => ({ value: z, label: z }))}
            />
          </Field>
        </div>
      </div>

      {/* Guardar */}
      {error && <p className="text-sm text-red-400 px-1">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving || !form.nombre}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-green to-brand-green/80 px-6 py-2.5 text-sm font-semibold text-white hover:shadow-lg hover:shadow-brand-green/30 disabled:opacity-50 transition-all"
        >
          <Save className="h-4 w-4" />
          {saving ? "Guardando…" : "Guardar configuración"}
        </button>
        {saved && (
          <span className="text-sm text-brand-green">
            ✓ Guardado correctamente
          </span>
        )}
      </div>
    </div>
  );
}

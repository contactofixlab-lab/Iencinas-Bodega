"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Check } from "@/components/icons";
import AppSelect from "@/components/AppSelect";
import { crearInsumo } from "@/app/api/inventario/actions";
import { TIPO_CONFIG, DEFAULT_TIPO_CONFIG as DEFAULT_CONFIG } from "@/lib/categoriaTipos";

type Categoria = { id: string; nombre: string; tipo: string; icono: string | null; _count: { insumos: number } };
type Proveedor = { id: string; nombre: string };

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-1">
    <label className="text-xs uppercase tracking-wider text-text-soft font-medium">{label}</label>
    {children}
  </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm placeholder:text-text-soft/50 focus:border-brand-green focus:outline-none focus:ring-2 focus:ring-brand-green/20 transition-all" />
);

export default function NuevoInsumoClient({
  categorias, proveedores,
}: {
  categorias: Categoria[]; proveedores: Proveedor[];
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [categoria, setCategoria] = useState<Categoria | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const config = categoria ? (TIPO_CONFIG[categoria.tipo] ?? DEFAULT_CONFIG) : DEFAULT_CONFIG;

  const [form, setForm] = useState({
    nombre: "", descripcion: "", sku: "", marca: "", modelo: "",
    unidad: "unidad", stockActual: 0, stockMinimo: 0, ubicacion: "",
    proveedorId: "", esSerializable: false,
  });

  const elegirCategoria = (c: Categoria) => {
    const cfg = TIPO_CONFIG[c.tipo] ?? DEFAULT_CONFIG;
    setCategoria(c);
    setForm((p) => ({ ...p, unidad: cfg.unidadDefault, esSerializable: cfg.esSerializableDefault }));
    setStep(2);
    setError("");
  };

  const volver = () => { setStep(1); setError(""); };

  const handleSubmit = async () => {
    if (!categoria) return;
    setSubmitting(true);
    setError("");
    const r = await crearInsumo({
      ...form,
      categoriaId: categoria.id,
      proveedorId: form.proveedorId || undefined,
    });
    setSubmitting(false);
    if (!r.success) { setError(r.error ?? "Error al crear el insumo"); return; }
    router.push("/inventario");
    router.refresh();
  };

  return (
    <div>
      {/* Indicador de pasos */}
      <div className="mb-6 flex items-center gap-2 text-sm">
        <span className={`flex items-center gap-2 ${step === 1 ? "text-brand-green font-medium" : "text-text-soft"}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${step === 1 ? "bg-brand-green/20 border border-brand-green/40" : "bg-white/5 border border-white/10"}`}>
            {step > 1 ? <Check className="h-3 w-3" /> : "1"}
          </span>
          Catálogo
        </span>
        <span className="h-px w-8 bg-white/10" />
        <span className={`flex items-center gap-2 ${step === 2 ? "text-brand-green font-medium" : "text-text-soft"}`}>
          <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] ${step === 2 ? "bg-brand-green/20 border border-brand-green/40" : "bg-white/5 border border-white/10"}`}>
            2
          </span>
          Formulario
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {categorias.length === 0 ? (
              <div className="glass rounded-2xl p-8 text-center text-sm text-text-soft">
                Aún no hay catálogos creados. Crea uno primero desde la pestaña Catálogo.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {categorias.map((c) => {
                  const cfg = TIPO_CONFIG[c.tipo] ?? DEFAULT_CONFIG;
                  const Icon = cfg.icon;
                  return (
                    <button
                      key={c.id}
                      onClick={() => elegirCategoria(c)}
                      className="glass card-3d group flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all hover:border-brand-green/40 hover:bg-white/8"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-green/30 bg-gradient-to-br from-brand-green/20 to-brand-blue/10 text-brand-green transition-transform group-hover:scale-105">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="font-medium">{c.nombre}</div>
                        <div className="mt-0.5 text-xs text-text-soft capitalize">{c.tipo} · {c._count.insumos} insumos</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {step === 2 && categoria && (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="glass rounded-2xl p-6">
              <div className="mb-5 flex items-center justify-between">
                <button onClick={volver} className="flex items-center gap-1.5 text-sm text-text-soft hover:text-foreground transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Cambiar catálogo
                </button>
                <div className="flex items-center gap-2 rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1 text-xs font-medium text-brand-green">
                  <config.icon className="h-3.5 w-3.5" /> {categoria.nombre}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Nombre *">
                    <Input value={form.nombre} onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))} placeholder={config.placeholderNombre} />
                  </Field>
                  {config.showSku && (
                    <Field label="SKU / Código">
                      <Input value={form.sku} onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))} placeholder="SKU-001" />
                    </Field>
                  )}
                  <Field label={config.marcaLabel}>
                    <Input value={form.marca} onChange={(e) => setForm((p) => ({ ...p, marca: e.target.value }))} />
                  </Field>
                  {config.showModelo && (
                    <Field label="Modelo">
                      <Input value={form.modelo} onChange={(e) => setForm((p) => ({ ...p, modelo: e.target.value }))} />
                    </Field>
                  )}
                  <Field label="Unidad">
                    <AppSelect
                      value={form.unidad}
                      onChange={(v) => setForm((p) => ({ ...p, unidad: v }))}
                      options={config.unidadOptions.map((u) => ({ value: u, label: u }))}
                    />
                  </Field>
                  <Field label="Stock inicial">
                    <Input type="number" min={0} value={form.stockActual} onChange={(e) => setForm((p) => ({ ...p, stockActual: +e.target.value }))} />
                  </Field>
                  <Field label="Stock mínimo">
                    <Input type="number" min={0} value={form.stockMinimo} onChange={(e) => setForm((p) => ({ ...p, stockMinimo: +e.target.value }))} />
                  </Field>
                  <Field label="Ubicación en bodega">
                    <Input value={form.ubicacion} onChange={(e) => setForm((p) => ({ ...p, ubicacion: e.target.value }))} placeholder="Ej: Estante A-3" />
                  </Field>
                  <Field label="Proveedor">
                    <AppSelect
                      value={form.proveedorId}
                      onChange={(v) => setForm((p) => ({ ...p, proveedorId: v }))}
                      options={[{ value: "", label: "Sin proveedor" }, ...proveedores.map((p) => ({ value: p.id, label: p.nombre }))]}
                    />
                  </Field>
                </div>

                <Field label="Descripción">
                  <Input value={form.descripcion} onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))} placeholder="Descripción opcional" />
                </Field>

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={form.esSerializable} onChange={(e) => setForm((p) => ({ ...p, esSerializable: e.target.checked }))} className="rounded" />
                  Ítem serializable (tiene número de serie)
                </label>
                <p className="text-xs text-text-soft/70">{config.esSerializableHint}</p>

                {error && <p className="text-sm text-red-400">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button onClick={() => router.push("/inventario")} className="btn-ghost flex-1 rounded-lg py-2 text-sm">Cancelar</button>
                  <button
                    onClick={handleSubmit}
                    disabled={!form.nombre || submitting}
                    className="flex-1 btn-green rounded-lg py-2 text-sm disabled:opacity-50"
                  >
                    {submitting ? "Guardando…" : "Agregar insumo"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

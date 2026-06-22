"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { LogIn, Loader2 } from "@/components/icons";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      router.replace(next);
      router.refresh();
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="glass-strong card-3d relative w-full max-w-md rounded-2xl p-8 opacity-100 visible" style={{ zIndex: 1 }}>

      <div className="mb-8 flex flex-col items-center text-center">
        <Image src="/logo-iencinas.svg" alt="iencinas" width={180} height={56} priority />
        <h1 className="mt-5 text-3xl font-semibold tracking-tight">Iencinas</h1>
        <p className="mt-1 text-sm font-medium uppercase tracking-[0.25em] text-brand-green text-glow-green">
          Office Manager
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm text-text-soft">Correo</label>
          <input
            type="email"
            required
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="tu.correo@iencinas.cl"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-text-soft/60 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm text-text-soft">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-foreground placeholder:text-text-soft/60 outline-none transition focus:border-brand-green focus:ring-2 focus:ring-brand-green/30"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-green flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />}
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </div>
  );
}

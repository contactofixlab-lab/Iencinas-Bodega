"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormularioColaborador from "@/components/FormularioColaborador";
import { crearColaborador } from "@/app/api/colaboradores/actions";
import type { Perfil, Proyecto } from "@prisma/client";

export default function ClientCrearColaborador({ perfiles, proyectos }: { perfiles: Perfil[]; proyectos: Proyecto[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await crearColaborador(data);
      if (result.success) {
        router.push("/colaboradores?success=creado");
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}
      <FormularioColaborador colaborador={null} perfiles={perfiles} proyectos={proyectos} onSubmit={handleSubmit} loading={loading} />
    </>
  );
}

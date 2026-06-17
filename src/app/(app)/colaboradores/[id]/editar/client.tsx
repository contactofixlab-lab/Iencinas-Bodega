"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormularioColaborador from "@/components/FormularioColaborador";
import { actualizarColaborador } from "@/app/api/colaboradores/actions";
import type { Perfil, Colaborador, Proyecto } from "@prisma/client";

type ColaboradorConPerfil = Colaborador & { perfil: Perfil };

export default function ClientEditarColaborador({
  colaborador,
  perfiles,
  proyectos,
  proyectosAsignados,
}: {
  colaborador: ColaboradorConPerfil;
  perfiles: Perfil[];
  proyectos: Proyecto[];
  proyectosAsignados: string[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const result = await actualizarColaborador(colaborador.id, data);
      if (result.success) {
        router.push(`/colaboradores/${colaborador.id}?success=actualizado`);
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
      <FormularioColaborador
        colaborador={colaborador}
        perfiles={perfiles}
        proyectos={proyectos}
        proyectosAsignados={proyectosAsignados}
        onSubmit={handleSubmit}
        loading={loading}
      />
    </>
  );
}

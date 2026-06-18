import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { BarChart3 } from "@/components/icons";
import GestorReportes from "@/components/GestorReportes";

export const metadata = {
  title: "Reportes - Yencinas Bodega",
};

export default async function ReportesPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-lg bg-brand-green/20">
          <BarChart3 className="h-6 w-6 text-brand-green" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-text-soft">Crea y descarga reportes personalizados o predefinidos</p>
        </div>
      </div>

      <GestorReportes />

      {/* Footer Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2 text-brand-green">5</h4>
          <p className="text-xs text-text-soft">Reportes Predefinidos</p>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2 text-brand-blue">3</h4>
          <p className="text-xs text-text-soft">Formatos de Exportación</p>
        </div>
        <div className="glass rounded-xl p-4">
          <h4 className="font-semibold text-sm mb-2 text-brand-green">∞</h4>
          <p className="text-xs text-text-soft">Reportes Personalizados</p>
        </div>
      </div>
    </div>
  );
}

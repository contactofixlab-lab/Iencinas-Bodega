"use client";

import { useEffect, useState } from "react";
import { PageHeader, StatCard } from "@/components/ui";
import Tabs from "@/components/Tabs";
import GraficosResumen from "@/components/GraficosResumen";
import GestorReportes from "@/components/GestorReportes";
import AlertaStockBajo from "@/components/AlertaStockBajo";
import ActividadLogs from "@/components/ActividadLogs";
import { getDashboardData } from "./actions";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dashData = await getDashboardData();
        setData(dashData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-text-soft">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400">Error al cargar los datos</p>
        </div>
      </div>
    );
  }

  const { insumos, bajoCount, totalItems, insumosAlerta, tasaUtilizacion, inventarioPorCategoria, distribucionEstado, movimientosUltimos30, asignacionesPorArea, logsSer } = data;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Panel de control integral de la bodega"
      />

      <Tabs
        tabs={[
          {
            id: "resumen",
            label: "Resumen",
            content: (
              <div className="space-y-6">
                <AlertaStockBajo insumos={insumosAlerta} />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard label="Inventario Total" value={totalItems._sum.stockActual ?? 0} accent="green" hint="unidades en stock" />
                  <StatCard label="Tipos de Insumo" value={insumos} accent="blue" hint="en catálogo" />
                  <StatCard label="Stock Bajo" value={bajoCount} accent="warning" hint="bajo el mínimo" />
                  <StatCard label="Tasa Utilización" value={`${tasaUtilizacion}%`} accent="green" />
                </div>
                <GraficosResumen datos={{ inventarioPorCategoria, distribucionEstado, movimientosUltimos30, asignacionesPorArea }} />
              </div>
            ),
          },
          {
            id: "actividad",
            label: "Actividad",
            content: (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
                    Registro de Auditoría
                  </h3>
                  <span className="ml-auto text-xs text-text-soft bg-white/5 px-2 py-1 rounded-full">Todas las actividades</span>
                </div>
                <ActividadLogs logs={logsSer as any} />
              </div>
            ),
          },
          {
            id: "reportes",
            label: "Reportes",
            content: <GestorReportes />,
          },
        ]}
      />
    </div>
  );
}

"use client";

import { PageHeader, StatCard } from "@/components/ui";
import Tabs from "@/components/Tabs";
import GraficosResumen from "@/components/GraficosResumen";
import GestorReportes from "@/components/GestorReportes";
import AlertaStockBajo from "@/components/AlertaStockBajo";
import ActividadLogs from "@/components/ActividadLogs";

export default function DashboardPage() {
  // Client-side data placeholder for now
  const insumos = 0;
  const bajoCount = 0;
  const totalItems = { _sum: { stockActual: 0 } };
  const insumosData: any[] = [];
  const asignacionesData: any[] = [];
  const movimientosData: any[] = [];
  const logsActividad: any[] = [];
  const insumosAlerta: any[] = [];

  const tasaUtilizacion = 0;

  // Procesar datos para gráficos
  const inventarioPorCategoria: any[] = [];
  const distribucionEstado: any[] = [];
  const movimientosUltimos30: any[] = [];
  const asignacionesPorArea: any[] = [];
  const logsSer: any[] = [];

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

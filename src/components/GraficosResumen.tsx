"use client";

import { BarChart, Bar, PieChart, Pie, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ScatterChart, Scatter } from "recharts";

interface DatosGraficos {
  inventarioPorCategoria: Array<{ nombre: string; cantidad: number }>;
  distribucionEstado: Array<{ name: string; value: number }>;
  movimientosUltimos30: Array<{ fecha: string; entradas: number; salidas: number }>;
  asignacionesPorArea: Array<{ area: string; cantidad: number }>;
}

const COLORES_CATEGORIA = ["#84CE25", "#0671ae", "#45B7D1", "#FF6B6B", "#4ECDC4"];
const COLORES_DONA = ["#84CE25", "#FF6B6B"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-brand-green/50 bg-bg-base/95 px-3 py-2 shadow-lg backdrop-blur">
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Deshabilitar activeBar para evitar fondo blanco en hover
const inactiveBar = () => null;

export default function GraficosResumen({ datos }: { datos: DatosGraficos }) {
  return (
    <div className="space-y-6">
      {/* Fila 1: Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras Animado: Inventario por Categoría */}
        <div className="group glass-strong rounded-2xl p-6 hover:border-brand-green/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
              Stock por Categoría
            </h3>
            <div className="text-xs text-text-soft bg-brand-green/20 px-2 py-1 rounded">
              {datos.inventarioPorCategoria.reduce((sum, cat) => sum + cat.cantidad, 0)} unidades
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datos.inventarioPorCategoria}>
              <defs>
                <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84CE25" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#84CE25" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="nombre" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "11px" }} />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="cantidad"
                fill="url(#colorGreen)"
                radius={[8, 8, 0, 0]}
                animationDuration={800}
                isAnimationActive={true}
                activeBar={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Dona: Disponibilidad */}
        <div className="group glass-strong rounded-2xl p-6 hover:border-brand-blue/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
              Disponibilidad
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={datos.distribucionEstado}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={2}
                dataKey="value"
                animationDuration={800}
              >
                {datos.distribucionEstado.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES_DONA[index % COLORES_DONA.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila 2: Gráficos especializados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Área: Movimientos */}
        <div className="group glass-strong rounded-2xl p-6 hover:border-brand-green/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
              Flujo de Movimientos (30 días)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={datos.movimientosUltimos30}>
              <defs>
                <linearGradient id="colorEntradas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#84CE25" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#84CE25" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSalidas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="fecha" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "11px" }} />
              <YAxis stroke="rgba(255,255,255,0.5)" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="entradas" stroke="#84CE25" strokeWidth={2} fill="url(#colorEntradas)" animationDuration={800} />
              <Area type="monotone" dataKey="salidas" stroke="#FF6B6B" strokeWidth={2} fill="url(#colorSalidas)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras: Distribución de Asignaciones */}
        <div className="group glass-strong rounded-2xl p-6 hover:border-brand-blue/50 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
              Distribución de Asignaciones
            </h3>
            <div className="text-xs text-text-soft bg-brand-blue/20 px-2 py-1 rounded">
              {datos.asignacionesPorArea.reduce((sum, area) => sum + area.cantidad, 0)} items
            </div>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datos.asignacionesPorArea} layout="vertical">
              <defs>
                <linearGradient id="colorBlue" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#0671ae" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0671ae" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
              <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
              <YAxis dataKey="area" type="category" stroke="rgba(255,255,255,0.5)" style={{ fontSize: "11px" }} width={90} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="cantidad"
                fill="url(#colorBlue)"
                radius={[0, 8, 8, 0]}
                animationDuration={800}
                isAnimationActive={true}
                activeBar={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Fila 3: Gráfico de tendencia */}
      <div className="group glass-strong rounded-2xl p-6 hover:border-brand-green/50 transition-all duration-300">
        <h3 className="text-lg font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
          Resumen de Operaciones
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center hover:border-brand-green/50 hover:bg-brand-green/10 transition-all duration-300">
            <p className="text-2xl font-bold text-brand-green">
              {datos.asignacionesPorArea.reduce((sum, area) => sum + area.cantidad, 0)}
            </p>
            <p className="text-xs text-text-soft mt-1">Asignaciones Activas</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center hover:border-blue-400/50 hover:bg-blue-400/10 transition-all duration-300">
            <p className="text-2xl font-bold text-blue-400">
              {datos.inventarioPorCategoria.length}
            </p>
            <p className="text-xs text-text-soft mt-1">Categorías</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center hover:border-purple-400/50 hover:bg-purple-400/10 transition-all duration-300">
            <p className="text-2xl font-bold text-purple-400">
              {datos.movimientosUltimos30.length}
            </p>
            <p className="text-xs text-text-soft mt-1">Movimientos (30d)</p>
          </div>
          <div className="rounded-lg bg-white/5 border border-white/10 p-4 text-center hover:border-orange-400/50 hover:bg-orange-400/10 transition-all duration-300">
            <p className="text-2xl font-bold text-orange-400">
              {datos.distribucionEstado[1]?.value || 0}
            </p>
            <p className="text-xs text-text-soft mt-1">Stock Bajo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

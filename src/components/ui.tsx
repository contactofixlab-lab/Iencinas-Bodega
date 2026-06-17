import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="mb-7 flex items-center gap-4">
      {icon && (
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-brand-green/30 bg-gradient-to-br from-brand-green/20 to-brand-blue/10 text-brand-green shadow-[0_0_24px_rgba(132,206,37,0.12)]">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-text-soft">{subtitle}</p>}
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass card-3d rounded-2xl p-5 ${className}`}>{children}</div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = "blue",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  accent?: "blue" | "green" | "danger" | "warning";
}) {
  const colors: Record<string, string> = {
    blue:    "text-brand-blue-bright",
    green:   "text-brand-green",
    danger:  "text-red-400",
    warning: "text-amber-400",
  };
  const bars: Record<string, string> = {
    blue:    "from-brand-blue via-brand-blue/50 to-transparent",
    green:   "from-brand-green via-brand-green/50 to-transparent",
    danger:  "from-red-400 via-red-400/50 to-transparent",
    warning: "from-amber-400 via-amber-400/50 to-transparent",
  };

  return (
    <div className="glass card-3d relative overflow-hidden rounded-2xl p-5">
      {/* Barra superior de acento */}
      <div className={`absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r ${bars[accent]}`} />
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-soft/70">
          {label}
        </p>
        {icon && (
          <span className={`opacity-60 ${colors[accent]}`}>{icon}</span>
        )}
      </div>
      <p className={`mt-3 text-3xl font-bold tracking-tight ${colors[accent]}`}>{value}</p>
      {hint && <p className="mt-1.5 text-xs text-text-soft/60">{hint}</p>}
    </div>
  );
}

const tones: Record<string, string> = {
  green: "border-brand-green/40 bg-brand-green/10 text-brand-green",
  blue:  "border-brand-blue/40  bg-brand-blue/15  text-brand-blue-bright",
  amber: "border-amber-400/40   bg-amber-400/10   text-amber-300",
  red:   "border-red-400/40     bg-red-400/10     text-red-300",
  gray:  "border-white/12       bg-white/5        text-text-soft",
};

export function Badge({
  children,
  tone = "gray",
}: {
  children: ReactNode;
  tone?: keyof typeof tones;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Table({
  head,
  children,
}: {
  head: string[];
  children: ReactNode;
}) {
  return (
    <div className="glass overflow-hidden rounded-2xl">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.03]">
              {head.map((h) => (
                <th
                  key={h}
                  className="px-5 py-3.5 text-[11px] font-bold uppercase tracking-widest text-text-soft/60"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyRow({
  colSpan,
  text,
}: {
  colSpan: number;
  text: string;
}) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-5 py-10 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-text-soft/30 text-lg">
            —
          </div>
          <span className="text-sm text-text-soft/50">{text}</span>
        </div>
      </td>
    </tr>
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function AppSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccionar…",
  disabled = false,
  className = "",
}: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          open
            ? "border-brand-green bg-brand-green/5 ring-2 ring-brand-green/20"
            : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/8"
        }`}
      >
        <span className={selected ? "text-foreground" : "text-text-soft/50"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 flex-shrink-0 text-text-soft/60 transition-transform duration-200 ${open ? "rotate-180 text-brand-green" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-white/15 bg-[#04121d] shadow-2xl shadow-black/60 backdrop-blur-xl">
          <div className="max-h-56 overflow-y-auto scrollbar-thin">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors ${
                    isSelected
                      ? "bg-brand-green/15 text-brand-green"
                      : "text-white/80 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block truncate font-medium">{opt.label}</span>
                    {opt.hint && (
                      <span className="block text-[11px] text-text-soft/50 truncate">{opt.hint}</span>
                    )}
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 flex-shrink-0 text-brand-green" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

export default function Modal({
  title,
  open,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay oscuro + backdrop */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-xl backdrop-filter"
        onClick={onClose}
      />

      {/* Modal con glass profundo */}
      <div className={`relative glass-nav rounded-2xl w-full ${widths[size]} max-h-[90vh] overflow-hidden border border-white/12 shadow-[0_32px_80px_rgba(0,0,0,0.75)] flex flex-col`}>
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-gradient-to-r from-brand-green/5 to-brand-blue/5 z-10">
          <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-brand-blue">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 hover:bg-white/10 transition-all duration-200 text-text-soft hover:text-foreground hover:shadow-[0_0_12px_rgba(255,255,255,0.1)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-6">{children}</div>
      </div>
    </div>
  );
}

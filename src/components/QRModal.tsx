"use client";

import { useEffect, useRef, useState } from "react";
import Modal from "@/components/Modal";
import { Download } from "lucide-react";

export default function QRModal({
  id, nombre, tipo, onClose,
}: {
  id: string; nombre: string; tipo: "insumo" | "colaborador"; onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    const url = `${window.location.origin}/${tipo}/${id}`;
    import("qrcode").then(QRCode => {
      QRCode.toDataURL(url, {
        width: 240,
        margin: 2,
        color: { dark: "#04121d", light: "#84CE25" },
      }).then(setDataUrl);
    });
  }, [id, tipo]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `qr-${tipo}-${nombre.replace(/\s+/g, "-")}.png`;
    a.click();
  };

  return (
    <Modal title={`QR — ${nombre}`} open onClose={onClose} size="sm">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-xl border border-brand-green/30 p-3 bg-brand-green/5">
          {dataUrl ? (
            <img src={dataUrl} alt={`QR ${nombre}`} className="w-48 h-48 rounded-lg" />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center text-text-soft text-sm">Generando...</div>
          )}
        </div>
        <div className="text-center">
          <p className="font-semibold">{nombre}</p>
          <p className="text-xs text-text-soft capitalize">{tipo} · ID: {id.slice(-8)}</p>
        </div>
        <div className="flex gap-3 w-full">
          <button onClick={onClose} className="flex-1 rounded-lg border border-white/20 py-2 text-sm hover:bg-white/10 transition-colors">Cerrar</button>
          <button onClick={handleDownload} disabled={!dataUrl} className="flex-1 btn-green rounded-lg py-2 text-sm flex items-center justify-center gap-2 disabled:opacity-50">
            <Download className="h-4 w-4" /> Descargar
          </button>
        </div>
      </div>
    </Modal>
  );
}

"use client";

import { useEffect, useRef } from "react";

interface ShelfNode {
  gx: number;
  gy: number;
  sx: number;
  sy: number;
  label: string;
  count: number;
  lit: boolean;
  litTimer: number;
}

interface Pkg {
  sx: number; sy: number;
  ex: number; ey: number;
  progress: number;
  speed: number;
  col: string;
}

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  life: number;
  maxLife: number;
  size: number;
  col: string;
}

const ITEMS = [
  { label: "Resmas A4", count: 450 },
  { label: "Lápices HB", count: 1200 },
  { label: "Carpetas", count: 380 },
  { label: "Tóner HP", count: 56 },
  { label: "Bolígrafos", count: 890 },
  { label: "Post-its", count: 720 },
  { label: "Tijeras", count: 145 },
  { label: "Clips", count: 3200 },
  { label: "Sobres", count: 600 },
  { label: "Grapas", count: 2100 },
  { label: "Cintas", count: 340 },
  { label: "Marcadores", count: 480 },
];

const GREEN = "#84CE25";
const BLUE = "#0671ae";

export default function LoginBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    // Iso grid config — responsive
    const TW = () => Math.min(160, W * 0.13);
    const TH = () => TW() * 0.5;

    const isoToScreen = (gx: number, gy: number) => ({
      x: W * 0.5 + (gx - gy) * TW() * 0.5,
      y: H * 0.38 + (gx + gy) * TH() * 0.5,
    });

    // Grid of shelf positions
    const GRID: [number, number][] = [
      [-4, -2], [-2, -2], [0, -2], [2, -2], [4, -2],
      [-3, 0],  [-1, 0],  [1, 0],  [3, 0],
      [-4, 2],  [-2, 2],  [0, 2],
    ];

    const shelves: ShelfNode[] = GRID.map(([gx, gy], i) => {
      const { x, y } = isoToScreen(gx, gy);
      return { gx, gy, sx: x, sy: y, ...ITEMS[i % ITEMS.length], lit: false, litTimer: 0 };
    });

    const packages: Pkg[] = [];
    let lastPkgTime = 0;

    const spawnPkg = () => {
      if (packages.length >= 6) return;
      const a = shelves[Math.floor(Math.random() * shelves.length)];
      let b = shelves[Math.floor(Math.random() * shelves.length)];
      while (b === a) b = shelves[Math.floor(Math.random() * shelves.length)];
      packages.push({
        sx: a.sx, sy: a.sy - 20,
        ex: b.sx, ey: b.sy - 20,
        progress: 0,
        speed: 0.003 + Math.random() * 0.003,
        col: Math.random() > 0.5 ? GREEN : BLUE,
      });
    };

    const particles: Particle[] = [];

    const spawnParticles = (x: number, y: number, col: string, n = 3) => {
      for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = 0.4 + Math.random() * 1.2;
        const maxLife = 50 + Math.random() * 60;
        particles.push({ x, y, vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd, life: maxLife, maxLife, size: 1 + Math.random() * 2, col });
      }
    };

    // Scanner state
    let scanX = -60;
    let scanDir = 1;
    const SCAN_SPEED = 1.8;
    let frame = 0;

    // ── Draw helpers ──────────────────────────────────────────────────

    const drawGrid = () => {
      const size = 55;
      ctx.strokeStyle = "rgba(6,113,174,0.06)";
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += size) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += size) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };

    const drawShelf = (s: ShelfNode) => {
      const { sx: cx, sy: cy, lit } = s;
      const tw = TW() * 0.8;
      const th = TH() * 0.8;
      const d = TH() * 0.9; // depth/height

      const bStroke = lit ? `rgba(132,206,37,1)` : `rgba(6,113,174,0.45)`;
      const topFill = lit ? `rgba(132,206,37,0.18)` : `rgba(6,113,174,0.08)`;
      const rtFill  = lit ? `rgba(132,206,37,0.1)`  : `rgba(6,113,174,0.05)`;
      const ltFill  = lit ? `rgba(132,206,37,0.07)` : `rgba(6,113,174,0.03)`;

      if (lit) { ctx.shadowColor = GREEN; ctx.shadowBlur = 22; }

      // top face
      ctx.beginPath();
      ctx.moveTo(cx,         cy - d);
      ctx.lineTo(cx + tw/2,  cy - d + th/2);
      ctx.lineTo(cx,         cy - d + th);
      ctx.lineTo(cx - tw/2,  cy - d + th/2);
      ctx.closePath();
      ctx.fillStyle = topFill; ctx.fill();
      ctx.strokeStyle = bStroke; ctx.lineWidth = lit ? 1.2 : 0.8; ctx.stroke();

      // right face
      ctx.beginPath();
      ctx.moveTo(cx + tw/2, cy - d + th/2);
      ctx.lineTo(cx + tw/2, cy + th/2);
      ctx.lineTo(cx,        cy + th);
      ctx.lineTo(cx,        cy - d + th);
      ctx.closePath();
      ctx.fillStyle = rtFill; ctx.fill();
      ctx.strokeStyle = bStroke; ctx.stroke();

      // left face
      ctx.beginPath();
      ctx.moveTo(cx - tw/2, cy - d + th/2);
      ctx.lineTo(cx - tw/2, cy + th/2);
      ctx.lineTo(cx,        cy + th);
      ctx.lineTo(cx,        cy - d + th);
      ctx.closePath();
      ctx.fillStyle = ltFill; ctx.fill();
      ctx.strokeStyle = bStroke; ctx.stroke();

      // shelf divider lines (3 shelves per unit)
      const numDiv = 3;
      ctx.lineWidth = 0.5;
      for (let i = 1; i < numDiv; i++) {
        const r = i / numDiv;
        // right face line
        ctx.beginPath();
        ctx.moveTo(cx,        cy - d + th + r * d);
        ctx.lineTo(cx + tw/2, cy - d + th/2 + r * (th/2 + d/2));
        ctx.strokeStyle = lit ? "rgba(132,206,37,0.45)" : "rgba(6,113,174,0.18)";
        ctx.stroke();
        // left face line
        ctx.beginPath();
        ctx.moveTo(cx,        cy - d + th + r * d);
        ctx.lineTo(cx - tw/2, cy - d + th/2 + r * (th/2 + d/2));
        ctx.stroke();
      }

      // small box items on shelves
      if (lit) {
        for (let si = 0; si < 3; si++) {
          const bx = cx - tw * 0.25 + si * tw * 0.25;
          const by = cy - d + th * 0.3;
          const bs = 5;
          ctx.fillStyle = "rgba(132,206,37,0.6)";
          ctx.fillRect(bx - bs/2, by - bs, bs, bs);
        }
      }

      ctx.shadowBlur = 0;
    };

    const drawHUD = (s: ShelfNode) => {
      const { sx: cx, sy: cy, label, count, litTimer } = s;
      const fade = Math.min(1, litTimer / 25);
      const px = cx + 18;
      const py = cy - 100;
      const pw = 140;
      const ph = 58;

      ctx.globalAlpha = fade;

      // Panel background
      ctx.fillStyle = "rgba(4,18,29,0.92)";
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1;
      ctx.beginPath();
      // @ts-ignore
      ctx.roundRect(px, py, pw, ph, 5);
      ctx.fill();
      ctx.stroke();

      // corner accents
      const ac = 8;
      ctx.strokeStyle = GREEN;
      ctx.lineWidth = 1.5;
      [[px, py], [px + pw, py], [px, py + ph], [px + pw, py + ph]].forEach(([x, y], idx) => {
        ctx.beginPath();
        const dx = idx % 2 === 0 ? 1 : -1;
        const dy = idx < 2 ? 1 : -1;
        ctx.moveTo(x + dx * ac, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * ac);
        ctx.stroke();
      });

      // Connector dot + line
      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(px, py + ph / 2);
      ctx.strokeStyle = "rgba(132,206,37,0.5)";
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(cx, cy - 25, 3, 0, Math.PI * 2);
      ctx.fillStyle = GREEN;
      ctx.shadowColor = GREEN; ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Text
      ctx.fillStyle = GREEN;
      ctx.font = "bold 9px 'Courier New', monospace";
      ctx.fillText(`▶ ${label.toUpperCase()}`, px + 8, py + 17);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "8px 'Courier New', monospace";
      ctx.fillText(`STOCK: ${count} un.`, px + 8, py + 30);

      const ok = count > 100;
      ctx.fillStyle = ok ? "rgba(132,206,37,0.9)" : "rgba(255,90,90,0.9)";
      ctx.fillText(ok ? "● DISPONIBLE" : "⚠ STOCK BAJO", px + 8, py + 43);

      // scan line animation inside panel
      const scanOff = ((frame * 2) % pw);
      ctx.fillStyle = "rgba(132,206,37,0.06)";
      ctx.fillRect(px + scanOff, py + 2, 18, ph - 4);

      ctx.globalAlpha = 1;
    };

    const drawPkg = (p: Pkg) => {
      const t = ease(p.progress);
      const x = lerp(p.sx, p.ex, t);
      const y = lerp(p.sy, p.ey, t) - Math.sin(p.progress * Math.PI) * 50;
      const s = 11;

      ctx.shadowColor = p.col; ctx.shadowBlur = 14;

      const isGreen = p.col === GREEN;
      // top
      ctx.beginPath();
      ctx.moveTo(x, y - s); ctx.lineTo(x + s * 0.7, y - s * 0.5);
      ctx.lineTo(x, y); ctx.lineTo(x - s * 0.7, y - s * 0.5);
      ctx.closePath();
      ctx.fillStyle = isGreen ? "rgba(132,206,37,0.9)" : "rgba(6,113,174,0.9)";
      ctx.fill(); ctx.strokeStyle = p.col; ctx.lineWidth = 1; ctx.stroke();

      // right
      ctx.beginPath();
      ctx.moveTo(x + s * 0.7, y - s * 0.5); ctx.lineTo(x + s * 0.7, y + s * 0.3);
      ctx.lineTo(x, y + s * 0.8); ctx.lineTo(x, y); ctx.closePath();
      ctx.fillStyle = isGreen ? "rgba(90,150,10,0.85)" : "rgba(3,60,100,0.85)";
      ctx.fill(); ctx.stroke();

      // left
      ctx.beginPath();
      ctx.moveTo(x - s * 0.7, y - s * 0.5); ctx.lineTo(x - s * 0.7, y + s * 0.3);
      ctx.lineTo(x, y + s * 0.8); ctx.lineTo(x, y); ctx.closePath();
      ctx.fillStyle = isGreen ? "rgba(70,120,8,0.85)" : "rgba(2,45,80,0.85)";
      ctx.fill(); ctx.stroke();

      ctx.shadowBlur = 0;

      if (frame % 3 === 0) spawnParticles(x, y, p.col, 1);
    };

    const drawScanner = () => {
      const grad = ctx.createLinearGradient(scanX - 35, 0, scanX + 35, 0);
      grad.addColorStop(0,   "rgba(132,206,37,0)");
      grad.addColorStop(0.4, "rgba(132,206,37,0.08)");
      grad.addColorStop(0.5, "rgba(132,206,37,0.22)");
      grad.addColorStop(0.6, "rgba(132,206,37,0.08)");
      grad.addColorStop(1,   "rgba(132,206,37,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(scanX - 35, 0, 70, H);

      // beam
      ctx.beginPath();
      ctx.moveTo(scanX, 0); ctx.lineTo(scanX, H);
      ctx.strokeStyle = "rgba(132,206,37,0.75)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = GREEN; ctx.shadowBlur = 18;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // top label
      ctx.fillStyle = "rgba(132,206,37,0.65)";
      ctx.font = "7px 'Courier New', monospace";
      ctx.fillText("SCAN", scanX + 4, 16);

      // horizontal tick marks along beam
      for (let y = 0; y < H; y += 40) {
        const tickLen = y % 200 === 0 ? 8 : 4;
        ctx.beginPath();
        ctx.moveTo(scanX, y); ctx.lineTo(scanX + tickLen, y);
        ctx.strokeStyle = `rgba(132,206,37,${y % 200 === 0 ? 0.6 : 0.3})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };

    const drawConnections = () => {
      for (let i = 0; i < shelves.length; i++) {
        for (let j = i + 1; j < shelves.length; j++) {
          const a = shelves[i], b = shelves[j];
          const d = Math.sqrt((a.gx-b.gx)**2 + (a.gy-b.gy)**2);
          if (d > 2.2) continue;
          ctx.beginPath();
          ctx.moveTo(a.sx, a.sy); ctx.lineTo(b.sx, b.sy);
          ctx.strokeStyle = "rgba(6,113,174,0.14)";
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    };

    // Vignette
    const drawVignette = () => {
      const g = ctx.createRadialGradient(W/2, H/2, H*0.25, W/2, H/2, H*0.85);
      g.addColorStop(0, "rgba(4,18,29,0)");
      g.addColorStop(1, "rgba(4,18,29,0.75)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    };

    // ── Main loop ──────────────────────────────────────────────────────
    let animId: number;

    const animate = (ts: number) => {
      frame++;

      // Recalc screen positions on resize
      shelves.forEach(s => {
        const pos = isoToScreen(s.gx, s.gy);
        s.sx = pos.x; s.sy = pos.y;
      });

      // Clear
      ctx.fillStyle = "#04121d";
      ctx.fillRect(0, 0, W, H);
      drawGrid();
      drawConnections();

      // Scan movement
      scanX += SCAN_SPEED * scanDir;
      if (scanX > W + 60) scanDir = -1;
      if (scanX < -60)    scanDir = 1;

      // Scanner hit detection
      shelves.forEach(s => {
        if (Math.abs(s.sx - scanX) < 55) {
          s.lit = true;
          s.litTimer = 100;
          if (frame % 6 === 0) spawnParticles(s.sx, s.sy - 20, GREEN, 4);
        }
        if (s.litTimer > 0) s.litTimer--;
        else s.lit = false;
      });

      // Sort back-to-front (painter's algorithm)
      const sorted = [...shelves].sort((a, b) => (a.gx + a.gy) - (b.gx + b.gy));
      sorted.forEach(s => drawShelf(s));
      sorted.forEach(s => { if (s.lit) drawHUD(s); });

      // Packages
      if (ts - lastPkgTime > 1600) {
        spawnPkg();
        lastPkgTime = ts;
      }
      for (let i = packages.length - 1; i >= 0; i--) {
        const p = packages[i];
        p.progress += p.speed;
        if (p.progress >= 1) { packages.splice(i, 1); continue; }
        drawPkg(p);
      }

      // Scanner on top of everything
      drawScanner();

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.life--;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const alpha = p.life / p.maxLife;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.col === GREEN
          ? `rgba(132,206,37,${alpha})`
          : `rgba(6,113,174,${alpha})`;
        ctx.fill();
      }

      drawVignette();
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

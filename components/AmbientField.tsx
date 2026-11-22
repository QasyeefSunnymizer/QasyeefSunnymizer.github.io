"use client";

import { useEffect, useRef } from "react";

const CODE = ["{", "}", ";", "=>", "()", "[]", "::"];

/** Runes drawn as strokes (unit box, y down) so they never depend on installed fonts. */
const RUNES: Record<string, number[][][]> = {
  fehu: [[[0.3, 0], [0.3, 1]], [[0.3, 0.35], [0.8, 0.05]], [[0.3, 0.7], [0.8, 0.4]]],
  thurisaz: [[[0.3, 0], [0.3, 1]], [[0.3, 0.2], [0.8, 0.5], [0.3, 0.8]]],
  raido: [[[0.25, 0], [0.25, 1]], [[0.25, 0], [0.75, 0.25], [0.25, 0.5], [0.8, 1]]],
  algiz: [[[0.5, 0], [0.5, 1]], [[0.1, 0.1], [0.5, 0.55], [0.9, 0.1]]],
  othala: [[[0.5, 0], [0.9, 0.35], [0.5, 0.7], [0.1, 0.35], [0.5, 0]], [[0.3, 0.55], [0.1, 1]], [[0.7, 0.55], [0.9, 1]]],
  mannaz: [[[0.15, 0], [0.15, 1]], [[0.85, 0], [0.85, 1]], [[0.15, 0], [0.85, 0.5]], [[0.85, 0], [0.15, 0.5]]],
  star: [[[0.5, 0], [0.62, 0.38], [1, 0.5], [0.62, 0.62], [0.5, 1], [0.38, 0.62], [0, 0.5], [0.38, 0.38], [0.5, 0]]],
};
const RUNE_KEYS = Object.keys(RUNES);
const GLYPHS = [...CODE, ...CODE, ...RUNE_KEYS, "star"];

type P = { x: number; y: number; v: number; size: number; g: string; a: number; ph: number; hue: 0 | 1; par: number };

/** Page-wide backdrop: code-glyph embers drifting up. Fixed, low cost, pauses when hidden. */
export default function AmbientField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0;
    let ps: P[] = [];
    let raf = 0;
    let last = 0;
    let scroll = 0;

    const make = (spread: boolean): P => ({
      x: Math.random() * w,
      y: spread ? Math.random() * h : h + 30,
      v: 12 + Math.random() * 26,
      size: 11 + Math.random() * 14,
      g: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
      a: 0.1 + Math.random() * 0.28,
      ph: Math.random() * 6.28,
      hue: Math.random() < 0.25 ? 1 : 0,
      par: 0.15 + Math.random() * 0.5,
    });

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, Math.max(28, w / 16)));
      ps = Array.from({ length: n }, () => make(true));
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        if (!reduce) p.y -= p.v * dt;
        if (p.y < -30) Object.assign(p, make(false));
        const sway = Math.sin(t / 2200 + p.ph) * 14;
        const y = p.y - scroll * p.par;
        const wy = ((y % (h + 60)) + (h + 60)) % (h + 60) - 30;
        // fade in near bottom, out near top
        const edge = Math.min(1, Math.max(0, wy / 140), Math.max(0, (h - wy + 20) / 100));
        const col = p.hue ? `rgba(220,174,85,${p.a * edge})` : `rgba(200,71,59,${p.a * edge})`;
        const rune = RUNES[p.g];
        if (rune) {
          const s = p.size;
          ctx.strokeStyle = col;
          ctx.lineWidth = Math.max(1, s / 11);
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.beginPath();
          for (const line of rune) {
            line.forEach(([u, v], i) => {
              const px = p.x + sway + u * s * 0.8;
              const py = wy - s + v * s;
              if (i === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            });
          }
          ctx.stroke();
        } else {
          ctx.font = `${p.size}px ui-monospace, Menlo, Consolas, monospace`;
          ctx.fillStyle = col;
          ctx.fillText(p.g, p.x + sway, wy);
        }
      }
    };

    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016);
      last = t;
      if (!document.hidden) draw(t, dt);
      raf = requestAnimationFrame(loop);
    };
    const onScroll = () => {
      scroll = window.scrollY;
    };

    size();
    if (reduce) draw(0, 0);
    else raf = requestAnimationFrame(loop);
    window.addEventListener("resize", size);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return <canvas ref={ref} className="ambient" aria-hidden="true" />;
}

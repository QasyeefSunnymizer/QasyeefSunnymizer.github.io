"use client";

import { useEffect, useRef } from "react";

const GLYPHS = ["{", "}", ";", "=>", "()", "[]", "::", "ᚠ", "ᚦ", "ᚱ", "ᛉ", "ᛟ", "ᛗ", "✦", "∴"];

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
        ctx.font = `${p.size}px ui-monospace, Menlo, Consolas, monospace`;
        ctx.fillStyle = p.hue ? `rgba(220,174,85,${p.a * edge})` : `rgba(200,71,59,${p.a * edge})`;
        ctx.fillText(p.g, p.x + sway, wy);
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

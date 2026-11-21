"use client";

import { useEffect, useRef } from "react";

const RAMP = " .,:;-=+*#%@";

/** Live ASCII portrait. Samples /me.jpg, draws glyphs, glyphs scatter away from the cursor. */
export default function AsciiPortrait() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const img = new Image();
    let raf = 0;
    let alive = true;
    let cols = 0;
    let rows = 0;
    let cell = 8;
    let lum: Float32Array;
    const ptr = { x: -9999, y: -9999 };

    const build = () => {
      const box = canvas.parentElement!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cols = box.width < 360 ? 84 : 120;
      cell = box.width / cols;
      rows = Math.round((cols * (img.height / img.width)) / 1.65);
      canvas.width = box.width * dpr;
      canvas.height = rows * cell * 1.65 * dpr;
      canvas.style.width = `${box.width}px`;
      canvas.style.height = `${rows * cell * 1.65}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const off = document.createElement("canvas");
      off.width = cols;
      off.height = rows;
      const o = off.getContext("2d")!;
      o.drawImage(img, 0, 0, cols, rows);
      const d = o.getImageData(0, 0, cols, rows).data;
      lum = new Float32Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const i = (y * cols + x) * 4;
          let l = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;
          l = Math.min(1, Math.max(0, Math.pow(l, 1.15) * 1.35 - 0.05)); // lit skin -> bright glyphs
          // vignette so the edges dissolve into the page
          const dx = (x / cols - 0.5) / 0.5;
          const dy = (y / rows - 0.5) / 0.6;
          const v = Math.max(0, 1 - Math.pow(dx * dx + dy * dy, 2.2));
          lum[y * cols + x] = l * v;
        }
      }
    };

    const draw = (t: number) => {
      const w = cols * cell;
      const h = rows * cell * 1.65;
      ctx.clearRect(0, 0, w, h);
      ctx.font = `${cell * 1.65}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      const R = 80;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let l = lum[y * cols + x];
          if (l < 0.1) continue;
          let px = x * cell;
          let py = y * cell * 1.65;
          const dx = px - ptr.x;
          const dy = py - ptr.y;
          const dist = Math.hypot(dx, dy);
          if (dist < R) {
            const f = (1 - dist / R) ** 2;
            px += (dx / (dist || 1)) * f * 22;
            py += (dy / (dist || 1)) * f * 22;
            l = Math.min(1, l + f * 0.5);
          }
                    const ch = RAMP[Math.min(RAMP.length - 1, Math.floor(l * RAMP.length))];
          // dim = ember, bright = gold/bone
          const r = 255;
          const g = Math.round(106 + l * 110);
          const b = Math.round(61 + l * 140);
          ctx.fillStyle = `rgba(${r},${g},${b},${0.4 + l * 0.6})`;
          ctx.fillText(ch, px, py);
        }
      }
    };

    let wasActive = true; // draw once on load, then only while the cursor is near
    const loop = (t: number) => {
      if (!alive) return;
      const active = ptr.x > -999;
      if (active || wasActive) draw(t);
      wasActive = active;
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    const onLeave = () => {
      ptr.x = ptr.y = -9999;
    };

    img.onload = () => {
      build();
      if (reduce) draw(0);
      else raf = requestAnimationFrame(loop);
    };
    img.src = "/me-ascii.png";
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      if (img.complete && img.naturalWidth) {
        build();
        if (reduce) draw(0);
      }
    });
    ro.observe(canvas.parentElement!);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} role="img" aria-label="ASCII-art portrait of Sunny" />;
}

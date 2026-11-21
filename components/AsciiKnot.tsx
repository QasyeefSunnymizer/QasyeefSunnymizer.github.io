"use client";

import { useEffect, useRef } from "react";

const RAMP = " .:-=+*#%@";
const ROW = 1.65; // glyph height / width

type V = [number, number, number];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (a: V): V => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: V, b: V): V => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Revolving (2,3) torus knot drawn as shaded ASCII. Cursor tilts it. */
export default function AsciiKnot() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // knot centreline + Frenet frame -> tube surface points and normals
    const curve = (t: number): V => [(2 + Math.cos(3 * t)) * Math.cos(2 * t), (2 + Math.cos(3 * t)) * Math.sin(2 * t), -Math.sin(3 * t)];
    const pts: number[] = [];
    const nrm: number[] = [];
    const T = 900;
    const P = 22;
    for (let i = 0; i < T; i++) {
      const t = (i / T) * Math.PI * 2;
      const e = 0.002;
      const c = curve(t);
      const tan = norm(sub(curve(t + e), curve(t - e)));
      const acc = sub(norm(sub(curve(t + 2 * e), c)), norm(sub(c, curve(t - 2 * e))));
      const n = norm(cross(cross(tan, acc), tan));
      const b = norm(cross(tan, n));
      for (let j = 0; j < P; j++) {
        const f = (j / P) * Math.PI * 2;
        const nx = Math.cos(f) * n[0] + Math.sin(f) * b[0];
        const ny = Math.cos(f) * n[1] + Math.sin(f) * b[1];
        const nz = Math.cos(f) * n[2] + Math.sin(f) * b[2];
        pts.push(c[0] + 0.34 * nx, c[1] + 0.34 * ny, c[2] + 0.34 * nz);
        nrm.push(nx, ny, nz);
      }
    }
    const N = pts.length / 3;

    let cols = 0;
    let rows = 0;
    let cw = 0;
    let ch = 0;
    let zbuf = new Float32Array(0);
    let lbuf = new Float32Array(0);
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    let raf = 0;
    let alive = true;

    const size = () => {
      const w = canvas.parentElement!.getBoundingClientRect().width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cols = w < 360 ? 64 : 92;
      cw = w / cols;
      ch = cw * ROW;
      rows = Math.round(w / ch);
      canvas.width = w * dpr;
      canvas.height = rows * ch * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${rows * ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      zbuf = new Float32Array(cols * rows);
      lbuf = new Float32Array(cols * rows);
    };

    const draw = (time: number) => {
      const a = time / 2600 + tilt.y; // spin
      const b = 0.55 + tilt.x; // tilt
      const [sa, ca, sb, cb] = [Math.sin(a), Math.cos(a), Math.sin(b), Math.cos(b)];
      zbuf.fill(-1e9);
      lbuf.fill(-1);
      const scale = cols * 0.15;
      const light = norm([0.4, -0.6, 0.7]);
      for (let i = 0; i < N; i++) {
        const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
        // rotate about Y (spin) then X (tilt)
        const x1 = x * ca + z * sa;
        const z1 = -x * sa + z * ca;
        const y2 = y * cb - z1 * sb;
        const z2 = y * sb + z1 * cb;
        const persist = 9 / (9 - z2);
        const px = Math.round(cols / 2 + x1 * scale * persist);
        const py = Math.round(rows / 2 + y2 * scale * persist / ROW);
        if (px < 0 || px >= cols || py < 0 || py >= rows) continue;
        const k = py * cols + px;
        if (z2 <= zbuf[k]) continue;
        const nx = nrm[i * 3], ny = nrm[i * 3 + 1], nz = nrm[i * 3 + 2];
        const nx1 = nx * ca + nz * sa;
        const nz1 = -nx * sa + nz * ca;
        const ny2 = ny * cb - nz1 * sb;
        const nz2 = ny * sb + nz1 * cb;
        const L = nx1 * light[0] + ny2 * light[1] + nz2 * light[2];
        zbuf[k] = z2;
        lbuf[k] = Math.max(0.05, Math.max(0, L) * 0.75 + 0.25 * Math.max(0, z2 / 3 + 0.4));
      }
      ctx.clearRect(0, 0, cols * cw, rows * ch);
      ctx.font = `${cw * 1.7}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const l = lbuf[y * cols + x];
          if (l < 0) continue;
          const v = Math.min(1, l);
          const g = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
          ctx.fillStyle = `rgb(255,${Math.round(100 + v * 120)},${Math.round(55 + v * 120)})`;
          ctx.fillText(g, x * cw, y * ch);
        }
      }
    };

    const loop = (t: number) => {
      if (!alive) return;
      tilt.x += (tilt.tx - tilt.x) * 0.06;
      tilt.y += (tilt.ty - tilt.y) * 0.06;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      tilt.tx = (e.clientY / window.innerHeight - 0.5) * 0.9;
      tilt.ty = (e.clientX / window.innerWidth - 0.5) * 1.4;
    };

    size();
    if (reduce) draw(4000);
    else raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    const ro = new ResizeObserver(() => {
      size();
      if (reduce) draw(4000);
    });
    ro.observe(canvas.parentElement!);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={ref} role="img" aria-label="A slowly revolving knot drawn in ASCII characters" />;
}

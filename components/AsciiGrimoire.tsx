"use client";

import { useEffect, useRef } from "react";

const RAMP = " .:-=+*#%@";
const CODE = "{}[]();=<>/*+-_&|";
const ROW = 1.65; // glyph height / width

// materials
const PAGE = 0, COVER = 1, STEEL = 2, CURSOR = 3, HILT = 4;
const COLORS: [number, number, number][] = [
  [242, 193, 78], // page: gold
  [255, 106, 61], // cover: ember
  [239, 231, 214], // steel: bone
  [255, 250, 235], // cursor
  [242, 160, 70], // hilt
];

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Model = { pos: number[]; nrm: number[]; tone: number[]; mat: number[]; grp: number[] };

/** An open grimoire with a sword planted in the spine. Pages hold code, the blade holds runes. */
function buildModel(): Model {
  const m: Model = { pos: [], nrm: [], tone: [], mat: [], grp: [] };
  const cy = 1.65; // recentre
  const add = (x: number, y: number, z: number, nx: number, ny: number, nz: number, tone: number, mat: number, grp: number) => {
    m.pos.push(x, y - cy, z);
    m.nrm.push(nx, ny, nz);
    m.tone.push(tone);
    m.mat.push(mat);
    m.grp.push(grp);
  };
  const S = 0.03;
  const slope = 0.22 / 1.6;
  const valley = (ax: number) => 0.22 * (ax / 1.6);

  // pages: two sheets forming a V, code lines as texture
  for (const s of [-1, 1]) {
    const nl = Math.hypot(slope, 1);
    for (let u = 0; u <= 1.6; u += S) {
      for (let v = -1.1; v <= 1.1; v += S) {
        const rowF = (v + 1.1) / 0.13;
        const row = Math.floor(rowF);
        const f = rowF - row;
        const len = 0.5 + 0.5 * hash(row + (s > 0 ? 7 : 0));
        const indent = hash(row * 3 + s) > 0.7 ? 0.2 : 0;
        const inLine = f > 0.2 && f < 0.75 && u > 0.12 + indent && u < 0.12 + indent + len * 1.3 && row > 0 && row < 16;
        add(s * u, valley(u), v, (-s * slope) / nl, 1 / nl, 0, inLine ? 1 : 0.3, PAGE, 0);
      }
    }
  }
  // cover: ring around pages plus walls
  for (let x = -1.75; x <= 1.75; x += S) {
    for (let z = -1.2; z <= 1.2; z += S) {
      if (Math.abs(x) <= 1.6 && Math.abs(z) <= 1.1) continue;
      add(x, valley(Math.abs(x)) - 0.08, z, 0, 1, 0, 0.55, COVER, 0);
    }
  }
  for (let x = -1.75; x <= 1.75; x += S) {
    for (let y = 0; y <= 0.14; y += S) {
      const base = valley(Math.abs(x)) - 0.08 - y;
      add(x, base, -1.2, 0, 0, -1, 0.5, COVER, 0);
      add(x, base, 1.2, 0, 0, 1, 0.5, COVER, 0);
    }
  }
  for (let z = -1.2; z <= 1.2; z += S) {
    for (let y = 0; y <= 0.14; y += S) {
      add(-1.75, valley(1.75) - 0.08 - y, z, -1, 0, 0, 0.5, COVER, 0);
      add(1.75, valley(1.75) - 0.08 - y, z, 1, 0, 0, 0.5, COVER, 0);
    }
  }

  const box = (cx: number, cyy: number, cz: number, hx: number, hy: number, hz: number, mat: number, grp: number, tone = 1) => {
    for (let a = -hx; a <= hx; a += S) for (let b = -hy; b <= hy; b += S) {
      add(cx + a, cyy + b, cz + hz, 0, 0, 1, tone, mat, grp);
      add(cx + a, cyy + b, cz - hz, 0, 0, -1, tone, mat, grp);
    }
    for (let a = -hz; a <= hz; a += S) for (let b = -hy; b <= hy; b += S) {
      add(cx + hx, cyy + b, cz + a, 1, 0, 0, tone, mat, grp);
      add(cx - hx, cyy + b, cz + a, -1, 0, 0, tone, mat, grp);
    }
    for (let a = -hx; a <= hx; a += S) for (let b = -hz; b <= hz; b += S) {
      add(cx + a, cyy + hy, cz + b, 0, 1, 0, tone, mat, grp);
      add(cx + a, cyy - hy, cz + b, 0, -1, 0, tone, mat, grp);
    }
  };

  // blade (tapered, rune stripes, fuller line)
  for (let y = 0; y <= 2.5; y += S) {
    const w = 0.115 * Math.min(1, 0.15 + y / 0.55);
    const rune = Math.floor(y / 0.3) % 2 === 0 && y % 0.3 < 0.1;
    for (let x = -w; x <= w; x += S) {
      const fuller = Math.abs(x) < 0.02;
      const t = rune && Math.abs(x) < w * 0.7 ? 0.6 : fuller ? 0.75 : 1;
      add(x, y - 0.05, 0.03, 0, 0, 1, t, STEEL, 1);
      add(x, y - 0.05, -0.03, 0, 0, -1, t, STEEL, 1);
    }
    add(w, y - 0.05, 0, 1, 0, 0, 0.9, STEEL, 1);
    add(-w, y - 0.05, 0, -1, 0, 0, 0.9, STEEL, 1);
  }
  box(0, 2.51, 0, 0.55, 0.06, 0.09, HILT, 1); // crossguard
  for (let y = 2.57; y <= 3.0; y += S) {
    for (let a = 0; a < Math.PI * 2; a += 0.5) add(0.06 * Math.cos(a), y, 0.06 * Math.sin(a), Math.cos(a), 0, Math.sin(a), 0.8, HILT, 1);
  }
  for (let la = 0; la < Math.PI; la += 0.25) {
    for (let lo = 0; lo < Math.PI * 2; lo += 0.3) {
      const nx = Math.sin(la) * Math.cos(lo), ny = Math.cos(la), nz = Math.sin(la) * Math.sin(lo);
      add(0.1 * nx, 3.08 + 0.1 * ny, 0.1 * nz, nx, ny, nz, 0.9, HILT, 1);
    }
  }
  box(0, 3.4, 0, 0.07, 0.13, 0.05, CURSOR, 2); // terminal cursor
  return m;
}

/** Hero object: sword in a grimoire, drawn as shaded ASCII. Cursor tilts it, a click pulls the sword. */
export default function AsciiGrimoire() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const model = buildModel();
    const N = model.tone.length;

    let cols = 0, rows = 0, cw = 0, ch = 0;
    let zbuf = new Float32Array(0);
    let vbuf = new Float32Array(0);
    let mbuf = new Int8Array(0);
    const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
    let pull = -1e9;
    let raf = 0;
    let alive = true;

    const size = () => {
      const w = canvas.parentElement!.getBoundingClientRect().width;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cols = w < 420 ? 76 : w < 560 ? 96 : 124;
      cw = w / cols;
      ch = cw * ROW;
      rows = Math.round((w * 1.12) / ch);
      canvas.width = w * dpr;
      canvas.height = rows * ch * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${rows * ch}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      zbuf = new Float32Array(cols * rows);
      vbuf = new Float32Array(cols * rows);
      mbuf = new Int8Array(cols * rows);
    };

    const draw = (time: number) => {
      const a = time / 3400 + tilt.y;
      const b = 0.5 + tilt.x;
      const [sa, ca, sb, cb] = [Math.sin(a), Math.cos(a), Math.sin(b), Math.cos(b)];
      zbuf.fill(-1e9);
      vbuf.fill(-1);
      const k = Math.min(1, Math.max(0, (time - pull) / 1500));
      const lift = pull > 0 ? 1.4 * Math.sin(Math.PI * k) ** 2 : 0;
      const cursorOn = Math.floor(time / 520) % 2 === 0;
      const scale = cols * 0.222;
      const { pos, nrm, tone, mat, grp } = model;
      for (let i = 0; i < N; i++) {
        if (grp[i] === 2 && !cursorOn) continue;
        const x = pos[i * 3];
        const y = pos[i * 3 + 1] + (grp[i] > 0 ? lift : 0);
        const z = pos[i * 3 + 2];
        const x1 = x * ca + z * sa;
        const z1 = -x * sa + z * ca;
        const y2 = y * cb - z1 * sb;
        const z2 = y * sb + z1 * cb;
        const pr = 10 / (10 - z2);
        const px = Math.round(cols / 2 + x1 * scale * pr);
        const py = Math.round(rows / 2 - (y2 * scale * pr) / ROW);
        if (px < 0 || px >= cols || py < 0 || py >= rows) continue;
        const idx = py * cols + px;
        if (z2 <= zbuf[idx]) continue;
        const nx = nrm[i * 3], ny = nrm[i * 3 + 1], nz = nrm[i * 3 + 2];
        const nx1 = nx * ca + nz * sa;
        const nz1 = -nx * sa + nz * ca;
        const ny2 = ny * cb - nz1 * sb;
        const nz2 = ny * sb + nz1 * cb;
        let L = nx1 * 0.35 + ny2 * 0.8 + nz2 * 0.5;
        if (nz2 < 0) L = -L; // face the camera
        zbuf[idx] = z2;
        vbuf[idx] = Math.min(1, (0.55 + 0.45 * Math.max(0, L)) * Math.max(tone[i], 0.4) * 1.35);
        mbuf[idx] = mat[i];
      }
      ctx.clearRect(0, 0, cols * cw, rows * ch);
      ctx.font = `${cw * 1.7}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
      ctx.textBaseline = "top";
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const v = vbuf[y * cols + x];
          if (v < 0.08) continue;
          const mt = mbuf[y * cols + x];
          const g =
            mt === PAGE && v > 0.5
              ? CODE[Math.floor(hash(x * 31 + y * 57) * CODE.length)]
              : RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
          if (g === " ") continue;
          const c = COLORS[mt];
          const f = 0.75 + 0.25 * v;
          ctx.fillStyle = `rgb(${Math.round(c[0] * f)},${Math.round(c[1] * f)},${Math.round(c[2] * f)})`;
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
      tilt.tx = (e.clientY / window.innerHeight - 0.5) * 0.5;
      tilt.ty = (e.clientX / window.innerWidth - 0.5) * 1.0;
    };
    const onClick = () => {
      if (!reduce) pull = performance.now();
    };

    size();
    if (reduce) draw(5200);
    else raf = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("click", onClick);
    const ro = new ResizeObserver(() => {
      size();
      if (reduce) draw(5200);
    });
    ro.observe(canvas.parentElement!);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("click", onClick);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="A grimoire open on its spine with a sword planted in it, slowly revolving, drawn in code characters"
      title="Click it. Go on."
      style={{ cursor: "pointer", filter: "drop-shadow(0 0 16px rgba(255,106,61,0.32))", WebkitMaskImage: "radial-gradient(ellipse 54% 54% at 50% 50%, #000 78%, transparent 100%)", maskImage: "radial-gradient(ellipse 54% 54% at 50% 50%, #000 78%, transparent 100%)" }}
    />
  );
}

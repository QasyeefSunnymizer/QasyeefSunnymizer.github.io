"use client";

import { useEffect, useRef } from "react";

const RAMP = " .:-=+*#%@";
const CODE = "{}[]();=<>/*+-_&|";
const ROW = 1.65; // glyph height / width

// materials
const PAGE = 0, COVER = 1, STEEL = 2, CURSOR = 3, HILT = 4, WOOD = 5;
const COLORS: [number, number, number][] = [
  [236, 214, 160], // page: aged parchment
  [196, 66, 52], // cover: oxblood leather
  [239, 231, 214], // steel: bone
  [255, 250, 235], // cursor
  [220, 174, 85], // hilt: candle gold
  [168, 112, 66], // staff wood
];

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Model = { pos: number[]; nrm: number[]; tone: number[]; mat: number[]; grp: number[] };

/**
 * Mage-knight arms: a grimoire worn as a heater shield, a sword and a staff crossed behind it.
 * Groups: 0 shield, 1 sword, 2 cursor (blinks), 3 staff.
 */
function buildModel(): Model {
  const m: Model = { pos: [], nrm: [], tone: [], mat: [], grp: [] };
  const cy = -0.05; // recentre
  let xf: { phi: number; ox: number; oy: number; oz: number } | null = null;
  const add = (x: number, y: number, z: number, nx: number, ny: number, nz: number, tone: number, mat: number, grp: number) => {
    if (xf) {
      const c = Math.cos(xf.phi), sn = Math.sin(xf.phi);
      [x, y] = [x * c - y * sn + xf.ox, x * sn + y * c + xf.oy];
      [nx, ny] = [nx * c - ny * sn, nx * sn + ny * c];
      z += xf.oz;
    }
    m.pos.push(x, y - cy, z);
    m.nrm.push(nx, ny, nz);
    m.tone.push(tone);
    m.mat.push(mat);
    m.grp.push(grp);
  };
  const S = 0.03;

  // ── shield (the grimoire) ──
  const HW = 0.98, TOP = 0.92, BOT = -1.4, SHOULDER = -0.2, T = 0.11;
  const halfW = (y: number) => {
    if (y > TOP || y < BOT) return -1;
    if (y >= SHOULDER) return HW;
    const t = (SHOULDER - y) / (SHOULDER - BOT);
    return HW * (1 - Math.pow(t, 1.7));
  };
  const inside = (x: number, y: number) => Math.abs(x) <= halfW(y);
  const bulge = (x: number) => 0.1 * (1 - (x / HW) ** 2);
  for (let y = BOT; y <= TOP; y += S) {
    for (let x = -HW; x <= HW; x += S) {
      if (!inside(x, y)) continue;
      const edge = halfW(y) - Math.abs(x);
      const spine = x < -HW + 0.17;
      const border = edge < 0.08 || y > TOP - 0.08 || spine && (Math.floor((y + 2) / 0.28) % 2 === 0 ? false : true) && x > -HW + 0.1;
      const ring = Math.abs(Math.hypot(x - 0.04, y - 0.25) - 0.4) < 0.04;
      const strap = Math.abs(y + 0.72) < 0.05 && edge > 0.04;
      const gold = border || ring || strap;
      const slx = (0.2 * x) / HW;
      // front: leather cover with gold tooling
      add(x, y, T + bulge(x), -slx, 0, 1, gold ? 0.95 : spine ? 0.45 : 0.6, gold ? HILT : COVER, 0);
      // back: parchment pages with code lines
      const rowF = (y + 1.45) / 0.12;
      const row = Math.floor(rowF);
      const f = rowF - row;
      const len = 0.45 + 0.55 * hash(row);
      const inLine = f > 0.2 && f < 0.75 && edge > 0.14 && x > -HW + 0.2 && x < -HW + 0.2 + len * 1.3;
      add(x, y, -T - bulge(x), slx, 0, -1, inLine ? 1 : 0.32, PAGE, 0);
    }
  }
  // rim: page edges
  for (let y = BOT; y <= TOP; y += S * 0.6) {
    for (let x = -HW; x <= HW; x += S * 0.6) {
      if (!inside(x, y)) continue;
      const o = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => !inside(x + dx * S * 0.7, y + dy * S * 0.7));
      if (!o.length) continue;
      const nx = o.reduce((q, [dx]) => q + dx, 0);
      const ny = o.reduce((q, [, dy]) => q + dy, 0);
      const nl = Math.hypot(nx, ny) || 1;
      for (let z = -T - bulge(x); z <= T + bulge(x); z += S) {
        add(x, y, z, nx / nl, ny / nl, 0, 0.55 + 0.25 * (Math.floor(z / 0.02) % 2), PAGE, 0);
      }
    }
  }
  // terminal cursor in the ring
  for (let a = -0.07; a <= 0.07; a += S) for (let b = -0.13; b <= 0.13; b += S) add(0.04 + a, 0.25 + b, T + bulge(0.04) + 0.02, 0, 0, 1, 1, CURSOR, 2);

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
  const sphere = (cx: number, cyy: number, r: number, mat: number, grp: number, tone: number) => {
    for (let la = 0; la < Math.PI; la += 0.25) for (let lo = 0; lo < Math.PI * 2; lo += 0.3) {
      const nx = Math.sin(la) * Math.cos(lo), ny = Math.cos(la), nz = Math.sin(la) * Math.sin(lo);
      add(cx + r * nx, cyy + r * ny, r * nz, nx, ny, nz, tone, mat, grp);
    }
  };
  const rod = (y0: number, y1: number, r: number, mat: number, grp: number, tone: number) => {
    for (let y = y0; y <= y1; y += S) for (let a = 0; a < Math.PI * 2; a += 0.55) add(r * Math.cos(a), y, r * Math.sin(a), Math.cos(a), 0, Math.sin(a), tone, mat, grp);
  };

  // ── sword: crossed behind, leaning right ──
  xf = { phi: (-30 * Math.PI) / 180, ox: -0.875, oy: -1.67, oz: -0.16 };
  rod(0.04, 0.5, 0.05, HILT, 1, 0.7); // grip
  sphere(0, 0, 0.1, HILT, 1, 0.9); // pommel
  box(0, 0.55, 0, 0.5, 0.05, 0.08, HILT, 1); // crossguard
  for (let y = 0.6; y <= 3.8; y += S) {
    const rel = y - 0.6;
    const w = 0.12 * (rel > 2.8 ? Math.max(0.05, (3.2 - rel) / 0.4) : Math.min(1, 0.3 + rel / 0.3));
    const rune = Math.floor(rel / 0.32) % 2 === 0 && rel % 0.32 < 0.1 && rel > 0.2 && rel < 2.7;
    for (let x = -w; x <= w; x += S) {
      const t = rune && Math.abs(x) < w * 0.7 ? 0.6 : Math.abs(x) < 0.02 ? 0.75 : 1;
      add(x, y, 0.03, 0, 0, 1, t, STEEL, 1);
      add(x, y, -0.03, 0, 0, -1, t, STEEL, 1);
    }
    add(w, y, 0, 1, 0, 0, 0.9, STEEL, 1);
    add(-w, y, 0, -1, 0, 0, 0.9, STEEL, 1);
  }

  // ── staff: crossed behind, leaning left ──
  xf = { phi: (30 * Math.PI) / 180, ox: 0.875, oy: -1.67, oz: -0.3 };
  rod(0, 3.5, 0.055, WOOD, 3, 0.75);
  for (const y of [0.9, 1.0, 2.2]) rod(y, y + 0.05, 0.075, HILT, 3, 0.9); // gold bands
  for (let a = 0; a < Math.PI * 2; a += 0.2) {
    // crown ring and prongs around the orb
    add(0.14 * Math.cos(a), 3.52, 0.14 * Math.sin(a), Math.cos(a), 0, Math.sin(a), 0.9, HILT, 3);
    add(0.14 * Math.cos(a), 3.54, 0.14 * Math.sin(a), 0, 1, 0, 0.9, HILT, 3);
  }
  for (const a of [0, 1.57, 3.14, 4.71]) {
    for (let t = 0; t <= 1; t += 0.08) add(0.14 * Math.cos(a) * (1 + 0.2 * t), 3.52 + 0.3 * t, 0.14 * Math.sin(a) * (1 + 0.2 * t), Math.cos(a), 0.3, Math.sin(a), 0.9, HILT, 3);
  }
  sphere(0, 3.7, 0.1, CURSOR, 3, 1);
  xf = null;
  return m;
}

/** Hero object: mage-knight arms drawn as shaded ASCII. Cursor tilts it, a click raises the sword and staff. */
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
      const scale = cols * 0.195;
      const { pos, nrm, tone, mat, grp } = model;
      for (let i = 0; i < N; i++) {
        if (grp[i] === 2 && !cursorOn) continue;
        const x = pos[i * 3];
        const y = pos[i * 3 + 1] + (grp[i] === 1 ? lift : grp[i] === 3 ? lift * 0.5 : 0);
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
      aria-label="A grimoire worn as a knight\u2019s shield with a sword and a mage\u2019s staff crossed behind it, slowly revolving, drawn in code characters"
      title="Click it. Go on."
      style={{ cursor: "pointer", filter: "drop-shadow(0 0 16px rgba(220,150,70,0.30))", WebkitMaskImage: "radial-gradient(ellipse 54% 54% at 50% 50%, #000 78%, transparent 100%)", maskImage: "radial-gradient(ellipse 54% 54% at 50% 50%, #000 78%, transparent 100%)" }}
    />
  );
}

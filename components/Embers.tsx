"use client";

import { useEffect, useRef } from "react";
import { Application, Graphics } from "pixi.js";

type Ember = {
  g: Graphics;
  vx: number;
  vy: number;
  phase: number;
  life: number;
  max: number;
};

const COUNT = 80;

/** 2D layer: drifting embers that are pushed away by the cursor (Pixi.js). */
export default function Embers() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let ready = false;
    const app = new Application();
    const pointer = { x: -9999, y: -9999 };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    (async () => {
      try {
        await app.init({
          resizeTo: el,
          backgroundAlpha: 0,
          antialias: true,
          autoDensity: true,
          resolution: Math.min(window.devicePixelRatio || 1, 2),
        });
      } catch {
        return; // no WebGL/Canvas: page still works without the layer
      }
      ready = true;
      if (cancelled) {
        app.destroy(true, { children: true });
        return;
      }
      el.appendChild(app.canvas);

      const embers: Ember[] = [];
      const reset = (e: Ember, initial: boolean) => {
        const w = app.screen.width;
        const h = app.screen.height;
        e.g.x = Math.random() * w;
        e.g.y = initial ? Math.random() * h : h + 10;
        e.vx = (Math.random() - 0.5) * 0.25;
        e.vy = -(0.15 + Math.random() * 0.55);
        e.phase = Math.random() * Math.PI * 2;
        e.max = 400 + Math.random() * 500;
        e.life = initial ? Math.random() * e.max : 0;
        e.g.scale.set(0.4 + Math.random() * 1.2);
      };

      for (let i = 0; i < COUNT; i++) {
        const g = new Graphics().circle(0, 0, 2.2).fill({ color: i % 4 === 0 ? 0xf2c14e : 0xff6a3d });
        g.blendMode = "add";
        const e: Ember = { g, vx: 0, vy: 0, phase: 0, life: 0, max: 1 };
        reset(e, true);
        app.stage.addChild(g);
        embers.push(e);
      }

      app.ticker.add((t) => {
        const dt = t.deltaTime;
        for (const e of embers) {
          e.life += dt;
          e.phase += 0.02 * dt;
          const dx = e.g.x - pointer.x;
          const dy = e.g.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 130 * 130) {
            const d = Math.sqrt(d2) || 1;
            const push = (1 - d / 130) * 2.2;
            e.g.x += (dx / d) * push * dt;
            e.g.y += (dy / d) * push * dt;
          }
          e.g.x += (e.vx + Math.sin(e.phase) * 0.18) * dt;
          e.g.y += e.vy * dt;
          const k = e.life / e.max;
          e.g.alpha = k < 0.15 ? k / 0.15 : Math.max(0, 1 - (k - 0.15) / 0.85);
          if (e.life >= e.max || e.g.y < -10) reset(e, false);
        }
      });
    })();

    return () => {
      cancelled = true;
      window.removeEventListener("pointermove", onMove);
      if (ready) app.destroy(true, { children: true });
    };
  }, []);

  return <div ref={host} className="layer layer-2d" aria-hidden="true" />;
}

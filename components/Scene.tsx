"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/** 3D layer: a wireframe torus knot that follows the cursor (Three.js). */
export default function Scene() {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // WebGL unavailable: page still works without the layer
    }

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 9;

    const geometry = new THREE.TorusKnotGeometry(1.6, 0.46, 220, 28, 2, 3);
    const material = new THREE.MeshBasicMaterial({ color: 0xff6a3d, wireframe: true, transparent: true, opacity: 0.55 });
    const knot = new THREE.Mesh(geometry, material);
    scene.add(knot);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.9, 1),
      new THREE.MeshBasicMaterial({ color: 0xf2c14e, wireframe: true, transparent: true, opacity: 0.8 }),
    );
    scene.add(inner);

    const target = { x: 0, y: 0 };
    const onMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let raf = 0;
    const render = () => {
      if (!reduce) {
        knot.rotation.x += 0.0035;
        knot.rotation.y += 0.005;
        inner.rotation.x -= 0.006;
        inner.rotation.y -= 0.004;
      }
      camera.position.x += (target.x * 0.8 - camera.position.x) * 0.04;
      camera.position.y += (-target.y * 0.5 - camera.position.y) * 0.04;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      inner.geometry.dispose();
      (inner.material as THREE.Material).dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={host} className="layer layer-3d" aria-hidden="true" />;
}

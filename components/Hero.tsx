"use client";

import dynamic from "next/dynamic";

// Canvas layers only exist in the browser.
const Embers = dynamic(() => import("./Embers"), { ssr: false });
const Scene = dynamic(() => import("./Scene"), { ssr: false });

export default function Hero() {
  return (
    <header className="hero">
      <Scene />
      <Embers />
      <div className="hero-copy">
        <p className="eyebrow">Kuala Lumpur</p>
        <h1>
          Qasyeef <span>(Sunny)</span>
        </h1>
        <p className="lede">
          Software engineer &amp; AI builder. Building agentic systems, reading dark fantasy, and always down for new
          experiences.
        </p>
        <nav className="links" aria-label="Links">
          <a href="https://github.com/QasyeefSunnymizer">GitHub</a>
          <a href="https://www.linkedin.com/in/qasyeefilhanbutt/">LinkedIn</a>
        </nav>
      </div>
    </header>
  );
}

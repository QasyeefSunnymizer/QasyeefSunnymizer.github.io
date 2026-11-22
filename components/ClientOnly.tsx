"use client";

import dynamic from "next/dynamic";

const Grimoire = dynamic(() => import("./AsciiGrimoire"), { ssr: false });

export default function ClientOnly() {
  return <Grimoire />;
}

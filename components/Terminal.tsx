"use client";

import { useEffect, useRef, useState } from "react";
import { BOOKS, NOW } from "../lib/content";
import { SITE } from "../lib/site";

type Line = { cmd?: string; out?: string[] };

const run = (raw: string): string[] | "clear" | "exit" => {
  const cmd = raw.trim().toLowerCase();
  switch (cmd) {
    case "":
      return [];
    case "help":
      return ["whoami  now  books  links  coffee  hire  sudo  clear  exit"];
    case "whoami":
      return ["Sunny. Software engineer, KL. Builds AI that survives Tuesdays."];
    case "now": {
      const rows = Object.entries(NOW).filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`);
      return rows.length ? rows : ["nothing logged yet. Suspiciously quiet."];
    }
    case "books":
      return BOOKS.length ? BOOKS.map((b) => `${b.title}, ${b.author}`) : ["shelf is empty. Sunny owes you a reading list."];
    case "links":
      return [SITE.github, SITE.linkedin, ...SITE.elsewhere.map((e) => e.href)];
    case "coffee":
      return ["brewing...", "██████████ 100%", "ready. Productivity not guaranteed."];
    case "hire":
      return ["Sunny is gainfully employed and thriving. But he'll talk shop. Try 'links'."];
    case "sudo":
    case "sudo make me a sandwich":
      return ["Nice try. This is a portfolio, not production."];
    case "clear":
      return "clear";
    case "exit":
      return "exit";
    default:
      return [`command not found: ${raw.trim()}. Try 'help'.`];
  }
};

/** Hidden terminal. Open with the backtick key or the footer button. */
export default function Terminal() {
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<Line[]>([{ out: ["sunny.sh v1. type 'help'."] }]);
  const input = useRef<HTMLInputElement>(null);
  const log = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key === "`" && !(t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA"))) {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-terminal", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-terminal", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) input.current?.focus();
    log.current?.scrollTo({ top: log.current.scrollHeight });
  }, [open, lines]);

  if (!open) return null;

  return (
    <div className="term" role="dialog" aria-label="Terminal">
      <div className="term-log" ref={log}>
        {lines.map((l, i) => (
          <div key={i}>
            {l.cmd !== undefined && <div className="term-cmd">$ {l.cmd}</div>}
            {l.out?.map((o, j) => <div key={j}>{o}</div>)}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const v = input.current!.value;
          input.current!.value = "";
          const r = run(v);
          if (r === "clear") setLines([]);
          else if (r === "exit") setOpen(false);
          else setLines((ls) => [...ls, { cmd: v, out: r }]);
        }}
      >
        <label>
          <span className="term-cmd">$ </span>
          <input ref={input} autoComplete="off" spellCheck={false} aria-label="Command" />
        </label>
      </form>
    </div>
  );
}

import { REEL } from "../lib/content";
import { SITE } from "../lib/site";
import type { Video } from "../lib/youtube";

type Card = { title: string; href: string; img?: string; date?: string };

const EMPTY: Record<string, string> = {
  Substack: "Nothing of mine posted yet. Writing soon.",
  X: "Shorter thoughts, as @mcdoubleq.",
};

export default function Reel({ videos }: { videos: Video[] }) {
  return (
    <div className="groups">
      {SITE.elsewhere.map((e) => {
        const cards: Card[] =
          e.label === "YouTube"
            ? videos.slice(0, 2).map((v) => ({ title: v.title, href: v.href, img: v.thumb, date: v.date }))
            : REEL.filter((r) => r.platform === e.label).slice(0, 2);
        return (
          <section key={e.label} className="group" aria-label={e.label}>
            <h3>
              <a href={e.href}>{e.label}</a>
            </h3>
            <div className="group-tiles">
              {cards.length > 0 ? (
                cards.map((c) => (
                  <a key={c.href} href={c.href} className="tile">
                    {c.img ? <img src={c.img} alt="" loading="lazy" /> : <div className="tile-blank" aria-hidden="true">{e.label}</div>}
                    <span className="tile-title">{c.title}</span>
                    {c.date && <span className="tile-meta">{c.date}</span>}
                  </a>
                ))
              ) : (
                <a href={e.href} className="tile tile-link">
                  <span className="tile-note">{EMPTY[e.label] ?? e.note}</span>
                </a>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

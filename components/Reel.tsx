import { REEL } from "../lib/content";
import { SITE } from "../lib/site";
import type { Video } from "../lib/youtube";

type Card = { platform: string; title: string; href: string; img?: string; date?: string };

export default function Reel({ videos }: { videos: Video[] }) {
  const cards: Card[] = [
    ...REEL,
    ...videos.map((v) => ({ platform: "YouTube", title: v.title, href: v.href, img: v.thumb, date: v.date })),
  ];
  return (
    <div className="reel" role="region" aria-label="Latest posts, scrolls sideways" tabIndex={0}>
      {cards.map((c) => (
        <a key={c.href} href={c.href} className="tile">
          {c.img ? <img src={c.img} alt="" loading="lazy" /> : <div className="tile-blank" aria-hidden="true">{c.platform}</div>}
          <span className="tile-meta">
            {c.platform}
            {c.date ? ` · ${c.date}` : ""}
          </span>
          <span className="tile-title">{c.title}</span>
        </a>
      ))}
      {SITE.elsewhere
        .filter((e) => e.label !== "YouTube")
        .map((e) => (
          <a key={e.href} href={e.href} className="tile tile-link">
            <span className="tile-big">{e.label}</span>
            <span className="tile-note">{e.note}</span>
          </a>
        ))}
    </div>
  );
}

export type Video = { id: string; title: string; href: string; thumb: string; date: string };

const CHANNEL_ID = "UCXVRr1ReTbZhYbGwqXAqc-A";

const decode = (s: string) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Latest uploads from the public YouTube RSS feed, read at build time. Empty on failure. */
export async function latestVideos(limit = 8): Promise<Video[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`);
    if (!res.ok) return [];
    const xml = await res.text();
    return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit).flatMap((m) => {
      const id = m[1].match(/<yt:videoId>([^<]+)</)?.[1];
      const title = m[1].match(/<title>([^<]+)</)?.[1];
      const href = m[1].match(/<link rel="alternate" href="([^"]+)"/)?.[1];
      const pub = m[1].match(/<published>([^<]+)</)?.[1];
      if (!id || !title || !href) return [];
      return [
        {
          id,
          title: decode(title),
          href,
          thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          date: pub ? new Date(pub).toLocaleDateString("en", { month: "short", year: "numeric" }) : "",
        },
      ];
    });
  } catch {
    return [];
  }
}

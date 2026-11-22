import { execSync } from "node:child_process";
import Hero from "../components/Hero";
import OpenTerm from "../components/OpenTerm";
import Reel from "../components/Reel";
import Terminal from "../components/Terminal";
import { BOOKS, NOW } from "../lib/content";
import { SITE } from "../lib/site";
import { latestVideos } from "../lib/youtube";

const commit = (() => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return "a3f9c21";
  }
})();

const work = [
  {
    name: "prompt-sage",
    what: "Makes coding assistants like Claude and Codex stop rambling. Small Rust CLI, MIT licensed.",
    meta: "Rust",
    href: "https://github.com/QasyeefSunnymizer/prompt-sage",
  },
];

export default async function Page() {
  const videos = await latestVideos();
  const now = Object.entries(NOW).filter(([, v]) => v);
  return (
    <main>
      <Hero commit={commit} />

      <section className="block about" id="about">
        <figure>
          <img src="/me.jpg" alt="Sunny, smiling slightly, in a white shirt at a warmly lit restaurant" width={800} height={1000} />
          <figcaption>Not AI. Just good restaurant lighting.</figcaption>
        </figure>
        <div>
          <h2>The short version</h2>
          <p>
            I&rsquo;m an AI-focused software engineer with a solid foundation in backend systems, Linux and cloud
            deployments. I integrate enterprise data sources, build AI inference workflows, and turn stakeholder
            requirements into production-ready features, with hands-on time in machine learning, automation, NLP and
            computer vision.
          </p>
          <p>
            I like backend work, Linux boxes and cloud deploys, and I got pulled into AI because that&rsquo;s where the
            interesting breakage lives. Give me a vague ask from a stakeholder and I&rsquo;ll turn it into something
            people actually use.
          </p>
          <p>
            Off the clock I&rsquo;m deep in dark fantasy, hunting for good food, and saying yes to most new experiences.
            Ask me for a book or a restaurant.
          </p>
          <p className="stack">Python, TypeScript, Go, Rust. React and Next.js up front. Linux, Docker, PostgreSQL and AWS underneath.</p>
        </div>
      </section>

      {now.length > 0 && (
        <section className="block now" aria-label="Right now">
          {now.map(([k, v]) => (
            <p key={k}>
              <span>{k}</span> {v}
            </p>
          ))}
        </section>
      )}

      <section className="block wide" id="latest">
        <h2>Latest, unfiltered</h2>
        <p>Straight from the channels. Mostly food, sometimes code, occasionally both.</p>
        <Reel videos={videos} />
      </section>

      <section className="block" id="work">
        <h2>Things I&rsquo;ve built</h2>
        <p>Short list for now. It grows when I ship.</p>
        <ul className="work">
          {work.map((w) => {
            const inner = (
              <>
                <h3>{w.name}</h3>
                <p>{w.what}</p>
                <span className="meta">{w.meta}</span>
              </>
            );
            return (
              <li key={w.name}>
                {w.href ? (
                  <a href={w.href} className="row">
                    {inner}
                  </a>
                ) : (
                  <div className="row">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {BOOKS.length > 0 && (
        <section className="block" id="shelf">
          <h2>On the shelf</h2>
          <ul className="work">
            {BOOKS.map((b) => (
              <li key={b.title}>
                <div className="row">
                  <h3>{b.title}</h3>
                  <p>
                    {b.author}. {b.take}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="block closer">
        <h2>Say hi</h2>
        <p>Happy to talk shop, books or food spots.</p>
        <a className="cta" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        <p className="elsewhere">
          <a href={SITE.github}>GitHub</a>
          <a href={SITE.linkedin}>LinkedIn</a>
        </p>
        <p className="sig" aria-hidden="true">Qasyeef Sunnymizer</p>
      </section>

      <footer className="foot">
        <p>
          Kuala Lumpur. Hand-assembled, {new Date().getFullYear()}. Psst: press <kbd>`</kbd> or <OpenTerm />.
        </p>
        <Terminal />
      </footer>
    </main>
  );
}

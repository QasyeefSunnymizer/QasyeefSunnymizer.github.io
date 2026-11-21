import Hero from "../components/Hero";
import { SITE } from "../lib/site";

const work = [
  {
    name: "prompt-sage",
    what: "Makes coding assistants like Claude and Codex stop rambling. Small Rust CLI, MIT licensed.",
    meta: "Rust",
    href: "https://github.com/QasyeefSunnymizer/prompt-sage",
  },
];

export default function Page() {
  return (
    <main>
      <Hero />

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

      <section className="block" id="work">
        <h2>Things I&rsquo;ve built</h2>
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

      <section className="block" id="elsewhere">
        <h2>Elsewhere</h2>
        <p>The less polished side of me lives here.</p>
        <ul className="work">
          {SITE.elsewhere.map((e) => (
            <li key={e.href}>
              <a href={e.href} className="row">
                <h3>{e.label}</h3>
                <p>{e.note}</p>
              </a>
            </li>
          ))}
          <li>
            <a href={SITE.github} className="row">
              <h3>GitHub</h3>
              <p>The code, where it&rsquo;s public.</p>
            </a>
          </li>
          <li>
            <a href={SITE.linkedin} className="row">
              <h3>LinkedIn</h3>
              <p>The serious version of this page.</p>
            </a>
          </li>
        </ul>
      </section>

      <section className="block closer">
        <h2>Say hi</h2>
        <p>Happy to talk shop, books or food spots.</p>
        <a className="cta" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        <p className="sig" aria-hidden="true">Qasyeef Sunnymizer</p>
      </section>

      <footer className="foot">
        <p>Kuala Lumpur. Made by me, {new Date().getFullYear()}.</p>
      </footer>
    </main>
  );
}

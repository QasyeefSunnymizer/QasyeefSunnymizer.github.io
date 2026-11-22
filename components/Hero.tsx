import { SITE } from "../lib/site";
import ClientOnly from "./ClientOnly";

export default function Hero({ commit }: { commit: string }) {
  return (
    <header className="hero">
      <div className="hero-copy">
        <h1>
          Hey, I&rsquo;m <em>Sunny.</em>
        </h1>
        <p className="lede">
          I build AI that has to work on a Tuesday, not just in a demo. Agents, document pipelines, and the glue that
          keeps them honest. Based in KL, usually mid-chapter in something with dragons.
        </p>
        <nav className="links" aria-label="Links">
          <a href="#latest">Latest</a>
          <a href="#work">Work</a>
          <a href={SITE.github}>GitHub</a>
          <a href={`mailto:${SITE.email}`}>Say hi</a>
        </nav>
      </div>
      <figure className="portrait">
        <ClientOnly />
        <figcaption>
          <code>excalibur.git</code> <code>main @ {commit}</code> <span>click the sword</span>
        </figcaption>
      </figure>
    </header>
  );
}

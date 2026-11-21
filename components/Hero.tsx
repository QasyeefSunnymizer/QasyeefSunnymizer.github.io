import AsciiKnot from "./AsciiKnot";
import { SITE } from "../lib/site";

export default function Hero() {
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
          <a href="#work">Work</a>
          <a href="#elsewhere">Elsewhere</a>
          <a href={`mailto:${SITE.email}`}>Say hi</a>
        </nav>
      </div>
      <div className="portrait">
        <AsciiKnot />
      </div>
    </header>
  );
}

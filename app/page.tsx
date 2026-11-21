import Hero from "../components/Hero";

const stack: { title: string; items: string[] }[] = [
  { title: "Languages", items: ["Python", "TypeScript", "Go", "Rust", "C#"] },
  { title: "Web", items: ["React", "Next.js", "Three.js", "Pixi.js"] },
  { title: "Systems", items: ["Linux", "Docker", "PostgreSQL", "CI", "Cloud (AWS)"] },
  { title: "AI", items: ["LLM agents", "Document retrieval", "PyTorch", "OpenCV"] },
];

export default function Page() {
  return (
    <main>
      <Hero />

      <section className="block">
        <h2>About</h2>
        <p>
          AI-focused software engineer with a solid foundation in backend systems, Linux, and cloud deployments. I
          integrate enterprise data sources, build AI inference workflows, and turn stakeholder requirements into
          production-ready features, with hands-on exposure to machine learning, automation, NLP and computer vision.
        </p>
      </section>

      <section className="block">
        <h2>Stack</h2>
        <div className="grid">
          {stack.map((g) => (
            <div key={g.title} className="card">
              <h3>{g.title}</h3>
              <ul>
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="block">
        <h2>Projects</h2>
        <div className="grid two">
          <a className="card link-card" href="https://github.com/QasyeefSunnymizer/prompt-sage">
            <h3>prompt-sage</h3>
            <p>A concise response mode for coding assistants such as Claude and Codex. Rust CLI, MIT licensed.</p>
            <span className="tag">Rust</span>
          </a>
          <a className="card link-card" href="https://github.com/QasyeefSunnymizer/QasyeefSunnymizer.github.io">
            <h3>This site</h3>
            <p>
              Next.js static export on GitHub Pages. Pixi.js draws the 2D embers, Three.js draws the 3D knot, and both
              fall back cleanly without WebGL.
            </p>
            <span className="tag">TypeScript</span>
          </a>
        </div>
      </section>

      <footer className="foot">
        <p>© {new Date().getFullYear()} Qasyeef · Kuala Lumpur</p>
      </footer>
    </main>
  );
}

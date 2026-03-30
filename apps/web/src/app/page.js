import Link from "next/link";

const TESTIMONIALS = [
  {
    quote:
      "The CLI replaced a messy script chain for us. We now process 300+ SKU images in one pass.",
    byline: "Elena M., ecommerce ops",
  },
  {
    quote:
      "The app is perfect for art direction reviews. No upload, no cloud, no surprises.",
    byline: "Marco L., product designer",
  },
  {
    quote:
      "Offline after activation is huge when I edit while traveling. Super reliable workflow.",
    byline: "Priya S., indie founder",
  },
];

const FAQS = [
  {
    q: "Why do App+CLI purchases include two keys?",
    a: "App and CLI are separate entitlements. The app key unlocks desktop usage and the CLI key unlocks terminal usage.",
  },
  {
    q: "Can I share installers?",
    a: "Installers are public. Runtime features only work after valid license activation on your machine.",
  },
  {
    q: "Does it work offline?",
    a: "Yes. After activation, each key is cached locally with an offline validity window and grace period.",
  },
  {
    q: "What does desktop processing require?",
    a: "Desktop processing requires both active keys: App key and CLI key.",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Local-first background removal</p>
            <h1>Cut clean transparent PNGs with App, CLI, or both.</h1>
            <p className="subtitle">
              Built for creators and teams who need predictable, private processing on-device.
              Buy once, activate your key(s), and keep working even when offline.
            </p>
            <div className="cta-row">
              <Link className="btn primary" href="/pricing">
                See Pricing
              </Link>
              <Link className="btn" href="/downloads">
                Download Installers
              </Link>
            </div>
            <div className="trust-row">
              <span>Local processing</span>
              <span>Offline after activation</span>
              <span>One-time purchase</span>
            </div>
          </div>
          <aside className="hero-card">
            <h3>How activation works</h3>
            <ol>
              <li>Buy App, CLI, or Both.</li>
              <li>Get key(s) from Polar purchases.</li>
              <li>Activate in the matching surface.</li>
            </ol>
            <p className="small-note">
              App+CLI includes 2 keys. Desktop processing requires both active.
            </p>
          </aside>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <h2>Choose your workflow</h2>
          <div className="comparison-grid">
            <article className="card">
              <h3>CLI</h3>
              <p>Best for automation, scripts, and batch jobs.</p>
              <ul>
                <li>1 CLI key</li>
                <li>Terminal workflows</li>
                <li>Fast batch processing</li>
              </ul>
            </article>
            <article className="card">
              <h3>App</h3>
              <p>Best for visual review and side-by-side previews.</p>
              <ul>
                <li>1 App key</li>
                <li>Desktop UI workflow</li>
                <li>Before/after comparison</li>
              </ul>
            </article>
            <article className="card featured">
              <span className="badge">Best value</span>
              <h3>App + CLI</h3>
              <p>Full workflow with automation + desktop review.</p>
              <ul>
                <li>2 keys (App + CLI)</li>
                <li>Desktop processing enabled when both active</li>
                <li>Great for teams shipping assets daily</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="container">
          <h2>Used by teams who care about control</h2>
          <div className="quote-grid">
            {TESTIMONIALS.map((item) => (
              <article className="quote" key={item.byline}>
                <p>"{item.quote}"</p>
                <strong>{item.byline}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-soft">
        <div className="container">
          <h2>Frequently asked questions</h2>
          <div className="faq-grid">
            {FAQS.map((item) => (
              <article className="faq-item" key={item.q}>
                <h3>{item.q}</h3>
                <p>{item.a}</p>
              </article>
            ))}
          </div>

          <div className="cta-band">
            <h3>Ready to ship cleaner assets faster?</h3>
            <p>Pick the workflow that fits today. Upgrade path is built in by choosing Both.</p>
            <Link className="btn primary" href="/pricing">
              Buy App / CLI / Both
            </Link>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          Local Background Remover - public installers, license-gated runtime, offline
          after activation.
        </div>
      </footer>
    </main>
  );
}

"use client";

import { useState } from "react";

const PLANS = [
  {
    kind: "app",
    title: "App",
    price: "$6.99",
    keys: "Includes 1 App key",
    bullets: [
      "Desktop visual workflow",
      "Before/after compare controls",
      "Activate app key in desktop",
    ],
  },
  {
    kind: "cli",
    title: "CLI",
    price: "$6.99",
    keys: "Includes 1 CLI key",
    bullets: [
      "Batch processing in terminal",
      "Script and automation friendly",
      "Activate CLI key in terminal",
    ],
  },
  {
    kind: "both",
    title: "App + CLI",
    price: "$9.99",
    keys: "Includes 2 keys (App + CLI)",
    featured: true,
    bullets: [
      "Desktop + terminal workflows",
      "Best value for production teams",
      "Desktop processing requires both keys active",
    ],
  },
];

export default function PricingPage() {
  const [busyKind, setBusyKind] = useState(null);
  const [message, setMessage] = useState("");

  async function startCheckout(kind) {
    setBusyKind(kind);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (error) {
      setMessage(error.message || "Checkout failed");
      setBusyKind(null);
    }
  }

  return (
    <main className="container section">
      <h1>Local Background Remover Pricing</h1>
      <p className="subtitle">
        One-time purchases. Public downloads. Runtime usage unlocks after activating the
        matching key(s).
      </p>

      <div className="pricing">
        {PLANS.map((plan) => (
          <article className={`card ${plan.featured ? "featured" : ""}`} key={plan.kind}>
            {plan.featured ? <span className="badge">Best value</span> : null}
            <h3>{plan.title}</h3>
            <div className="price">{plan.price}</div>
            <p className="small-note">{plan.keys}</p>
            <ul>
              {plan.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <button
              className="btn primary"
              onClick={() => startCheckout(plan.kind)}
              disabled={busyKind === plan.kind}
              type="button"
            >
              {busyKind === plan.kind ? "Opening checkout..." : "Buy now"}
            </button>
          </article>
        ))}
      </div>

      {message ? <p className="note">{message}</p> : null}

      <div className="card" style={{ marginTop: "18px" }}>
        <h3>Activation checklist</h3>
        <ul>
          <li>App purchase: activate App key inside desktop app.</li>
          <li>CLI purchase: activate CLI key via terminal command.</li>
          <li>App + CLI purchase: activate both keys in their respective surfaces.</li>
        </ul>
      </div>
    </main>
  );
}

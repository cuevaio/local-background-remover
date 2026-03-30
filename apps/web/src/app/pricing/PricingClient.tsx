"use client";

import { useState } from "react";

type PlanKind = "app" | "cli" | "both";

type Plan = {
  kind: PlanKind;
  title: string;
  price: string;
  keys: string;
  bullets: string[];
  cta: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
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
    cta: "Buy App License",
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
    cta: "Buy CLI License",
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
    cta: "Buy App + CLI Bundle",
  },
];

type CheckoutResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
};

export default function PricingClient() {
  const [busyKind, setBusyKind] = useState<PlanKind | null>(null);
  const [message, setMessage] = useState("");

  async function startCheckout(kind: PlanKind) {
    setBusyKind(kind);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });

      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      const messageText = error instanceof Error ? error.message : "Checkout failed";
      setMessage(messageText);
      setBusyKind(null);
    }
  }

  return (
    <>
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
              {busyKind === plan.kind ? "Opening checkout..." : plan.cta}
            </button>
          </article>
        ))}
      </div>

      {message ? <p className="note">{message}</p> : null}
    </>
  );
}

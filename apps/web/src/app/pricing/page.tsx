import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

import PricingClient from "./PricingClient";

export const metadata: Metadata = buildPageMetadata({
  title: "Pricing for Offline Background Remover App and CLI",
  description:
    "Compare one-time pricing for the Local Background Remover app, CLI, or both. Public downloads with license-gated runtime.",
  path: "/pricing",
});

export default function PricingPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://local.backgroundrm.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Pricing",
        item: "https://local.backgroundrm.com/pricing",
      },
    ],
  };

  return (
    <>
      <Script id="pricing-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>

      <main className="container section">
        <h1>Local Background Remover Pricing</h1>
        <p className="subtitle">
          One-time purchases. Public downloads. Runtime usage unlocks after activating the
          matching key(s).
        </p>

        <h2>Choose a license plan</h2>
        <PricingClient />

        <div className="card" style={{ marginTop: "18px" }}>
          <h2>Activation checklist</h2>
          <ul>
            <li>App purchase: activate App key inside desktop app.</li>
            <li>CLI purchase: activate CLI key via terminal command.</li>
            <li>App + CLI purchase: activate both keys in their respective surfaces.</li>
          </ul>
          <p className="note">
            Need install steps first? Go to <Link href="/downloads">Downloads</Link>.
          </p>
        </div>
      </main>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

const CLI_INSTALL_CMD = "curl -fsSL https://local.backgroundrm.com/install | bash";

export const metadata: Metadata = buildPageMetadata({
  title: "Downloads and Install Guide for Offline Background Remover",
  description:
    "Download the Local Background Remover app and CLI. Install with public links, then activate keys for runtime use.",
  path: "/downloads",
});

export default function DownloadsPage() {
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
        name: "Downloads",
        item: "https://local.backgroundrm.com/downloads",
      },
    ],
  };

  return (
    <>
      <Script id="downloads-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>

      <main className="container section">
        <h1>Local Background Remover Downloads</h1>
        <p className="subtitle">
          Downloads are public. Runtime features require valid activation for each surface.
        </p>

        <div className="card">
          <h2>CLI download and install (macOS)</h2>
          <p>Install globally with one command:</p>
          <pre className="code-block">{CLI_INSTALL_CMD}</pre>
          <p className="note">
            Activate your CLI key before running model ensure/remove commands.
          </p>
        </div>

        <div className="card">
          <h2>Desktop app download</h2>
          <p>
            Desktop downloads are public. Once installed, activate your desktop license key
            in-app before processing images.
          </p>
          <p className="note">
            If you bought App + CLI, desktop processing requires both active keys.
          </p>
        </div>

        <div className="card">
          <h2>What to do next</h2>
          <p>
            Compare plans on <Link href="/pricing">Pricing</Link> if you still need a key, or
            return to the <Link href="/">homepage</Link> for workflow details.
          </p>
        </div>
      </main>
    </>
  );
}

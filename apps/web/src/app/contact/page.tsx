import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPageMetadata } from "@/lib/seo";

const CONTACT_CHANNELS = [
  {
    label: "X",
    href: "https://x.com/cuevaio",
    detail: "Short support questions, release updates, and direct reach.",
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/cuevaio",
    detail: "Product updates and build notes.",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/cueva.io",
    detail: "Indie builder updates and behind-the-scenes progress.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact cueva.io for product questions, support, and feedback about Local Background Remover.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Contact cueva.io
        </Badge>
        <h1 className="display-title md:text-5xl">Reach me directly</h1>
        <p className="section-copy md:text-lg">
          I build and support this product myself. If you have setup issues, licensing questions, or
          feature ideas, send a message through any of these channels.
        </p>
      </section>

      <section className="section-block section-divider grid gap-4 md:grid-cols-3">
        {CONTACT_CHANNELS.map((channel) => (
          <Card key={channel.label} className="bg-card/95">
            <CardHeader>
              <CardTitle>{channel.label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{channel.detail}</p>
              <Button asChild variant="outline" className="w-fit">
                <Link href={channel.href} target="_blank" rel="noreferrer noopener">
                  Open {channel.label}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="section-block section-divider flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href="/faq">Read FAQ</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/docs">Open docs</Link>
        </Button>
      </section>
    </main>
  );
}

import Link from "next/link";
import { GlobeIcon, StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FooterColumn = {
  title: string;
  links: Array<{
    label: string;
    href: string;
  }>;
};

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Desktop App", href: "/downloads" },
      { label: "CLI", href: "/downloads" },
      { label: "Pricing", href: "/pricing" },
      { label: "Install Guide", href: "/downloads" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Activation Steps", href: "/thank-you" },
      { label: "FAQ", href: "/pricing" },
      { label: "System Status", href: "#" },
      { label: "Support", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Customers", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Compare",
    links: [
      { label: "All compare pages", href: "/compare" },
      { label: "vs remove.bg", href: "/compare/remove-bg" },
      { label: "vs Photoroom", href: "/compare/photoroom" },
      { label: "vs Clipdrop", href: "/compare/clipdrop" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "X", href: "#", type: "text" as const },
  { label: "in", href: "#", type: "text" as const },
  { label: "gh", href: "#", type: "text" as const },
  { label: "Community", href: "#", type: "icon" as const },
];

const REVIEW_ITEMS = [
  { source: "G2", score: "5.0" },
  { source: "Product Hunt", score: "5.0" },
  { source: "Capterra", score: "4.9" },
];

export default function SiteFooter() {
  return (
    <footer className="section-divider">
      <div className="relative overflow-hidden border-b border-border bg-[#0b0c12] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgb(38 53 95 / 30%), rgb(15 58 36 / 28%)), linear-gradient(to right, rgb(255 255 255 / 5%) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 5%) 1px, transparent 1px)",
            backgroundSize: "auto, 56px 56px, 56px 56px",
          }}
        />
        <div className="pointer-events-none absolute -top-10 left-1/2 h-16 w-[66%] -translate-x-1/2 rounded-b-[30px] bg-background" />

        <div className="relative section-block flex flex-col items-center gap-6 py-20 text-center">
          <h2 className="font-display text-balance text-4xl font-medium tracking-tight md:text-6xl">
            Supercharge your image operations
          </h2>
          <p className="max-w-2xl text-base text-white/70 md:text-2xl md:leading-8">
            Local, reliable background removal for teams that need speed without giving up control.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white text-black hover:bg-white/90">
              <Link href="/pricing">View one-time pricing</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/8 text-white hover:bg-white/14 hover:text-white"
            >
              <Link href="/downloads">Open downloads</Link>
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-sm text-white/70">
            {REVIEW_ITEMS.map((item) => (
              <div key={item.source} className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5">
                <span className="font-medium text-white/90">{item.source}</span>
                <span className="text-white/55">{item.score}</span>
                <span className="inline-flex items-center gap-0.5 text-yellow-300">
                  <StarIcon className="size-3 fill-yellow-300 text-yellow-300" />
                  <StarIcon className="size-3 fill-yellow-300 text-yellow-300" />
                  <StarIcon className="size-3 fill-yellow-300 text-yellow-300" />
                  <StarIcon className="size-3 fill-yellow-300 text-yellow-300" />
                  <StarIcon className="size-3 fill-yellow-300 text-yellow-300" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#f3f3f3]">
        <div className="section-block space-y-12 pt-14 pb-28">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <div className="space-y-6">
              <p className="font-display text-5xl font-semibold tracking-tight text-foreground">local.</p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Public installers with license-gated runtime. Built for private, repeatable asset
                production.
              </p>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={item.label}
                  >
                    {item.type === "icon" ? (
                      <GlobeIcon className="size-4" />
                    ) : (
                      <span className="text-xs font-semibold uppercase">{item.label}</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="space-y-3">
                <p className="text-sm font-semibold text-foreground">{column.title}</p>
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {column.links.map((item) => (
                    <li key={`${column.title}-${item.label}`}>
                      <Link href={item.href} className="transition-colors hover:text-foreground">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
            <Badge variant="outline" className="bg-card normal-case tracking-normal">
              <span className="mr-2 inline-block size-2 rounded-full bg-success" />
              All systems operational
            </Badge>
            <p>© 2026 Local Background Remover, Inc.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

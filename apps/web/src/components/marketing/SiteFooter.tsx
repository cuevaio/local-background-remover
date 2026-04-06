import Link from "next/link";
import { StarIcon } from "lucide-react";

import TrackedExpLink from "@/components/analytics/TrackedExpLink";
import ExpLink from "@/components/experiments/ExpLink";
import { BrandLogo } from "@/components/marketing/BrandLogo";
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
      { label: "Pricing", href: "/pricing" },
      { label: "Install", href: "/downloads" },
      { label: "CLI Docs", href: "/docs" },
      { label: "Gallery", href: "/gallery" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "CLI Docs", href: "/docs" },
      { label: "FAQ", href: "/faq" },
      { label: "Compare tools", href: "/compare" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Customers", href: "/customers" },
      { label: "Privacy", href: "/privacy" },
      { label: "Contact", href: "/contact" },
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

type SocialLink = {
  label: string;
  href: string;
};

const SOCIAL_LINKS: SocialLink[] = [
  { label: "X", href: "https://x.com/cuevaio" },
  {
    label: "in",
    href: "https://linkedin.com/in/cuevaio",
  },
  {
    label: "IG",
    href: "https://instagram.com/cueva.io",
  },
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
            Clean backgrounds privately. Pay once.
          </h2>
          <p className="max-w-2xl text-base text-white/70 md:text-2xl md:leading-8">
            A Mac app for everyday image cleanup, plus an optional CLI for scripts and coding agents.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="secondary" className="bg-white text-black hover:bg-white/90">
              <TrackedExpLink href="/pricing" slot="footer.primary" label="View one-time pricing">
                View one-time pricing
              </TrackedExpLink>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/25 bg-white/8 text-white hover:bg-white/14 hover:text-white"
            >
              <TrackedExpLink href="/downloads" slot="footer.secondary" label="Install anytime">
                Install anytime
              </TrackedExpLink>
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
              <ExpLink href="/" className="inline-flex w-fit items-center">
                <BrandLogo
                  markClassName="size-8"
                  wordmarkClassName="text-2xl md:text-3xl"
                  wordmark="local"
                />
              </ExpLink>
              <p className="max-w-xs text-sm text-muted-foreground">
                Private background removal on your Mac, with one-time pricing and optional command-line automation.
              </p>
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={item.label}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <span className="text-xs font-semibold uppercase">{item.label}</span>
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
                      <ExpLink href={item.href} className="transition-colors hover:text-foreground">
                        {item.label}
                      </ExpLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid gap-4 border-t border-border pt-8 md:grid-cols-[1.2fr_auto] md:items-center">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Product built by cueva.io
              </p>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Local Background Remover is built by Anthony Cueva to help sellers, creators, and small teams clean up images privately on their own Mac, without subscriptions or upload-first workflows.
              </p>
            </div>
            <Button asChild variant="outline" size="sm" className="w-fit">
              <TrackedExpLink href="/about" slot="footer.story" label="Read the indie story">
                Read the indie story
              </TrackedExpLink>
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5 text-xs text-muted-foreground">
            <Badge variant="outline" className="bg-card normal-case tracking-normal">
              <span className="mr-2 inline-block size-2 rounded-full bg-success" />
              All systems operational
            </Badge>
            <p>© 2026 Anthony Cueva. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

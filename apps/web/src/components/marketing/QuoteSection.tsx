import type { CSSProperties } from "react";

import { Badge } from "@/components/ui/badge";

const DOT_GRID_STYLE: CSSProperties = {
  backgroundImage: "radial-gradient(circle at center, rgb(212 212 212 / 0.78) 1px, transparent 1.2px)",
  backgroundSize: "12px 12px",
};

export default function QuoteSection() {
  return (
    <section className="section-block section-divider">
      <div className="relative overflow-hidden rounded-[20px] border border-border bg-card px-6 py-12 md:px-12 md:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={DOT_GRID_STYLE} />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/52 to-background/76"
        />

        <div className="pointer-events-none absolute left-7 top-10 hidden w-36 -rotate-6 rounded-xl border border-border bg-card/95 p-3 shadow-sm lg:block">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Batch success</p>
          <p className="font-mono text-xl font-medium text-success">98.7%</p>
        </div>

        <div className="pointer-events-none absolute bottom-12 right-8 hidden w-36 rotate-6 rounded-xl border border-border bg-card/95 p-3 shadow-sm lg:block">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Avg run</p>
          <p className="font-mono text-xl font-medium text-info">1m 42s</p>
        </div>

        <div className="relative mx-auto flex w-full max-w-3xl flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            A clearer workflow
          </Badge>

          <blockquote className="space-y-6 text-balance font-display text-[clamp(1.9rem,4.2vw,3.35rem)] leading-[1.13] tracking-tight">
            <p>
              “Clean edges are easy.
              <br className="hidden md:block" />
              Clean handoffs win.”
            </p>

            <p className="text-[0.78em] text-foreground">
              Local Background Remover combines <span className="text-warning">desktop review</span>,{" "}
              <span className="text-success">command-line speed</span>, and{" "}
              <span className="text-info">offline reliability</span> in one lean stack.
            </p>

            <p className="text-[0.75em] text-muted-foreground">
              Fast. Private. Repeatable. Built for people who care about craft.
            </p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

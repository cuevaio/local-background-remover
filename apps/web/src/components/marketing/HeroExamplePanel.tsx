"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type HeroExample = {
  id: string;
  title: string;
  context: string;
  segment: string;
  beforeUrl: string;
  afterUrl: string;
};

const EXAMPLES: HeroExample[] = [
  {
    id: "person",
    title: "People portraits",
    context: "Clean profile and team photos for websites and social posts.",
    segment: "People",
    beforeUrl: "/images/examples/before/person.jpg",
    afterUrl: "/images/examples/after/person.png",
  },
  {
    id: "butterfly",
    title: "Nature close-ups",
    context: "Isolate detailed subjects for posters and social content.",
    segment: "Creative",
    beforeUrl: "/images/examples/before/butterfly.jpg",
    afterUrl: "/images/examples/after/butterfly.png",
  },
  {
    id: "fruit",
    title: "Product shots",
    context: "Prepare ecommerce assets with a consistent visual style.",
    segment: "Commerce",
    beforeUrl: "/images/examples/before/fruit.jpg",
    afterUrl: "/images/examples/after/fruit.png",
  },
  {
    id: "shoe",
    title: "Fashion items",
    context: "Create clean catalog cards for footwear and apparel.",
    segment: "Retail",
    beforeUrl: "/images/examples/before/shoe.jpg",
    afterUrl: "/images/examples/after/shoe.png",
  },
  {
    id: "object",
    title: "Marketing visuals",
    context: "Turn busy scenes into crisp assets for ads and docs.",
    segment: "Marketing",
    beforeUrl: "/images/examples/before/object.jpg",
    afterUrl: "/images/examples/after/object.png",
  },
  {
    id: "headphones",
    title: "Tech products",
    context: "Prepare high-contrast product cuts for landing pages.",
    segment: "Electronics",
    beforeUrl: "/images/examples/before/headphones.jpg",
    afterUrl: "/images/examples/after/headphones.png",
  },
  {
    id: "cup",
    title: "Brand mockups",
    context: "Drop products onto any background for campaign visuals.",
    segment: "Brand",
    beforeUrl: "/images/examples/before/cup.jpg",
    afterUrl: "/images/examples/after/cup.png",
  },
];

export default function HeroExamplePanel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % EXAMPLES.length);
    }, 3400);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const active = EXAMPLES[activeIndex] ?? EXAMPLES[0];

  return (
    <div className="flex h-full min-h-[430px] flex-col overflow-hidden rounded-[20px] border border-border bg-card">
      <div className="border-b border-border px-5 py-3">
        <p className="font-display text-lg font-medium tracking-tight">From raw photo to clean asset</p>
      </div>

      <div className="grid min-h-[260px] flex-1 grid-cols-2 border-b border-border">
        <div className="relative h-full overflow-hidden border-r border-border bg-secondary/50">
          {EXAMPLES.map((example, index) => (
            <img
              key={`before-${example.id}`}
              src={example.beforeUrl}
              alt="Before background removal"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                activeIndex === index ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
            />
          ))}
          <span className="absolute bottom-2 left-2 inline-flex rounded-md border border-black/20 bg-black/75 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
            Before
          </span>
        </div>

        <div className="relative h-full overflow-hidden bg-secondary/65">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(45deg, rgba(255,255,255,0.8) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.8) 75%), linear-gradient(45deg, rgba(255,255,255,0.8) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.8) 75%)",
              backgroundSize: "18px 18px",
              backgroundPosition: "0 0, 9px 9px",
            }}
          />
          {EXAMPLES.map((example, index) => (
            <img
              key={`after-${example.id}`}
              src={example.afterUrl}
              alt="After background removal"
              className={cn(
                "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
                activeIndex === index ? "opacity-100" : "opacity-0"
              )}
              loading="lazy"
            />
          ))}
          <span className="absolute bottom-2 right-2 inline-flex rounded-md border border-border bg-card px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground">
            After
          </span>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{active.title}</p>
          <p className="text-xs text-muted-foreground">{active.context}</p>
        </div>
        <span className="inline-flex items-center rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {active.segment}
        </span>
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2" aria-hidden>
          {EXAMPLES.map((example, index) => (
            <span
              key={`dot-${example.id}`}
              className={cn(
                "inline-block h-1.5 rounded-full transition-all duration-500",
                activeIndex === index ? "w-5 bg-foreground" : "w-1.5 bg-border"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Auto rotating examples</p>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

type Example = {
  id: string;
  title: string;
  context: string;
  beforeUrl: string;
  afterUrl: string;
};

const EXAMPLES: Example[] = [
  {
    id: "person-portrait",
    title: "People: portrait cutout",
    context: "For bios, profile cards, and team pages",
    beforeUrl: "/images/examples/before/person.jpg",
    afterUrl: "/images/examples/after/person.png",
  },
  {
    id: "fruit-shot",
    title: "Fruits: catalog cleanup",
    context: "For ecommerce listings and ad creatives",
    beforeUrl: "/images/examples/before/fruit.jpg",
    afterUrl: "/images/examples/after/fruit.png",
  },
  {
    id: "object-shot",
    title: "Objects: product isolation",
    context: "For launch graphics, docs, and marketing comps",
    beforeUrl: "/images/examples/before/object.jpg",
    afterUrl: "/images/examples/after/object.png",
  },
];

export default function BeforeAfterShowcase() {
  const initial = useMemo(
    () =>
      EXAMPLES.reduce<Record<string, number>>((acc, example) => {
        acc[example.id] = 50;
        return acc;
      }, {}),
    []
  );
  const [positions, setPositions] = useState<Record<string, number>>(initial);

  return (
    <section className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-5 px-5 md:px-8">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          Before / after examples
        </Badge>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          See how quickly messy backgrounds become production-ready assets
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {EXAMPLES.map((example) => {
          const position = positions[example.id] ?? 50;

          return (
            <Card key={example.id}>
              <CardHeader>
                <CardTitle>{example.title}</CardTitle>
                <CardDescription>{example.context}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="relative h-56 overflow-hidden rounded-lg border border-border bg-muted">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(255,255,255,0.9) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.9) 75%), linear-gradient(45deg, rgba(255,255,255,0.9) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.9) 75%)",
                      backgroundSize: "22px 22px",
                      backgroundPosition: "0 0, 11px 11px",
                    }}
                  />
                  <img
                    src={example.afterUrl}
                    alt={`${example.title} after background removal`}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                  />
                  <img
                    src={example.beforeUrl}
                    alt={`${example.title} before background removal`}
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
                    loading="lazy"
                  />

                  <div
                    className="absolute inset-y-0 w-0.5 bg-background"
                    style={{ left: `${position}%` }}
                  >
                    <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background shadow-sm" />
                  </div>

                  <Badge className="absolute left-2 top-2">Before</Badge>
                  <Badge variant="secondary" className="absolute right-2 top-2">
                    After
                  </Badge>
                </div>

                <Slider
                  value={[position]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(value) => {
                    setPositions((prev) => ({
                      ...prev,
                      [example.id]: value[0] ?? 50,
                    }));
                  }}
                  aria-label={`${example.title} comparison slider`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

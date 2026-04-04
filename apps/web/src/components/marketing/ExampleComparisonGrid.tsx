"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { Example } from "./example-gallery";

type ExampleComparisonGridProps = {
  examples: Example[];
};

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export default function ExampleComparisonGrid({ examples }: ExampleComparisonGridProps) {
  const initial = useMemo(
    () =>
      examples.reduce<Record<string, number>>((acc, example) => {
        acc[example.id] = 50;
        return acc;
      }, {}),
    [examples]
  );
  const [positions, setPositions] = useState<Record<string, number>>(initial);

  function setPosition(exampleId: string, value: number) {
    const nextValue = clamp(value);
    setPositions((prev) => ({
      ...prev,
      [exampleId]: nextValue,
    }));
  }

  function setPositionFromPointer(exampleId: string, clientX: number, element: HTMLDivElement) {
    const rect = element.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setPosition(exampleId, percent);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {examples.map((example) => {
        const position = positions[example.id] ?? 50;

        return (
          <Card key={example.id} className="bg-card/95">
            <CardHeader>
              <CardTitle>{example.title}</CardTitle>
              <CardDescription>{example.context}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="relative h-56 overflow-hidden rounded-xl border border-border bg-secondary/60">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, rgba(255,255,255,0.8) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.8) 75%), linear-gradient(45deg, rgba(255,255,255,0.8) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.8) 75%)",
                    backgroundSize: "18px 18px",
                    backgroundPosition: "0 0, 9px 9px",
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
                  role="slider"
                  tabIndex={0}
                  aria-label={`${example.title} comparison slider`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(position)}
                  className="absolute inset-0 z-20 cursor-col-resize touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
                  onPointerDown={(event) => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setPositionFromPointer(example.id, event.clientX, event.currentTarget);
                  }}
                  onPointerMove={(event) => {
                    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                      return;
                    }
                    setPositionFromPointer(example.id, event.clientX, event.currentTarget);
                  }}
                  onPointerUp={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                  }}
                  onPointerCancel={(event) => {
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                      event.currentTarget.releasePointerCapture(event.pointerId);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowLeft") {
                      event.preventDefault();
                      setPosition(example.id, position - 2);
                      return;
                    }
                    if (event.key === "ArrowRight") {
                      event.preventDefault();
                      setPosition(example.id, position + 2);
                      return;
                    }
                    if (event.key === "Home") {
                      event.preventDefault();
                      setPosition(example.id, 0);
                      return;
                    }
                    if (event.key === "End") {
                      event.preventDefault();
                      setPosition(example.id, 100);
                    }
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-y-0 z-30 w-0.5 bg-card"
                  style={{ left: `${position}%` }}
                >
                  <div className="absolute left-1/2 top-1/2 size-6 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card shadow-sm" />
                </div>

                <Badge className="absolute left-2 top-2 z-30">Before</Badge>
                <Badge variant="secondary" className="absolute right-2 top-2 z-30">
                  After
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function clamp(value: number): number {
  return Math.min(100, Math.max(0, value));
}

export default function QuickstartComparison() {
  const [position, setPosition] = useState(50);

  function updateFromPointer(clientX: number, element: HTMLDivElement) {
    const rect = element.getBoundingClientRect();
    const nextPosition = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(nextPosition));
  }

  return (
    <Card className="bg-card/95">
      <CardHeader>
        <CardTitle>See the result</CardTitle>
        <CardDescription>
          Drag the slider to compare the original photo with the generated PNG.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-secondary/60">
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
            src="/images/examples/after/elon.png"
            alt="Elon image after background removal"
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
          />
          <img
            src="/images/examples/before/elon.webp"
            alt="Elon image before background removal"
            className="absolute inset-0 h-full w-full object-cover"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
            loading="lazy"
          />

          <div
            role="slider"
            tabIndex={0}
            aria-label="Elon comparison slider"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            className="absolute inset-0 z-20 cursor-col-resize touch-none outline-none focus-visible:ring-2 focus-visible:ring-ring/25"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              updateFromPointer(event.clientX, event.currentTarget);
            }}
            onPointerMove={(event) => {
              if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
                return;
              }

              updateFromPointer(event.clientX, event.currentTarget);
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
                setPosition((value) => clamp(value - 2));
                return;
              }

              if (event.key === "ArrowRight") {
                event.preventDefault();
                setPosition((value) => clamp(value + 2));
                return;
              }

              if (event.key === "Home") {
                event.preventDefault();
                setPosition(0);
                return;
              }

              if (event.key === "End") {
                event.preventDefault();
                setPosition(100);
              }
            }}
          />

          <div
            className="pointer-events-none absolute inset-y-0 z-30 w-0.5 bg-card"
            style={{ left: `${position}%` }}
          >
            <div className="absolute left-1/2 top-1/2 size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-card shadow-sm" />
          </div>

          <Badge className="absolute left-3 top-3 z-30">Before</Badge>
          <Badge variant="secondary" className="absolute right-3 top-3 z-30">
            After
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

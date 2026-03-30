"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PlanKind = "app" | "cli" | "both";

type Plan = {
  kind: PlanKind;
  title: string;
  price: string;
  access: string;
  bullets: string[];
  cta: string;
  featured?: boolean;
};

type CheckoutResponse = {
  ok?: boolean;
  url?: string;
  error?: string;
};

const PLANS: Plan[] = [
  {
    kind: "app",
    title: "App",
    price: "$6.99",
    access: "Desktop access",
    bullets: [
      "Desktop visual workflow",
      "Before/after compare controls",
      "Quick setup in the app",
    ],
    cta: "Buy App License",
  },
  {
    kind: "cli",
    title: "CLI",
    price: "$6.99",
    access: "Command-line access",
    bullets: [
      "Batch processing in terminal",
      "Great for repeat workflows",
      "Quick setup in command line",
    ],
    cta: "Buy CLI License",
  },
  {
    kind: "both",
    title: "App + CLI",
    price: "$9.99",
    access: "Desktop + command-line access",
    featured: true,
    bullets: [
      "Desktop + terminal workflows",
      "Best value for frequent shippers",
      "Best for mixed visual + batch workflows",
    ],
    cta: "Buy App + CLI Bundle",
  },
];

export default function PricingClient() {
  const [busyKind, setBusyKind] = useState<PlanKind | null>(null);
  const [message, setMessage] = useState("");

  async function startCheckout(kind: PlanKind) {
    setBusyKind(kind);
    setMessage("");

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind }),
      });

      const data = (await response.json()) as CheckoutResponse;
      if (!response.ok || !data?.ok || !data?.url) {
        throw new Error(data?.error || "Failed to start checkout");
      }

      window.location.href = data.url;
    } catch (error: unknown) {
      const messageText = error instanceof Error ? error.message : "Checkout failed";
      setMessage(messageText);
      setBusyKind(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.kind}
            className={plan.featured ? "border-black" : ""}
          >
            <CardHeader>
              {plan.featured ? <Badge className="w-fit">Best value</Badge> : null}
              <CardTitle>{plan.title}</CardTitle>
              <CardDescription>{plan.access}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <p className="font-display text-4xl font-medium tracking-tight">{plan.price}</p>
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                {plan.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="bg-secondary/45">
              <Button
                className="w-full"
                onClick={() => startCheckout(plan.kind)}
                disabled={busyKind === plan.kind}
                type="button"
              >
                {busyKind === plan.kind ? "Opening checkout..." : plan.cta}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle>Workflow comparison</CardTitle>
          <CardDescription>Quick plan matrix for App, CLI, and Bundle.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>App</TableHead>
                <TableHead>CLI</TableHead>
                <TableHead>App + CLI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>One-time price</TableCell>
                <TableCell>$6.99</TableCell>
                <TableCell>$6.99</TableCell>
                <TableCell>$9.99</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Access included</TableCell>
                <TableCell>Desktop</TableCell>
                <TableCell>Command line</TableCell>
                <TableCell>Desktop + command line</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Desktop processing</TableCell>
                <TableCell>Yes (App workflow)</TableCell>
                <TableCell>No</TableCell>
                <TableCell>Yes (bundle workflow)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Automation pipeline</TableCell>
                <TableCell>Limited</TableCell>
                <TableCell>Strong</TableCell>
                <TableCell>Strong</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {message ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

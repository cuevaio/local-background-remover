import { CheckCircle2Icon, LockIcon, WifiOffIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const TRUST_ITEMS = [
  {
    label: "Local processing",
    detail: "Your files stay on-device during background removal.",
    Icon: LockIcon,
  },
  {
    label: "Works with spotty internet",
    detail: "Keep processing even if your connection drops.",
    Icon: WifiOffIcon,
  },
  {
    label: "One-time purchase",
    detail: "No monthly subscription required for core usage.",
    Icon: CheckCircle2Icon,
  },
];

export default function ProofStrip() {
  return (
    <section className="section-block section-divider">
      <div className="grid gap-3 md:grid-cols-3">
        {TRUST_ITEMS.map(({ label, detail, Icon }) => (
          <Card key={label} className="bg-card/95">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="mt-0.5 rounded-lg border border-border bg-secondary p-2 text-foreground">
                <Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className="w-fit bg-card">
                  {label}
                </Badge>
                <p className="text-sm text-muted-foreground">{detail}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

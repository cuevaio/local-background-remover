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
    label: "Offline after activation",
    detail: "Continue working without a network after keys are validated.",
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
    <section className="mx-auto w-full max-w-6xl px-5 md:px-8">
      <div className="grid gap-3 md:grid-cols-3">
        {TRUST_ITEMS.map(({ label, detail, Icon }) => (
          <Card key={label} className="bg-card/85 backdrop-blur-sm">
            <CardContent className="flex items-start gap-3 pt-4">
              <div className="mt-0.5 rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="size-4" />
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="secondary" className="w-fit">
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

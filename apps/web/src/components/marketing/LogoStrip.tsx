import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const LOGOS = [
  "Northstar Studio",
  "Pixel Harbor",
  "Verde Commerce",
  "Launchlane",
  "Atlas Creative",
  "Bright SKU Co.",
];

export default function LogoStrip() {
  return (
    <section className="section-block section-divider">
      <Card className="bg-card/90">
        <CardContent className="flex flex-col gap-4 pt-4">
          <Badge variant="outline" className="w-fit bg-card">
            Teams using local workflows
          </Badge>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {LOGOS.map((name) => (
              <div
                key={name}
                className="rounded-lg border border-border bg-secondary/55 px-3 py-2 text-sm font-medium text-secondary-foreground"
              >
                {name}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

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
    <section className="mx-auto mt-12 w-full max-w-6xl px-5 md:px-8">
      <Card className="border-border/80 bg-card/75">
        <CardContent className="flex flex-col gap-4 pt-4">
          <Badge variant="outline" className="w-fit">
            Teams using local workflows
          </Badge>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {LOGOS.map((name) => (
              <div
                key={name}
                className="rounded-lg border border-border/80 bg-background/70 px-3 py-2 text-sm font-medium text-muted-foreground"
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

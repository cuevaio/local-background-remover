import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { HomePageCopy } from "@/content/home/heading-copy";

type InputOptionsSectionProps = {
  copy: HomePageCopy["inputOptions"];
};

export default function InputOptionsSection({ copy }: InputOptionsSectionProps) {
  return (
    <section className="section-block section-divider">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="w-fit bg-card">
              {copy.badge}
            </Badge>
            <h2 className="section-title">{copy.title}</h2>
            <p className="section-copy max-w-2xl md:text-lg md:leading-7">{copy.description}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {copy.options.map((option) => (
              <Card key={option.title} className="h-full bg-card/95">
                <CardHeader className="gap-3">
                  <Badge variant="outline" className="w-fit bg-secondary/70 text-[11px]">
                    {option.eyebrow}
                  </Badge>
                  <div className="space-y-2">
                    <CardTitle className="text-lg">{option.title}</CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {option.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

          <Card className="overflow-hidden bg-card/95">
            <CardHeader className="border-b border-border bg-secondary/35">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl">{copy.mediaCardTitle}</CardTitle>
                  <CardDescription className="max-w-md text-sm leading-6">
                    {copy.mediaCardDescription}
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground">{copy.mediaBadge}</Badge>
              </div>
            </CardHeader>
          <CardContent className="p-0">
            <img
              src="/app-input-options.gif"
              alt="Desktop app showing file selection from disk, URL import, before and after comparison, gallery navigation, and clipboard copy actions."
              className="block h-auto w-full"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

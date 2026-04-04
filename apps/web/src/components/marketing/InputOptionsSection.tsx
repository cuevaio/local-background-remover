import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type InputOption = {
  title: string;
  eyebrow: string;
  description: string;
};

const INPUT_OPTIONS: InputOption[] = [
  {
    title: "Choose a source",
    eyebrow: "File / URL / Cmd+V",
    description:
      "Select a file from disk, read an image from a URL, or press Cmd+V to paste an image straight into the app.",
  },
  {
    title: "Auto-remove on import",
    eyebrow: "1.2 to 1.5s",
    description:
      "When an image is selected, background removal starts automatically and usually finishes in about 1.2 to 1.5 seconds per image.",
  },
  {
    title: "Move through earlier results",
    eyebrow: "Gallery history",
    description:
      "Navigate previous images in the gallery to review older cutouts without re-importing them.",
  },
  {
    title: "Copy into the next tool",
    eyebrow: "Cmd+C",
    description:
      "Press Cmd+C in the app and the selected processed image is copied to the clipboard, ready for Canva, Photoshop, Illustrator, WhatsApp, and more.",
  },
];

export default function InputOptionsSection() {
  return (
    <section className="section-block section-divider">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Badge variant="outline" className="w-fit bg-card">
              Desktop app workflow
            </Badge>
            <h2 className="section-title">Start from a file, a URL, or your clipboard</h2>
            <p className="section-copy max-w-2xl md:text-lg md:leading-7">
              In the macOS app, you can select a file from disk, paste an image URL,
              or use Cmd+V to drop an image from your clipboard. As soon as an image
              is added, background removal starts automatically, usually taking about
              1.2 to 1.5 seconds per image. You can move through previous images in the
              gallery, then press Cmd+C to copy the selected result into Canva,
              Photoshop, Illustrator, WhatsApp, and similar tools.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {INPUT_OPTIONS.map((option) => (
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
                <CardTitle className="text-xl">Input options in action</CardTitle>
                <CardDescription className="max-w-md text-sm leading-6">
                  See the local desktop flow: import, process automatically, browse the
                  gallery, and copy the selected cutout onward.
                </CardDescription>
              </div>
              <Badge className="bg-primary text-primary-foreground">Local-first app</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <img
              src="/images/input-options.gif"
              alt="Desktop app showing file selection from disk, URL import, before and after comparison, gallery navigation, and clipboard copy actions."
              className="block h-auto w-full"
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type ChatExample = {
  tool: string;
  prompt: string;
  result: string;
};

const CHAT_EXAMPLES: ChatExample[] = [
  {
    tool: "Claude Code",
    prompt:
      "Watch assets/incoming and run background removal for each new image. Put output in assets/clean.",
    result:
      "Created watcher script + CLI command chain. New files now auto-process with local runtime.",
  },
  {
    tool: "OpenCode",
    prompt:
      "Batch remove backgrounds for 400 product photos, keep transparent PNGs, and generate a QA report.",
    result:
      "Generated batch command + validation pass with success/failure summary and retry list.",
  },
  {
    tool: "Cursor",
    prompt:
      "Build a release script that strips backgrounds for marketing shots before deploy previews.",
    result:
      "Added npm script hooks to call CLI in CI and attach cleaned assets to preview artifacts.",
  },
];

export default function AutomationChats() {
  return (
    <section className="mx-auto mt-14 flex w-full max-w-6xl flex-col gap-5 px-5 md:px-8">
      <div className="flex flex-col gap-2">
        <Badge variant="secondary" className="w-fit">
          CLI + coding agents
        </Badge>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Automate background removal in Claude Code, OpenCode, Cursor, and similar tools
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CHAT_EXAMPLES.map((example) => (
          <Card key={example.tool} className="border-primary/20">
            <CardHeader>
              <CardTitle>{example.tool}</CardTitle>
              <CardDescription>Example prompt + automation output</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-muted/35 p-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prompt
                </p>
                <p className="text-foreground">{example.prompt}</p>
              </div>
              <div className="rounded-lg border border-primary/25 bg-primary/10 p-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  Result
                </p>
                <p>{example.result}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

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
    <section className="section-block section-divider flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-card">
          CLI + coding agents
        </Badge>
        <h2 className="section-title">
          Automate background removal in Claude Code, OpenCode, Cursor, and similar tools
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {CHAT_EXAMPLES.map((example) => (
          <Card key={example.tool} className="bg-card/95">
            <CardHeader>
              <CardTitle>{example.tool}</CardTitle>
              <CardDescription>Example prompt + automation output</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-secondary/45 p-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prompt
                </p>
                <p className="text-foreground">{example.prompt}</p>
              </div>
              <div className="rounded-lg border border-success/25 bg-success-soft p-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-success">
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

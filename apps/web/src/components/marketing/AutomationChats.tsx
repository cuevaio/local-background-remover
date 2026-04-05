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
  imageSrc: string;
  imageAlt: string;
};

const AGENT_PROMPT = [
  "remove the background of the images in /raw_images and put them in /images",
  "",
  "use the installed `rmbg` cli tool",
].join("\n");

const CHAT_EXAMPLES: ChatExample[] = [
  {
    tool: "Claude Code",
    imageSrc: "/cli-claude.gif",
    imageAlt:
      "Claude Code using the rmbg CLI to remove backgrounds from images in /raw_images and save results to /images.",
  },
  {
    tool: "OpenCode",
    imageSrc: "/cli-opencode.gif",
    imageAlt:
      "OpenCode using the rmbg CLI to remove backgrounds from images in /raw_images and save results to /images.",
  },
];

export default function AutomationChats() {
  return (
    <section className="section-block section-divider flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-card">
          Using with agents
        </Badge>
        <h2 className="section-title">
          Agent-friendly CLI for Claude Code and OpenCode
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
          The <code>rmbg</code> CLI is easy for coding agents to work with. Agents can understand
          folder structure quickly, run repeatable commands, and automate background removal across
          multiple images, folders, and larger batch workflows while keeping everything local.
          Average execution is about 1.2 - 1.5 seconds per image.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CHAT_EXAMPLES.map((example) => (
          <Card key={example.tool} className="bg-card/95">
            <CardHeader>
              <CardTitle>{example.tool}</CardTitle>
              <CardDescription>Same prompt, local CLI execution</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="rounded-lg border border-border bg-secondary/45 p-3 text-sm">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Prompt
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-foreground">
                  {AGENT_PROMPT}
                </pre>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-secondary/35">
                <img
                  src={example.imageSrc}
                  alt={example.imageAlt}
                  className="block h-auto w-full"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

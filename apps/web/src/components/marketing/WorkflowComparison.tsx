import ExpLink from "@/components/experiments/ExpLink";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Workflow = {
  key: "app" | "cli" | "both";
  name: string;
  summary: string;
  badge?: string;
  bullets: string[];
  cta: string;
};

const WORKFLOWS: Workflow[] = [
  {
    key: "app",
    name: "Desktop App",
    summary: "Best for most people who want a simple Mac app for product photos, portraits, and quick edits.",
    bullets: [
      "Simple app workflow on your Mac",
      "Great for visual checks before export",
      "Best choice for everyday image cleanup",
    ],
    cta: "See App plan",
  },
  {
    key: "cli",
    name: "CLI",
    summary: "For developers who want scripts, batches, and coding-agent automation.",
    bullets: [
      "Runs from the command line",
      "Great for repeat batches and scripts",
      "Works well with coding agents",
    ],
    cta: "See CLI plan",
  },
  {
    key: "both",
    name: "App + CLI",
    summary: "For teams or power users who want both a simple app and command-line automation.",
    badge: "Best value",
    bullets: [
      "Includes the app and the CLI",
      "Useful when you want visual checks plus batch jobs",
      "Best if you know you will use both",
    ],
    cta: "See Bundle",
  },
];

export default function WorkflowComparison() {
  return (
    <Tabs defaultValue="app" className="w-full">
      <TabsList className="w-full justify-start md:w-fit">
        {WORKFLOWS.map((workflow) => (
          <TabsTrigger key={workflow.key} value={workflow.key}>
            {workflow.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {WORKFLOWS.map((workflow) => (
        <TabsContent key={workflow.key} value={workflow.key}>
          <Card className="bg-card/95">
            <CardHeader>
              {workflow.badge ? <Badge className="w-fit">{workflow.badge}</Badge> : null}
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription>{workflow.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="ml-5 list-disc space-y-1 text-sm text-muted-foreground">
                {workflow.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="justify-end bg-secondary/45">
              <Button asChild size="sm">
                <ExpLink href="/pricing">{workflow.cta}</ExpLink>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

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
    summary: "For solo designers who want fast visual polish before export.",
    bullets: [
      "Includes desktop access",
      "Drag-and-drop workflow",
      "Great for final QA",
    ],
    cta: "Choose App plan",
  },
  {
    key: "cli",
    name: "CLI",
    summary: "For indie hackers shipping repeatable image batches.",
    bullets: [
      "Includes command-line access",
      "Batch through terminal",
      "Fits scripts, automations, and coding agents",
    ],
    cta: "Choose CLI plan",
  },
  {
    key: "both",
    name: "App + CLI",
    summary: "For builders who automate in CLI and review in app before publishing.",
    badge: "Best value",
    bullets: [
      "Includes desktop + command-line access",
      "Best when you want both visual and batch workflows",
      "Best for frequent shipping",
    ],
    cta: "Choose Bundle",
  },
];

export default function WorkflowComparison() {
  return (
    <Tabs defaultValue="both" className="w-full">
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

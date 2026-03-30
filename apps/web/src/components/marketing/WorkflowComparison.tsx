import Link from "next/link";

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
    summary: "For teams that want visual previews and manual quality checks.",
    bullets: [
      "One App key",
      "Drag-and-drop workflow",
      "Great for review-heavy projects",
    ],
    cta: "Choose App plan",
  },
  {
    key: "cli",
    name: "CLI",
    summary: "For automation, scripts, and repeatable production batches.",
    bullets: [
      "One CLI key",
      "Batch through terminal",
      "Fits CI and asset pipelines",
    ],
    cta: "Choose CLI plan",
  },
  {
    key: "both",
    name: "App + CLI",
    summary: "For mixed teams that automate then review before publishing.",
    badge: "Best value",
    bullets: [
      "Two keys (App + CLI)",
      "Desktop processing when both keys are active",
      "Best for daily shipping workflows",
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
          <Card className="border-primary/20 bg-card/90 shadow-sm">
            <CardHeader>
              {workflow.badge ? <Badge className="w-fit">{workflow.badge}</Badge> : null}
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription>{workflow.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="ml-5 list-disc text-sm text-muted-foreground">
                {workflow.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/pricing">{workflow.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}

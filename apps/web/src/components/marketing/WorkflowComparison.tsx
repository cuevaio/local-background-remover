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
import type { HomePageCopy } from "@/content/home/heading-copy";

type WorkflowComparisonProps = {
  copy: HomePageCopy["workflowComparison"];
};

export default function WorkflowComparison({ copy }: WorkflowComparisonProps) {
  return (
    <Tabs defaultValue="app" className="w-full">
      <TabsList className="w-full justify-start md:w-fit">
        {copy.workflows.map((workflow) => (
          <TabsTrigger key={workflow.key} value={workflow.key}>
            {workflow.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {copy.workflows.map((workflow) => (
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

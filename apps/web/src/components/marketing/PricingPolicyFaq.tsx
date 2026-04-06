import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HomePageCopy } from "@/content/home/heading-copy";

const DEFAULT_COPY: HomePageCopy["pricingFaq"] = {
  sectionTitle: "Questions before checkout",
  purchaseBadge: "Purchase confidence",
  purchaseTitle: "Clear purchase terms",
  purchaseAlerts: [
    {
      title: "One-time purchase",
      description: "No recurring subscription for core usage.",
    },
    {
      title: "Flexible workflow choices",
      description: "Choose the app, the CLI, or both based on how simple or automated you want your workflow to be.",
    },
    {
      title: "Reliable in day-to-day use",
      description: "Keep processing without needing a constant internet connection.",
    },
  ],
  faqTitle: "Frequently asked questions",
  faqs: [
    {
      question: "Are downloads public?",
      answer: "Yes. You can install anytime. Most buyers should choose a plan first, then come back here for install steps.",
    },
    {
      question: "What does App + CLI include?",
      answer: "The bundle includes the Mac app plus the CLI in one purchase.",
    },
    {
      question: "Can I keep working offline?",
      answer: "Yes. After activation, you can keep processing even when your internet is unstable.",
    },
    {
      question: "Can I start with one plan and upgrade later?",
      answer: "Yes. Start with the app or the CLI, then add the other later if you need both.",
    },
  ],
};

type PricingPolicyFaqProps = {
  copy?: HomePageCopy["pricingFaq"];
};

export default function PricingPolicyFaq({ copy }: PricingPolicyFaqProps) {
  const resolvedCopy = copy ?? DEFAULT_COPY;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      <Card className="bg-card/95">
        <CardHeader>
          <Badge variant="outline" className="w-fit bg-card">
            {resolvedCopy.purchaseBadge}
          </Badge>
          <CardTitle>{resolvedCopy.purchaseTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {resolvedCopy.purchaseAlerts.map((alert) => (
            <Alert key={alert.title}>
              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle>{resolvedCopy.faqTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {resolvedCopy.faqs.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>
                  <p>{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FaqItem = {
  question: string;
  answer: string;
};

const FAQS: FaqItem[] = [
  {
    question: "Are downloads public?",
    answer:
      "Yes. Anyone can download. Paid features unlock after activation.",
  },
  {
    question: "What does App + CLI include?",
    answer:
      "The bundle includes desktop access and command-line access in one purchase.",
  },
  {
    question: "Can I keep working offline?",
    answer:
      "Yes. After activation, you can keep processing even when your internet is unstable.",
  },
  {
    question: "Can I start with one plan and upgrade later?",
    answer:
      "Yes. Start with desktop or command-line, then add the other later if you need both.",
  },
];

export default function PricingPolicyFaq() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      <Card className="bg-card/95">
        <CardHeader>
          <Badge variant="outline" className="w-fit bg-card">
            Purchase confidence
          </Badge>
          <CardTitle>Clear purchase terms</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert>
            <AlertTitle>One-time purchase</AlertTitle>
            <AlertDescription>No recurring subscription for core usage.</AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>Flexible workflow choices</AlertTitle>
            <AlertDescription>Choose desktop, command-line, or both based on how you work.</AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>Reliable in day-to-day use</AlertTitle>
            <AlertDescription>Keep processing without needing a constant internet connection.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card className="bg-card/95">
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible>
            {FAQS.map((item) => (
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

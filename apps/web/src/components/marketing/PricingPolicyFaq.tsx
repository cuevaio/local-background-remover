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
      "Yes. Installers are public. Runtime features unlock only after activating a valid key for each surface you use.",
  },
  {
    question: "What does App + CLI include?",
    answer:
      "The bundle includes two keys, one for the app and one for the CLI. Desktop processing requires both active keys.",
  },
  {
    question: "Can I keep working offline?",
    answer:
      "Yes. After activation, usage remains available offline within the product's active and grace windows.",
  },
  {
    question: "Can I start with one plan and upgrade later?",
    answer:
      "Yes. You can buy the surface you need now and add the other later to complete the full workflow.",
  },
];

export default function PricingPolicyFaq() {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      <Card>
        <CardHeader>
          <Badge variant="secondary" className="w-fit">
            Purchase confidence
          </Badge>
          <CardTitle>Clear policy and activation expectations</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Alert>
            <AlertTitle>One-time purchase</AlertTitle>
            <AlertDescription>No recurring subscription for core usage.</AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>Surface-based licensing</AlertTitle>
            <AlertDescription>App and CLI are separate entitlements with separate keys.</AlertDescription>
          </Alert>
          <Alert>
            <AlertTitle>Offline operation after activation</AlertTitle>
            <AlertDescription>Keep processing without continuous internet access.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
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

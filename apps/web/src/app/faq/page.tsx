import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buildPageMetadata } from "@/lib/seo";

const FAQ_ITEMS = [
  {
    q: "Do I need to pay before downloading?",
    a: "No. Downloads are public. Payment is required when you want to activate runtime features in desktop or CLI.",
  },
  {
    q: "Why do App + CLI purchases include two keys?",
    a: "Desktop and CLI are separate entitlements. App key unlocks desktop, CLI key unlocks terminal commands.",
  },
  {
    q: "Can I process images offline?",
    a: "Yes. After activation, processing uses local model files so normal usage can continue offline.",
  },
  {
    q: "Where is the model stored?",
    a: "By default it is stored at ~/.cache/background-removal/models/birefnet unless you override BIREFNET_MODEL_DIR.",
  },
  {
    q: "Who is behind this product?",
    a: "Local Background Remover is an indie product built by Anthony through cueva.io.",
  },
  {
    q: "Where can I ask a support question?",
    a: "Use the contact page and social channels. I read support messages directly.",
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "FAQ",
  description:
    "Frequently asked questions about downloads, activation, offline usage, and support for Local Background Remover.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <main className="site-frame pb-28">
      <section className="section-block flex flex-col gap-5">
        <Badge variant="outline" className="w-fit bg-card">
          Frequently asked questions
        </Badge>
        <h1 className="display-title md:text-5xl">Answers before you buy</h1>
        <p className="section-copy md:text-lg">
          Quick answers for setup, pricing structure, and how local processing works in desktop and
          CLI workflows.
        </p>
      </section>

      <section className="section-block section-divider">
        <Accordion type="single" collapsible>
          {FAQ_ITEMS.map((item) => (
            <AccordionItem key={item.q} value={item.q}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>
                <p>{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="section-block section-divider flex flex-wrap items-center gap-2">
        <Button asChild>
          <Link href="/downloads">Open downloads</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/pricing">View pricing</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact cueva.io</Link>
        </Button>
      </section>
    </main>
  );
}

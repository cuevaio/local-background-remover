import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buildPageMetadata } from "@/lib/seo";

const FAQ_ITEMS = [
  {
    q: "Do I need to pay before downloading?",
    a: "No. You can download first. Payment is required before processing images.",
  },
  {
    q: "Why do App + CLI purchases include two keys?",
    a: "The bundle includes desktop access and command-line access so you can use both workflows.",
  },
  {
    q: "Can I process images offline?",
    a: "Yes. After activation, processing runs locally so you can keep working if your internet is unstable.",
  },
  {
    q: "Where is the model stored?",
    a: "The app manages this automatically. Advanced path settings are available in the CLI docs if you need them.",
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
    "Frequently asked questions about downloads, pricing, offline usage, and support for Local Background Remover.",
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

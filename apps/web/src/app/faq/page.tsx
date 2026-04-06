import type { Metadata } from "next";
import Script from "next/script";

import ExpLink from "@/components/experiments/ExpLink";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

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
  title: "Background Remover FAQ",
  description:
    "Frequently asked questions about pricing, offline use, downloads, and support for Local Background Remover.",
  path: "/faq",
});

export default function FaqPage() {
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://local.backgroundrm.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "FAQ",
        item: "https://local.backgroundrm.com/faq",
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <Script id="faq-breadcrumb-jsonld" type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <Script id="faq-page-jsonld" type="application/ld+json">
        {serializeJsonLd(faqJsonLd)}
      </Script>

      <main className="site-frame pb-28">
        <section className="section-block flex flex-col gap-5">
          <Badge variant="outline" className="w-fit bg-card">
            Frequently asked questions
          </Badge>
          <h1 className="display-title md:text-5xl">Answers before you buy</h1>
          <p className="section-copy md:text-lg">
            Quick answers about plans, offline use, downloads, privacy, and when the CLI actually matters.
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
            <ExpLink href="/pricing">View pricing</ExpLink>
          </Button>
          <Button asChild variant="outline">
            <ExpLink href="/downloads">Install anytime</ExpLink>
          </Button>
          <Button asChild variant="outline">
            <ExpLink href="/contact">Contact cueva.io</ExpLink>
          </Button>
        </section>
      </main>
    </>
  );
}

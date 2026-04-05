import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import { ArrowRightIcon, ShieldCheckIcon, SparklesIcon, TerminalIcon } from "lucide-react";

import ExpLink from "@/components/experiments/ExpLink";
import StickyCta from "@/components/marketing/StickyCta";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { COMPARE_SLUGS, getComparePageBySlug } from "@/content/compare-pages";
import { LANDING_TESTIMONIALS } from "@/content/testimonials";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

type ComparePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const DOT_GRID_STYLE: CSSProperties = {
  backgroundImage: "radial-gradient(circle at center, rgb(212 212 212 / 0.78) 1px, transparent 1.2px)",
  backgroundSize: "12px 12px",
};

function getCompareTestimonials(slug: string) {
  const start = [...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % LANDING_TESTIMONIALS.length;

  return [0, 1, 2].map((offset) => LANDING_TESTIMONIALS[(start + offset) % LANDING_TESTIMONIALS.length]);
}

export function generateStaticParams() {
  return COMPARE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const comparePage = getComparePageBySlug(slug);

  if (!comparePage) {
    return buildPageMetadata({
      title: "Comparison Not Found",
      description: "This comparison page does not exist.",
      path: `/compare/${slug}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: comparePage.seoTitle,
    description: comparePage.seoDescription,
    path: `/compare/${comparePage.slug}`,
  });
}

export default async function CompareDetailPage({ params }: ComparePageProps) {
  const { slug } = await params;
  const comparePage = getComparePageBySlug(slug);

  if (!comparePage) {
    notFound();
  }

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
        name: "Compare",
        item: "https://local.backgroundrm.com/compare",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: comparePage.competitorName,
        item: `https://local.backgroundrm.com/compare/${comparePage.slug}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: comparePage.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  const compareTestimonials = getCompareTestimonials(comparePage.slug);

  return (
    <>
      <Script id={`compare-${comparePage.slug}-breadcrumb-jsonld`} type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <Script id={`compare-${comparePage.slug}-faq-jsonld`} type="application/ld+json">
        {serializeJsonLd(faqJsonLd)}
      </Script>

      <main className="site-frame">
        <section className="section-block relative overflow-hidden border-b border-border bg-gradient-to-br from-background via-background to-secondary/30">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 88% 8%, rgb(23 23 23 / 10%), transparent 48%), radial-gradient(circle at 4% 90%, rgb(82 82 82 / 10%), transparent 54%)",
            }}
          />

          <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="w-fit bg-card">
                  {comparePage.eyebrow}
                </Badge>
                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
                  <ExpLink href="/compare">All comparisons</ExpLink>
                </Button>
              </div>
              <h1 className="display-title md:text-5xl">{comparePage.heroTitle}</h1>
              <p className="section-copy md:text-lg">{comparePage.heroDescription}</p>

              <div className="flex flex-wrap items-center gap-2">
                {comparePage.heroHighlights.map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild>
                  <ExpLink href="/downloads">Download Local</ExpLink>
                </Button>
                <Button asChild variant="outline">
                  <ExpLink href="/pricing">See one-time pricing</ExpLink>
                </Button>
                <Button asChild variant="ghost">
                  <Link href={comparePage.competitorUrl} target="_blank" rel="noreferrer">
                    {`Visit ${comparePage.competitorName}`}
                  </Link>
                </Button>
              </div>
            </div>

            <Card className="border-border bg-card/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <SparklesIcon className="size-4 text-foreground" />
                  Quick decision snapshot
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <ShieldCheckIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p>
                    Local usually wins when privacy and reliable on-device processing are
                    non-negotiable.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <TerminalIcon className="mt-0.5 size-4 shrink-0 text-foreground" />
                  <p>
                    You get clear desktop and command-line options for repeatable weekly shipping.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRightIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <p>
                    Prefer browser-first editing and hosted collaboration? {comparePage.competitorName} can remain a practical option.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="section-block section-divider grid gap-4 md:grid-cols-2">
          <Card className="border-border bg-secondary/55">
            <CardHeader>
              <CardTitle>Local works best for</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {comparePage.localBestFor.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[7px] inline-block size-1.5 rounded-full bg-foreground" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/95">
            <CardHeader>
              <CardTitle>{`${comparePage.competitorName} works best for`}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {comparePage.competitorBestFor.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-[7px] inline-block size-1.5 rounded-full bg-slate-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="section-block section-divider">
          <div className="relative overflow-hidden rounded-[20px] border border-border bg-card px-6 py-12 md:px-12 md:py-16">
            <div aria-hidden className="pointer-events-none absolute inset-0" style={DOT_GRID_STYLE} />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/75 via-background/52 to-background/76"
            />

            <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-5">
              <Badge variant="outline" className="w-fit bg-card">
                Why makers switch
              </Badge>

              <blockquote className="space-y-6 text-balance font-display text-[clamp(1.9rem,4.2vw,3.35rem)] leading-[1.13] tracking-tight">
                <p>“{comparePage.switchQuote.quote}”</p>

                <p className="text-[0.78em] text-foreground">
                  Local is stronger when you value <span className="text-warning">private execution</span>,{" "}
                  <span className="text-success">repeatable batch processing</span>, and{" "}
                  <span className="text-info">one-time ownership</span>.
                </p>

                <p className="text-[0.75em] text-muted-foreground">{comparePage.switchQuote.source}</p>
              </blockquote>
            </div>
          </div>
        </section>

        <section className="section-block section-divider flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Badge variant="outline" className="w-fit bg-card">
              Indie proof
            </Badge>
            <h2 className="section-title md:text-4xl">Makers shipping real work</h2>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              Stories from indie customers using Local in real creative workflows.
            </p>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-border bg-border">
            <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-3">
              {compareTestimonials.map((item) => (
                <article
                  key={item.id}
                  className="flex min-h-[245px] flex-col justify-between gap-6 bg-card p-6"
                >
                  <div className="flex flex-col gap-3">
                    <span className="inline-flex w-fit items-center rounded-md border border-border bg-secondary px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {item.workflow}
                    </span>
                    <p className="text-pretty text-lg leading-[1.4] text-foreground">“{item.quote}”</p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.avatarUrl}
                        alt={`${item.author} avatar`}
                        className="size-11 rounded-lg border border-border object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.author}</p>
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      </div>
                    </div>
                    <p className="text-right text-xs text-muted-foreground">{item.company}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block section-divider flex flex-col gap-4">
          <h2 className="section-title md:text-4xl">Quick side-by-side</h2>
          <p className="max-w-3xl text-sm text-muted-foreground md:text-base">
            Practical product-fit view, not a universal ranking. Local is highlighted where privacy,
            repeatability, and one-time pricing matter most.
          </p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                <TableHead>Local Background Remover</TableHead>
                <TableHead>{comparePage.competitorName}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comparePage.comparisonRows.map((row) => (
                <TableRow key={row.feature}>
                  <TableCell className="font-medium">{row.feature}</TableCell>
                  <TableCell className="bg-secondary/65 align-top">{row.local}</TableCell>
                  <TableCell className="bg-secondary/55 align-top">{row.competitor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section className="section-block section-divider grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="space-y-4">
            <h2 className="section-title md:text-4xl">Common decision questions</h2>
            <Accordion type="single" collapsible>
              {comparePage.faqs.map((item, index) => (
                <AccordionItem key={item.question} value={`faq-${index}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <Alert className="self-start border-border bg-secondary/55">
            <AlertTitle>Comparison transparency</AlertTitle>
            <AlertDescription>
              <p>
                This page references publicly available product pages reviewed on {" "}
                {comparePage.lastReviewedAt}. Product names and trademarks belong to their
                respective owners.
              </p>
              <p>
                Sources:{" "}
                {comparePage.sources.map((source, index) => (
                  <span key={source}>
                    <Link href={source} target="_blank" rel="noreferrer">
                      {`Source ${index + 1}`}
                    </Link>
                    {index === comparePage.sources.length - 1 ? "" : ", "}
                  </span>
                ))}
              </p>
            </AlertDescription>
          </Alert>
        </section>
      </main>

      <StickyCta
        title="Ready to ship local?"
        description="Install now and process images privately."
        primaryLabel="Open downloads"
        primaryHref="/downloads"
        secondaryLabel="View pricing"
        secondaryHref="/pricing"
      />
    </>
  );
}

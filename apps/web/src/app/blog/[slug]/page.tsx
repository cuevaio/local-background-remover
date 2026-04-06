import type { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";

import ExpLink from "@/components/experiments/ExpLink";
import StickyCta from "@/components/marketing/StickyCta";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getBlogPostBySlug, getBlogSlugs } from "@/content/blog";
import { buildPageMetadata, serializeJsonLd } from "@/lib/seo";

type BlogDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return buildPageMetadata({
      title: "Blog Post Not Found",
      description: "This blog post does not exist.",
      path: `/blog/${slug}`,
      noindex: true,
    });
  }

  return buildPageMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const resolvedRelatedPosts = (
    await Promise.all(post.relatedPostSlugs.map((relatedSlug) => getBlogPostBySlug(relatedSlug)))
  ).filter((value): value is NonNullable<typeof value> => Boolean(value));

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
        name: "Blog",
        item: "https://local.backgroundrm.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://local.backgroundrm.com/blog/${post.slug}`,
      },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    url: `https://local.backgroundrm.com/blog/${post.slug}`,
    mainEntityOfPage: `https://local.backgroundrm.com/blog/${post.slug}`,
    keywords: [post.targetKeyword],
    author: {
      "@type": "Person",
      name: "Anthony Cueva",
    },
    publisher: {
      "@type": "Organization",
      name: "cueva.io",
      logo: {
        "@type": "ImageObject",
        url: "https://local.backgroundrm.com/icon.svg",
      },
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: post.faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <Script id={`blog-${post.slug}-breadcrumb-jsonld`} type="application/ld+json">
        {serializeJsonLd(breadcrumbJsonLd)}
      </Script>
      <Script id={`blog-${post.slug}-article-jsonld`} type="application/ld+json">
        {serializeJsonLd(articleJsonLd)}
      </Script>
      {post.faqs.length > 0 ? (
        <Script id={`blog-${post.slug}-faq-jsonld`} type="application/ld+json">
          {serializeJsonLd(faqJsonLd)}
        </Script>
      ) : null}

      <main className="site-frame">
        <section className="section-block flex flex-col gap-6 border-b border-border bg-gradient-to-br from-background via-background to-secondary/30">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="w-fit bg-card">
              {post.eyebrow}
            </Badge>
            <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
              <ExpLink href="/blog">All posts</ExpLink>
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="display-title max-w-4xl md:text-5xl">{post.title}</h1>
            <p className="max-w-3xl text-base text-muted-foreground md:text-lg">{post.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{`Published ${DATE_FORMATTER.format(new Date(post.publishedAt))}`}</span>
            <span className="inline-block size-1 rounded-full bg-border" />
            <span>{`Updated ${DATE_FORMATTER.format(new Date(post.updatedAt))}`}</span>
            <span className="inline-block size-1 rounded-full bg-border" />
            <span>{`Keyword: ${post.targetKeyword}`}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {post.heroHighlights.map((highlight) => (
              <span
                key={highlight}
                className="inline-flex items-center rounded-full border border-border/80 bg-card/90 px-3 py-1 text-xs font-medium text-foreground"
              >
                {highlight}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button asChild>
              <ExpLink href={post.primaryCta.href}>{post.primaryCta.label}</ExpLink>
            </Button>
            <Button asChild variant="outline">
              <ExpLink href={post.secondaryCta.href}>{post.secondaryCta.label}</ExpLink>
            </Button>
          </div>
        </section>

        <section className="section-block section-divider grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="space-y-10">
            <section
              className="text-base leading-7 text-muted-foreground md:text-lg [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-medium [&_h2]:tracking-tight [&_h2]:text-foreground md:[&_h2]:text-4xl [&_p]:mt-4 [&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-3 [&_ul]:pl-6"
              dangerouslySetInnerHTML={{ __html: post.contentHtml }}
            />

            {post.faqs.length > 0 ? (
              <section className="space-y-4">
                <Badge variant="outline" className="w-fit bg-card">
                  FAQ
                </Badge>
                <Accordion type="single" collapsible className="rounded-[20px] border border-border bg-card px-5">
                  {post.faqs.map((item, index) => (
                    <AccordionItem key={item.question} value={`faq-${index}`}>
                      <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                      <AccordionContent className="text-sm leading-6 text-muted-foreground md:text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </section>
            ) : null}
          </article>

          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <Card className="bg-card/95">
              <CardHeader>
                <CardTitle className="text-lg">Keep exploring</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full">
                  <ExpLink href={post.primaryCta.href}>{post.primaryCta.label}</ExpLink>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <ExpLink href={post.secondaryCta.href}>{post.secondaryCta.label}</ExpLink>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start px-0">
                  <ExpLink href="/compare">Compare alternatives</ExpLink>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-secondary/55">
              <CardHeader>
                <CardTitle className="text-lg">Related posts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {resolvedRelatedPosts.map((relatedPost) => (
                  <div key={relatedPost.slug} className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{relatedPost.targetKeyword}</p>
                    <ExpLink href={`/blog/${relatedPost.slug}`} className="font-medium leading-6 text-foreground transition-colors hover:text-primary">
                      {relatedPost.title}
                    </ExpLink>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        </section>
      </main>

      <StickyCta
        title="Want a private Mac workflow?"
        description="Start with the app, then add automation later if your image cleanup gets more repetitive."
        primaryLabel={post.primaryCta.label}
        primaryHref={post.primaryCta.href}
        secondaryLabel={post.secondaryCta.label}
        secondaryHref={post.secondaryCta.href}
      />
    </>
  );
}

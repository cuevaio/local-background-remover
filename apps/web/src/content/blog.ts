import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { marked } from "marked";
import { z } from "zod";

export type BlogFaq = {
  question: string;
  answer: string;
};

export type BlogCta = {
  label: string;
  href: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  eyebrow: string;
  publishedAt: string;
  updatedAt: string;
  targetKeyword: string;
  heroHighlights: string[];
  primaryCta: BlogCta;
  secondaryCta: BlogCta;
  faqs: BlogFaq[];
  relatedPostSlugs: string[];
  order: number;
  contentHtml: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

const dateFieldSchema = z.union([z.string(), z.date()]).transform((value) => {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
});

const blogFrontmatterSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  excerpt: z.string().min(1),
  eyebrow: z.string().default("SEO guide"),
  publishedAt: dateFieldSchema,
  updatedAt: dateFieldSchema,
  targetKeyword: z.string().min(1),
  heroHighlights: z.array(z.string()).min(1),
  primaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
  secondaryCta: z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  }),
  faqs: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  ),
  relatedPostSlugs: z.array(z.string()),
  order: z.number().int().nonnegative(),
});

marked.setOptions({
  gfm: true,
});

async function parseBlogFile(fileName: string): Promise<BlogPost> {
  const filePath = path.join(BLOG_DIR, fileName);
  const source = await fs.readFile(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = blogFrontmatterSchema.parse(data);
  const contentHtml = await marked.parse(content);

  return {
    ...frontmatter,
    contentHtml,
  };
}

export const getAllBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const posts = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
      .map((entry) => parseBlogFile(entry.name)),
  );

  return posts.sort((left, right) => {
    if (left.order !== right.order) {
      return left.order - right.order;
    }

    if (left.updatedAt !== right.updatedAt) {
      return right.updatedAt.localeCompare(left.updatedAt);
    }

    return left.slug.localeCompare(right.slug);
  });
});

export async function getBlogSlugs(): Promise<string[]> {
  const posts = await getAllBlogPosts();
  return posts.map((post) => post.slug);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const posts = await getAllBlogPosts();
  return posts.find((post) => post.slug === slug);
}

export async function getLatestBlogUpdate(): Promise<string> {
  const posts = await getAllBlogPosts();
  return posts.reduce((latest, post) => {
    return post.updatedAt > latest ? post.updatedAt : latest;
  }, posts[0]?.updatedAt ?? "2026-04-06");
}

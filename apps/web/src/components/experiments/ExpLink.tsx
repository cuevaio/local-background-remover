"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, type ComponentProps } from "react";

import { withExpParam } from "@/lib/experiments/attribution";

type ExpLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

function isInternalHref(href: string) {
  return href.startsWith("/") || href.startsWith("?") || href.startsWith("#");
}

export default function ExpLink({ href, ...props }: ExpLinkProps) {
  return (
    <Suspense fallback={<Link href={href} {...props} />}>
      <ResolvedExpLink href={href} {...props} />
    </Suspense>
  );
}

function ResolvedExpLink({ href, ...props }: ExpLinkProps) {
  const searchParams = useSearchParams();
  const exp = searchParams.get("exp") ?? "";
  const resolvedHref = exp && isInternalHref(href) ? withExpParam(href, exp) : href;

  return <Link href={resolvedHref} {...props} />;
}

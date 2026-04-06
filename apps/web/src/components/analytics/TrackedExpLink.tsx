"use client";

import type { ComponentProps, MouseEvent } from "react";

import ExpLink from "@/components/experiments/ExpLink";
import { trackCtaClicked, type AnalyticsPlanKind } from "@/lib/analytics/events";

type TrackedExpLinkProps = ComponentProps<typeof ExpLink> & {
  slot: string;
  label: string;
  kind?: AnalyticsPlanKind;
};

function readCurrentExp() {
  if (typeof window === "undefined") {
    return "";
  }

  return new URLSearchParams(window.location.search).get("exp") ?? "";
}

export default function TrackedExpLink({
  slot,
  label,
  kind,
  href,
  onClick,
  ...props
}: TrackedExpLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }

    const exp = readCurrentExp();
    trackCtaClicked({
      slot,
      label,
      kind,
      href,
      page_path: window.location.pathname,
      exp,
      has_exp: Boolean(exp),
    });
  };

  return <ExpLink href={href} onClick={handleClick} {...props} />;
}

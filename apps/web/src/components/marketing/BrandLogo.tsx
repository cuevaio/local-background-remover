import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

const FOREGROUND = "var(--foreground)";
const MUTED_FOREGROUND = "var(--muted-foreground)";

export type BrandLogoTone = "color" | "mono";

type BrandMarkProps = ComponentPropsWithoutRef<"svg"> & {
  tone?: BrandLogoTone;
};

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
  showWordmark?: boolean;
  tone?: BrandLogoTone;
  wordmarkClassName?: string;
  wordmark?: string;
};

function resolveColors(tone: BrandLogoTone) {
  if (tone === "mono") {
    return {
      base: "currentColor",
      baseOpacity: 0.2,
      accent: "currentColor",
      accentOpacity: 0.5,
      detailOpacity: 0.26,
    };
  }

  return {
    base: FOREGROUND,
    baseOpacity: 0.12,
    accent: MUTED_FOREGROUND,
    accentOpacity: 0.4,
    detailOpacity: 0.22,
  };
}

export function BrandMark({ className, tone = "color", ...props }: BrandMarkProps) {
  const colors = resolveColors(tone);

  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-6 shrink-0", className)}
      {...props}
    >
      <title>Local Background Remover square logo mark</title>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 9H31V31H9V9ZM15 15V25H25V15H15Z"
        fill={colors.base}
        fillOpacity={colors.baseOpacity}
      />
      <path
        d="M23 9H31V17C26.58 17 23 13.42 23 9Z"
        fill={colors.accent}
        fillOpacity={colors.accentOpacity}
      />
      <path
        d="M22.4 9.6L30.4 17.6"
        stroke={colors.accent}
        strokeOpacity={colors.detailOpacity}
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BrandLogo({
  className,
  markClassName,
  showWordmark = true,
  tone = "color",
  wordmarkClassName,
  wordmark = "local.backgroundrm",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark className={markClassName} tone={tone} aria-hidden="true" focusable="false" />
      {showWordmark ? (
        <span className={cn("font-display text-sm font-semibold tracking-tight md:text-base", wordmarkClassName)}>
          {wordmark}
        </span>
      ) : null}
    </span>
  );
}

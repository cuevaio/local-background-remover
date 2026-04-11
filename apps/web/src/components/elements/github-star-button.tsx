"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GitHubStarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  owner: string;
  repo: string;
  staticCount?: number;
  showCount?: boolean;
  variant?: "default" | "outline";
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z" />
    </svg>
  );
}

export function GitHubStarButton({
  owner,
  repo,
  staticCount,
  showCount = true,
  variant = "default",
  className,
  onClick,
  ...props
}: GitHubStarButtonProps) {
  const [count, setCount] = useState<number | null>(staticCount ?? null);
  const [loading, setLoading] = useState(staticCount === undefined);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (staticCount !== undefined) return;

    async function fetchCount() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}`
        );
        if (response.ok) {
          const data = await response.json();
          setCount(data.stargazers_count);
        }
      } catch {
        // Silently fail - count will remain null
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
  }, [owner, repo, staticCount]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    window.open(`https://github.com/${owner}/${repo}`, "_blank");
    onClick?.(e);
  };

  const baseStyles =
    "inline-flex h-9 items-center gap-2 rounded-[10px] border text-sm font-medium whitespace-nowrap transition-all duration-150 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 active:translate-y-px disabled:pointer-events-none disabled:opacity-45";

  const variantStyles = {
    default:
      "border-primary bg-primary px-4 text-primary-foreground hover:bg-black/92",
    outline:
      "border-border bg-card px-4 text-secondary-foreground hover:bg-secondary hover:text-foreground",
  };

  return (
    <button
      data-slot="github-star-button"
      type="button"
      className={cn(baseStyles, variantStyles[variant], className)}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      <StarIcon
        className={cn(
          "w-4 h-4 transition-transform duration-200",
          isHovered && "scale-110"
        )}
      />
      <span>Star</span>
      {showCount && (
        <>
          <span className="w-px h-4 bg-current opacity-20" />
          {loading ? (
            <span className="h-4 w-8 rounded bg-foreground/10 animate-pulse" />
          ) : (
            <span className="tabular-nums">
              {count !== null ? formatNumber(count) : "—"}
            </span>
          )}
        </>
      )}
    </button>
  );
}

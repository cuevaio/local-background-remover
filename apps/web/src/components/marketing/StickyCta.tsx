import ExpLink from "@/components/experiments/ExpLink";
import { Button } from "@/components/ui/button";

type StickyCtaProps = {
  title: string;
  description: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel: string;
  secondaryHref: string;
};

export default function StickyCta({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: StickyCtaProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/92 p-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="site-frame flex w-full flex-col gap-3 rounded-xl border border-border bg-card p-3 md:flex-row md:items-center md:justify-between md:px-4">
        <div className="flex flex-col gap-0.5">
          <p className="font-display text-sm font-semibold tracking-tight">{title}</p>
          <p className="text-xs text-muted-foreground md:text-sm">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <ExpLink href={secondaryHref}>{secondaryLabel}</ExpLink>
          </Button>
          <Button asChild size="sm">
            <ExpLink href={primaryHref}>{primaryLabel}</ExpLink>
          </Button>
        </div>
      </div>
    </div>
  );
}

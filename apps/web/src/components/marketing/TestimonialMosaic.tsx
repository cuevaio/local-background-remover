import { Badge } from "@/components/ui/badge";
import { LANDING_TESTIMONIALS } from "@/content/testimonials";

export default function TestimonialMosaic() {
  return (
    <section className="section-block section-divider flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Badge variant="outline" className="w-fit bg-card">
          Customer stories
        </Badge>
        <h2 className="section-title">Trusted by people who ship every day</h2>
        <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
          Real operators using local background removal in design, ecommerce, and production
          workflows.
        </p>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-border bg-border">
        <div className="grid grid-cols-1 gap-px bg-border md:grid-cols-2 xl:grid-cols-3">
          {LANDING_TESTIMONIALS.map((item) => (
            <article key={item.id} className="flex min-h-[230px] flex-col justify-between gap-6 bg-card p-6">
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
  );
}

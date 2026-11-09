import { quickStartSteps } from "@/content/quick-start";
import { site } from "@/content/site";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { ButtonLink } from "@/components/ui/button-link";

export function QuickStartSection() {
  return (
    <section
      id="quick-start"
      aria-labelledby="quick-start-heading"
      className="mt-12 grid scroll-mt-8 gap-8 rounded-[2.5rem] bg-brand p-6 text-white md:grid-cols-2 md:p-10"
    >
      <div className="flex flex-col items-start gap-5">
        <h2 id="quick-start-heading" className="text-3xl font-semibold tracking-tight">
          Up and Running in Three Steps
        </h2>
        <p className="max-w-sm text-sm leading-relaxed text-white/80">
          iconfigly runs entirely on Docker Compose. No cloud account, no license key and no data leaving your
          machine.
        </p>
        <ButtonLink href={site.links.console} variant="lime" size="lg">
          Open Console
          <ArrowBadge tone="brand" />
        </ButtonLink>
      </div>
      <ol className="flex flex-col gap-4">
        {quickStartSteps.map((step, index) => (
          <li key={step.title} className="flex items-start gap-4">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-lime text-sm font-bold text-ink">
              {index + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <span className="text-sm font-semibold">{step.title}</span>
              <code className="block overflow-x-auto rounded-xl bg-ink px-4 py-3 font-mono text-sm text-lime">
                {step.command}
              </code>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

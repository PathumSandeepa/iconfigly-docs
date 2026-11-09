"use client";

import { architectureDecisions, boundedContexts } from "@/content/architecture";
import { FloatingSparkles, StaggeredContainer } from "@/components/brand/animated-elements";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ArchitectureSection() {
  return (
    <section
      id="architecture"
      aria-labelledby="architecture-heading"
      className="relative mt-12 flex scroll-mt-8 flex-col gap-8 rounded-[2.5rem] border border-ink/25 p-6 md:p-10 overflow-hidden"
    >
      <div className="pointer-events-none absolute top-6 right-8">
        <FloatingSparkles delay={0.4} />
      </div>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand">Architecture & Design</span>
          <h2 id="architecture-heading" className="text-3xl font-semibold tracking-tight text-ink">
            Engineering Decisions & Bounded Contexts
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink/70 md:text-right">
          Built on Domain-Driven Design (DDD), Clean Architecture, and zero reflection-heavy frameworks.
        </p>
      </div>

      <div>
        <h3 className="text-xl font-bold tracking-tight text-ink">Domain-Driven Bounded Contexts</h3>
        <p className="mt-1 text-sm text-ink/70">
          Strict package isolation enforced in internal/ keeping business logic independent from transport and SQL.
        </p>
        <StaggeredContainer
          selector="[data-context-card]"
          stagger={0.08}
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {boundedContexts.map((ctx) => (
            <div key={ctx.name} data-context-card>
              <Card className="flex flex-col p-5 border-ink/20">
                <CardHeader className="items-center">
                  <Badge variant={ctx.category === "Core" ? "brand" : "soft"}>{ctx.category}</Badge>
                  <span className="font-mono text-xs text-ink/50">{ctx.pkg}</span>
                </CardHeader>
                <Separator className="bg-ink/10" />
                <CardContent className="mt-2 flex-1 gap-3">
                  <CardTitle className="text-base font-semibold">{ctx.name}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-ink/70">
                    {ctx.summary}
                  </CardDescription>
                  <div className="mt-auto flex flex-wrap gap-1.5 pt-2">
                    {ctx.keyArtifacts.map((art) => (
                      <span
                        key={art}
                        className="rounded-md bg-canvas px-2 py-0.5 font-mono text-[10px] font-semibold text-brand"
                      >
                        {art}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </StaggeredContainer>
      </div>

      <div className="mt-4">
        <h3 className="text-xl font-bold tracking-tight text-ink">Key Architectural Decisions (ADRs)</h3>
        <p className="mt-1 text-sm text-ink/70">
          Core technical decisions documented in Phase 1 Engineering Blueprint.
        </p>
        <StaggeredContainer
          selector="[data-adr-card]"
          stagger={0.08}
          className="mt-4 grid gap-3 sm:grid-cols-2"
        >
          {architectureDecisions.map((adr) => (
            <div
              key={adr.id}
              data-adr-card
              className="flex flex-col gap-2 rounded-2xl border border-ink/15 bg-white p-4.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-brand">{adr.id}</span>
                <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-xs font-medium text-ink/70">
                  {adr.area}
                </span>
              </div>
              <h4 className="text-sm font-semibold text-ink">{adr.decision}</h4>
              <p className="text-xs leading-relaxed text-ink/75">{adr.rationale}</p>
              <span className="text-[11px] font-medium text-ink/50">Alternative: {adr.alternative}</span>
            </div>
          ))}
        </StaggeredContainer>
      </div>
    </section>
  );
}

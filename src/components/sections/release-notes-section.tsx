"use client";

import { v1ReleaseNotes, v2DevelopmentMilestone } from "@/content/release-notes";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { FloatingStar, StaggeredContainer } from "@/components/brand/animated-elements";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ReleaseNotesSection() {
  return (
    <section
      id="release-notes"
      aria-labelledby="release-notes-heading"
      className="relative mt-12 flex scroll-mt-8 flex-col gap-8 rounded-[2.5rem] border border-ink/25 p-6 md:p-10 overflow-hidden"
    >
      <div className="pointer-events-none absolute top-6 right-8">
        <FloatingStar size="sm" delay={0.3} />
      </div>

      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand">Release Governance</span>
          <h2 id="release-notes-heading" className="text-3xl font-semibold tracking-tight text-ink">
            Version Milestones & Release Notes
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-ink/70 md:text-right">
          Track official releases, architectural milestones, and active engineering initiatives.
        </p>
      </div>

      <div className="rounded-3xl border-2 border-brand bg-brand p-6 text-white md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="relative flex size-3">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex size-3 rounded-full bg-lime" />
            </span>
            <Badge variant="lime" className="font-mono text-xs font-bold">
              v{v2DevelopmentMilestone.version}
            </Badge>
            <span className="text-sm font-semibold text-lime">{v2DevelopmentMilestone.label}</span>
          </div>
          <span className="text-xs font-medium text-white/70">{v2DevelopmentMilestone.releaseDate}</span>
        </div>

        <h3 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
          {v2DevelopmentMilestone.title}
        </h3>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90">
          {v2DevelopmentMilestone.summary}
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {v2DevelopmentMilestone.highlights.map((highlight) => (
            <div
              key={highlight}
              className="flex items-start gap-2.5 rounded-2xl bg-white/10 p-3.5 text-xs text-white backdrop-blur-xs"
            >
              <ArrowBadge tone="lime" className="size-6 text-ink" />
              <span className="leading-snug">{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant="brand" className="font-mono text-xs font-bold">
              v{v1ReleaseNotes.version}
            </Badge>
            <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-semibold text-emerald-800">
              {v1ReleaseNotes.label}
            </span>
          </div>
          <span className="text-xs text-ink/60">Released: {v1ReleaseNotes.releaseDate}</span>
        </div>

        <div>
          <h3 className="text-2xl font-bold tracking-tight text-ink md:text-3xl">
            {v1ReleaseNotes.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ink/80">{v1ReleaseNotes.summary}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-ink/15 bg-canvas/40 p-4">
            <span className="block text-2xl font-bold text-brand">10 / 10</span>
            <span className="text-xs font-medium text-ink/70">Sub-Phases Verified</span>
          </div>
          <div className="rounded-2xl border border-ink/15 bg-canvas/40 p-4">
            <span className="block text-2xl font-bold text-brand">20 Packages</span>
            <span className="text-xs font-medium text-ink/70">Go Modular Monolith</span>
          </div>
          <div className="rounded-2xl border border-ink/15 bg-canvas/40 p-4">
            <span className="block text-2xl font-bold text-brand">15 Tables</span>
            <span className="text-xs font-medium text-ink/70">PostgreSQL 18 UUIDv7</span>
          </div>
          <div className="rounded-2xl border border-ink/15 bg-canvas/40 p-4">
            <span className="block text-2xl font-bold text-brand">100%</span>
            <span className="text-xs font-medium text-ink/70">Integration & E2E Pass</span>
          </div>
        </div>

        <div className="mt-2">
          <h4 className="text-base font-semibold text-ink">Phase 1 Engineering Deliverables</h4>
          <StaggeredContainer
            selector="[data-deliverable-card]"
            stagger={0.06}
            className="mt-4 grid gap-3 sm:grid-cols-2"
          >
            {v1ReleaseNotes.subPhases.map((sub) => (
              <div key={sub.id} data-deliverable-card>
                <Card className="p-4.5 border-ink/20">
                  <CardHeader className="items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-brand">{sub.code}</span>
                      <span className="rounded-md bg-ink/5 px-2 py-0.5 font-mono text-[11px] text-ink/60">
                        {sub.scope}
                      </span>
                    </div>
                  </CardHeader>
                  <Separator className="bg-ink/10" />
                  <CardContent className="mt-2 gap-2">
                    <CardTitle className="text-sm font-semibold">{sub.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-ink/70">
                      {sub.deliverable}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>
            ))}
          </StaggeredContainer>
        </div>
      </div>
    </section>
  );
}

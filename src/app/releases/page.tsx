import type { Metadata } from "next";
import { v1ReleaseNotes, v2DevelopmentMilestone } from "@/content/release-notes";
import { site } from "@/content/site";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { FloatingSparkles } from "@/components/brand/animated-elements";
import { PageLayout } from "@/components/layout/page-layout";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: `Release Notes — ${site.name}`,
  description:
    "Official changelogs, v1.0.0 General Availability sub-phases, and v2.0.0 active engineering development milestone.",
};

export default function ReleasesPage() {
  return (
    <PageLayout>
      <div className="relative border-b border-zinc-200/80 bg-zinc-50/50 py-12 overflow-hidden">
        <div className="pointer-events-none absolute right-12 top-6 hidden sm:block">
          <FloatingSparkles delay={0.3} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <span>Release Governance</span>
              <span>•</span>
              <span>Milestone Changelogs</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Version Milestones & Release Notes
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Track released platform capabilities, verified sub-phase deliverables, and active engineering initiatives across the iconfigly ecosystem.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-16">
          <section className="rounded-3xl border-2 border-brand bg-brand p-8 text-white md:p-10 shadow-xs">
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

            <h2 className="mt-4 text-2xl font-bold tracking-tight text-white md:text-3xl">
              {v2DevelopmentMilestone.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/90">
              {v2DevelopmentMilestone.summary}
            </p>

            <div className="mt-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-lime">Active Engineering Focus</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {v2DevelopmentMilestone.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-2.5 rounded-2xl bg-white/10 p-4 text-xs text-white backdrop-blur-xs"
                  >
                    <ArrowBadge tone="lime" className="size-6 text-zinc-900" />
                    <span className="leading-snug">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3">
                <Badge variant="brand" className="font-mono text-sm font-bold">
                  v{v1ReleaseNotes.version}
                </Badge>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {v1ReleaseNotes.label}
                </span>
              </div>
              <span className="text-xs text-zinc-500">Released: {v1ReleaseNotes.releaseDate}</span>
            </div>

            <div>
              <h2 className="text-3xl font-bold tracking-tight text-zinc-900">
                {v1ReleaseNotes.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">{v1ReleaseNotes.summary}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 shadow-2xs">
                <span className="block text-3xl font-extrabold text-brand">10 / 10</span>
                <span className="text-xs font-medium text-zinc-600">Sub-Phases Verified</span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 shadow-2xs">
                <span className="block text-3xl font-extrabold text-brand">20 Packages</span>
                <span className="text-xs font-medium text-zinc-600">Go Modular Monolith</span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 shadow-2xs">
                <span className="block text-3xl font-extrabold text-brand">15 Tables</span>
                <span className="text-xs font-medium text-zinc-600">PostgreSQL 18 UUIDv7</span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 shadow-2xs">
                <span className="block text-3xl font-extrabold text-brand">100%</span>
                <span className="text-xs font-medium text-zinc-600">Integration & E2E Pass</span>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-4">
              <h3 className="text-lg font-bold text-zinc-900">Phase 1 Sub-Phase Deliverables</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {v1ReleaseNotes.subPhases.map((sub) => (
                  <Card key={sub.id} className="p-5 border-zinc-200 shadow-2xs">
                    <CardHeader className="items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-brand">{sub.code}</span>
                        <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600">
                          {sub.scope}
                        </span>
                      </div>
                    </CardHeader>
                    <Separator className="bg-zinc-100" />
                    <CardContent className="mt-3 gap-2">
                      <CardTitle className="text-sm font-bold text-zinc-900">{sub.title}</CardTitle>
                      <CardDescription className="text-xs leading-relaxed text-zinc-600">
                        {sub.deliverable}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-3xl border-2 border-brand bg-brand p-8 text-white md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-lime">Looking Ahead</span>
                <h3 className="mt-1 text-2xl font-bold">Explore the 9-Phase Product Roadmap</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/90">
                  Read about our upcoming milestones including Phase 2 Change Requests, Phase 3 Self-Healing Operators, and Phase 4 Enterprise Federation.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <AppLink
                  href="/roadmap"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-xs font-bold text-zinc-900 hover:bg-lime/90"
                >
                  View Full Roadmap
                  <ArrowBadge tone="brand" className="size-5" />
                </AppLink>
                <AppLink
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Platform Guides
                </AppLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

import type { Metadata } from "next";
import { roadmapPhases } from "@/content/roadmap";
import { site } from "@/content/site";
import { isInProgressPhase, isLivePhase } from "@/domain/roadmap";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { FloatingStar } from "@/components/brand/animated-elements";
import { PageLayout } from "@/components/layout/page-layout";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `Roadmap — ${site.name}`,
  description:
    "The 9-phase engineering blueprint transforming iconfigly into a comprehensive, self-hosted Internal Developer Platform.",
};

export default function RoadmapPage() {
  return (
    <PageLayout>
      <div className="relative border-b border-zinc-200/80 bg-zinc-50/50 py-12 overflow-hidden">
        <div className="pointer-events-none absolute right-12 top-6 hidden sm:block">
          <FloatingStar size="lg" delay={0.25} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <span>Platform Strategy</span>
              <span>•</span>
              <span>Phase 1 to Phase 9</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Multi-Phase Engineering Roadmap
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Explore the architectural evolution of iconfigly across all nine engineering blueprints. Phase 1 is generally available today; Phase 2 change governance is in active development.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roadmapPhases.map((phase) => {
              const live = isLivePhase(phase);
              const inProgress = isInProgressPhase(phase);

              return (
                <Card
                  key={phase.version}
                  className={cn(
                    "flex flex-col p-6 shadow-2xs border-zinc-200",
                    live && "border-2 border-brand bg-brand text-white shadow-xs",
                    inProgress && "border-2 border-brand bg-zinc-50/80 shadow-xs",
                  )}
                >
                  <CardHeader className="items-center">
                    <Badge variant={live ? "lime" : inProgress ? "brand" : "soft"}>
                      {phase.version}
                    </Badge>
                    <Badge
                      variant={live ? "lime" : inProgress ? "brand" : "outline"}
                      className={inProgress ? "bg-brand text-white" : undefined}
                    >
                      {live ? "Live" : inProgress ? "In Progress" : "Planned"}
                    </Badge>
                  </CardHeader>
                  <CardContent className="mt-3 flex-1 gap-3">
                    <CardTitle className={cn("text-base font-bold", inProgress && "text-brand")}>
                      {phase.title}
                    </CardTitle>
                    <CardDescription className={live ? "text-white/90" : "text-zinc-600"}>
                      {phase.summary}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <section className="rounded-3xl border-2 border-brand bg-brand p-8 text-white md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-lime">Phase 1 GA Ready</span>
                <h3 className="mt-1 text-2xl font-bold">Deploy Your Local Developer Platform Today</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/90">
                  Ready to test? Clone the repository and execute docker compose up -d to spin up the entire cluster in under 30 seconds.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <AppLink
                  href="/docs"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-xs font-bold text-zinc-900 hover:bg-lime/90"
                >
                  Read Docs & Commands
                  <ArrowBadge tone="brand" className="size-5" />
                </AppLink>
                <AppLink
                  href={site.links.console}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Launch Console
                </AppLink>
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageLayout>
  );
}

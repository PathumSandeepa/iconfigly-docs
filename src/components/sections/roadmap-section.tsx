"use client";

import { isInProgressPhase, isLivePhase, type RoadmapPhase } from "@/domain/roadmap";
import { roadmapPhases } from "@/content/roadmap";
import { FloatingSparkles, StaggeredContainer } from "@/components/brand/animated-elements";
import { SectionHeading } from "@/components/layout/section-heading";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function RoadmapCard({ phase }: { readonly phase: RoadmapPhase }) {
  const live = isLivePhase(phase);
  const inProgress = isInProgressPhase(phase);

  return (
    <li className="flex">
      <Card
        className={cn(
          "flex w-full flex-col gap-3 p-5",
          live && "bg-brand text-white",
          inProgress && "border-2 border-brand bg-canvas/30 text-ink shadow-xs",
        )}
      >
        <CardHeader className="items-center">
          <Badge variant={live ? "lime" : inProgress ? "brand" : "soft"}>{phase.version}</Badge>
          <Badge
            variant={live ? "lime" : inProgress ? "brand" : "outline"}
            className={inProgress ? "bg-brand text-white" : undefined}
          >
            {live ? "Live" : inProgress ? "In Progress" : "Planned"}
          </Badge>
        </CardHeader>
        <CardTitle className={inProgress ? "text-brand" : undefined}>{phase.title}</CardTitle>
        <CardDescription className={live ? "text-white/90" : "text-ink/70"}>
          {phase.summary}
        </CardDescription>
      </Card>
    </li>
  );
}

export function RoadmapSection() {
  return (
    <section
      id="roadmap"
      aria-labelledby="roadmap-heading"
      className="relative mt-12 flex scroll-mt-8 flex-col gap-8 rounded-[2.5rem] border border-ink/25 p-6 md:p-10 overflow-hidden"
    >
      <div className="pointer-events-none absolute top-6 right-8">
        <FloatingSparkles delay={0.5} />
      </div>

      <SectionHeading
        id="roadmap-heading"
        title="Multi-Phase Engineering Roadmap"
        description="Phase 1 is generally available. Phase 2 change governance is in active engineering, followed by enterprise federation and Kubernetes native operators."
      />
      <StaggeredContainer
        selector="li"
        stagger={0.06}
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
      >
        {roadmapPhases.map((phase) => (
          <RoadmapCard key={phase.version} phase={phase} />
        ))}
      </StaggeredContainer>
    </section>
  );
}

"use client";

import { capabilities } from "@/content/capabilities";
import { FloatingStar } from "@/components/brand/animated-elements";
import { StaggeredContainer } from "@/components/brand/animated-elements";
import { SectionHeading } from "@/components/layout/section-heading";
import { CapabilityCard } from "@/components/sections/capability-card";

export function CapabilitiesSection() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="mt-16 flex scroll-mt-24 flex-col gap-8 rounded-3xl border border-zinc-200/80 bg-zinc-50/40 p-6 md:p-10 shadow-2xs relative overflow-hidden"
    >
      <div className="pointer-events-none absolute top-6 right-8">
        <FloatingStar size="md" delay={0.2} />
      </div>

      <SectionHeading
        id="capabilities-heading"
        title="Core Platform Capabilities"
        description="The foundational primitives every platform team needs: single-pane topology, scoped RBAC, and tamper-evident audit trails."
      />

      <StaggeredContainer
        selector="[data-capability-card]"
        stagger={0.12}
        className="grid gap-5 md:grid-cols-3"
      >
        {capabilities.map((capability) => (
          <div key={capability.id} data-capability-card>
            <CapabilityCard capability={capability} />
          </div>
        ))}
      </StaggeredContainer>
    </section>
  );
}

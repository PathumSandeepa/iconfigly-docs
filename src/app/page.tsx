import { ArrowUpRight } from "lucide-react";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { PageLayout } from "@/components/layout/page-layout";
import { CapabilitiesSection } from "@/components/sections/capabilities-section";
import { ClosingSection } from "@/components/sections/closing-section";
import { HeroSection } from "@/components/sections/hero-section";
import { QuickStartSection } from "@/components/sections/quick-start-section";
import { ShowcaseSection } from "@/components/sections/showcase-section";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <PageLayout>
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
        <HeroSection />
        <ShowcaseSection />
        <CapabilitiesSection />

        <section className="mt-16 rounded-3xl border border-zinc-200/80 bg-zinc-50/50 p-8 md:p-12 shadow-2xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Architecture & Engineering</span>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                Built from First Principles: DDD, Go 1.27 & PostgreSQL 18
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                A single deployable modular monolith in Go with strict package boundaries in internal/, zero reflection-heavy routers, native time-ordered UUIDv7 primary keys, and an append-only cryptographic audit chain.
              </p>
            </div>
            <AppLink
              href="/architecture"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-brand-hover"
            >
              Explore Architecture & ADRs
              <ArrowUpRight className="size-4" />
            </AppLink>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand">ADR-001 / ADR-002</span>
                <Badge variant="soft">Go Core</Badge>
              </div>
              <h3 className="mt-3 text-sm font-bold text-zinc-900">Standard Library net/http</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Native path and method routing without third-party frameworks, keeping handlers 100% compatible with standard Go contexts.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand">ADR-003 / ADR-004</span>
                <Badge variant="soft">Storage</Badge>
              </div>
              <h3 className="mt-3 text-sm font-bold text-zinc-900">PostgreSQL 18 Native uuidv7()</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Time-ordered UUIDv7 keys prevent B-tree page fragmentation under heavy insert loads, queried via thread-safe pgxpool.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-brand">ADR-009 / ADR-010</span>
                <Badge variant="soft">Governance</Badge>
              </div>
              <h3 className="mt-3 text-sm font-bold text-zinc-900">Scoped RBAC & SHA-256 Chains</h3>
              <p className="mt-1 text-xs leading-relaxed text-zinc-600">
                Hierarchical scope evaluation with ancestor inheritance, verified by append-only trigger-enforced cryptographic audit hashes.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-3xl border-2 border-brand bg-brand p-8 text-white md:p-12 shadow-xs">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <span className="relative flex size-3">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-lime" />
                </span>
                <span className="font-mono text-xs font-bold text-lime uppercase tracking-wider">
                  Active Engineering Milestone
                </span>
              </div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                v2.0.0 Change-Safety Core & Blast-Radius Engine
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-white/90 sm:text-sm">
                Engineering has commenced on Phase 2. We are building directed-graph blast radius impact calculations, versioned key-value configurations, multi-approver workflows, and transactional outbox event delivery.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <AppLink
                href="/releases"
                className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-xs font-bold text-zinc-900 shadow-xs hover:bg-lime/90"
              >
                View v1.0 Notes & v2.0 Scope
                <ArrowBadge tone="brand" className="size-5" />
              </AppLink>
              <AppLink
                href="/roadmap"
                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-xs font-semibold text-white hover:bg-white/20"
              >
                See 9-Phase Roadmap
              </AppLink>
            </div>
          </div>
        </section>

        <QuickStartSection />
        <ClosingSection />
      </div>
    </PageLayout>
  );
}

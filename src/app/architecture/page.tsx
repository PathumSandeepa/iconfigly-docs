import type { Metadata } from "next";
import { architectureDecisions, boundedContexts } from "@/content/architecture";
import { site } from "@/content/site";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { FloatingStar } from "@/components/brand/animated-elements";
import { PageLayout } from "@/components/layout/page-layout";
import { AppLink } from "@/components/ui/app-link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
  title: `Architecture & ADRs — ${site.name}`,
  description:
    "Domain-Driven Design (DDD) bounded contexts, Go standard library routing, PostgreSQL 18 UUIDv7, and 10 Architectural Decision Records.",
};

export default function ArchitecturePage() {
  return (
    <PageLayout>
      <div className="relative border-b border-zinc-200/80 bg-zinc-50/50 py-12 overflow-hidden">
        <div className="pointer-events-none absolute right-12 top-6 hidden sm:block">
          <FloatingStar size="lg" delay={0.2} />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <span>Engineering Specifications</span>
              <span>•</span>
              <span>Clean Architecture</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">
              Platform Architecture & Decision Records (ADRs)
            </h1>
            <p className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base">
              Explore the engineering rationale behind iconfigly: a Domain-Driven modular monolith in Go 1.27, zero external routing frameworks, PostgreSQL 18 with time-ordered native UUIDv7 primary keys, and an append-only cryptographic audit chain.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-16">
          <section className="flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Domain-Driven Design</span>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Bounded Contexts & Internal Package Boundaries
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Enforced by the Go internal/ compiler rule to prevent leaky abstractions and cyclical imports.
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {boundedContexts.map((ctx) => (
                <Card key={ctx.name} className="flex flex-col p-6 border-zinc-200 shadow-2xs">
                  <CardHeader className="items-center">
                    <Badge variant={ctx.category === "Core" ? "brand" : "soft"}>
                      {ctx.category}
                    </Badge>
                    <span className="font-mono text-xs text-zinc-400">{ctx.pkg}</span>
                  </CardHeader>
                  <Separator className="bg-zinc-100" />
                  <CardContent className="mt-3 flex-1 gap-3">
                    <CardTitle className="text-base font-bold text-zinc-900">{ctx.name}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed text-zinc-600">
                      {ctx.summary}
                    </CardDescription>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                      {ctx.keyArtifacts.map((art) => (
                        <span
                          key={art}
                          className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-zinc-700"
                        >
                          {art}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand">Architecture Decision Records</span>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900">
                Architectural Decision Records (ADR-001 – ADR-012)
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                Formal technical decisions documented in Phase 1 Engineering Blueprint, along with alternatives considered and rejected.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {architectureDecisions.map((adr) => (
                <div
                  key={adr.id}
                  className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs font-bold text-brand">{adr.id}</span>
                    <span className="rounded-full bg-zinc-100 px-3 py-0.5 text-xs font-medium text-zinc-700">
                      {adr.area}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-zinc-900">{adr.decision}</h3>
                  <p className="text-xs leading-relaxed text-zinc-700">{adr.rationale}</p>
                  <div className="rounded-xl bg-zinc-50 p-3 text-[11px] text-zinc-500">
                    <span className="font-semibold text-zinc-700">Alternative Rejected:</span> {adr.alternative}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border-2 border-brand bg-brand p-8 text-white md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <span className="text-xs font-bold uppercase tracking-wider text-lime">Verification & Testing</span>
                <h3 className="mt-1 text-2xl font-bold">100% Automated Test Suite</h3>
                <p className="mt-2 text-xs leading-relaxed text-white/90">
                  Every bounded context includes table-driven Go unit tests, transactional PostgreSQL integration tests using native UUIDv7 fixtures, and Playwright end-to-end browser specs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <AppLink
                  href="/releases"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 text-xs font-bold text-zinc-900 hover:bg-lime/90"
                >
                  View Release Notes
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

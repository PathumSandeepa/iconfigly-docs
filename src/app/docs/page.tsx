import type { Metadata } from "next";
import {
  codeReferenceSpecs,
  documentationCategories,
  osPlatformGuides,
  testSuiteCommands,
} from "@/content/docs";
import { site } from "@/content/site";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import { FloatingStar } from "@/components/brand/animated-elements";
import { CodeReferencesView } from "@/components/docs/code-references-view";
import { DocsHero } from "@/components/docs/docs-hero";
import { OSGuidesTabs } from "@/components/docs/os-guides-tabs";
import { TestCommandsView } from "@/components/docs/test-commands-view";
import { PageLayout } from "@/components/layout/page-layout";
import { AppLink } from "@/components/ui/app-link";
import { ButtonLink } from "@/components/ui/button-link";

export const metadata: Metadata = {
  title: `Documentation — ${site.name}`,
  description:
    "Comprehensive guides, cluster deployment, macOS/Linux/Windows runtimes, test suites, and function-wise API specifications.",
};

export default function DocsPage() {
  return (
    <PageLayout>
      <DocsHero />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-4">
          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                  Documentation Index
                </span>
                <FloatingStar size="sm" />
              </div>
              <nav className="flex flex-col gap-1.5">
                <a
                  href="#os-matrix"
                  className="text-xs font-semibold text-brand transition-colors hover:underline"
                >
                  Cross-Platform OS Guides
                </a>
                <a
                  href="#test-suites"
                  className="text-xs font-semibold text-brand transition-colors hover:underline"
                >
                  Test Suites & Quality Assurance
                </a>
                <a
                  href="#code-references"
                  className="text-xs font-semibold text-brand transition-colors hover:underline"
                >
                  Function-Wise Engineering Specs
                </a>
                <div className="my-1 border-t border-zinc-200" />
                {documentationCategories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.id}`}
                    className="text-xs font-medium text-zinc-600 transition-colors hover:text-brand"
                  >
                    {cat.title}
                  </a>
                ))}
              </nav>
              <div className="mt-2 border-t border-zinc-200 pt-3">
                <ButtonLink href={site.links.console} size="default" className="w-full text-xs">
                  Launch Console
                  <ArrowBadge tone="brand" className="size-5" />
                </ButtonLink>
              </div>
            </div>
          </aside>

          <main className="flex flex-col gap-12 lg:col-span-3">
            <section id="os-matrix" className="scroll-mt-24">
              <OSGuidesTabs guides={osPlatformGuides} />
            </section>

            <section id="test-suites" className="scroll-mt-24">
              <TestCommandsView commands={testSuiteCommands} />
            </section>

            <section id="code-references" className="scroll-mt-24">
              <CodeReferencesView specs={codeReferenceSpecs} />
            </section>

            {documentationCategories.map((cat) => (
              <section key={cat.id} id={cat.id} className="scroll-mt-24 flex flex-col gap-6">
                <div className="border-b border-zinc-200 pb-3">
                  <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{cat.title}</h2>
                  <p className="mt-1 text-sm text-zinc-600">{cat.summary}</p>
                </div>

                <div className="flex flex-col gap-8">
                  {cat.sections.map((sec) => (
                    <div
                      key={sec.id}
                      id={sec.id}
                      className="flex flex-col gap-3 rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs"
                    >
                      <h3 className="text-lg font-semibold text-zinc-900">{sec.title}</h3>
                      <p className="text-sm leading-relaxed text-zinc-700">{sec.description}</p>

                      {sec.codeExample && (
                        <div className="mt-2 rounded-xl bg-zinc-900 p-4 text-xs font-mono text-lime">
                          <pre className="overflow-x-auto whitespace-pre-wrap">{sec.codeExample}</pre>
                        </div>
                      )}

                      <ul className="mt-2 flex flex-col gap-2">
                        {sec.bulletPoints.map((bp) => (
                          <li key={bp} className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700">
                            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                            <span>{bp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="rounded-2xl border-2 border-brand bg-brand p-8 text-white">
              <h3 className="text-xl font-bold">Looking for Architectural Blueprints?</h3>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-white/90">
                Explore our Domain-Driven Design (DDD) bounded contexts, Architectural Decision Records (ADRs), and internal Go package topologies.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <AppLink
                  href="/architecture"
                  className="inline-flex items-center gap-2 rounded-full bg-lime px-4 py-2 text-xs font-bold text-zinc-900 shadow-xs hover:bg-lime/90"
                >
                  View Architecture & ADRs
                  <ArrowBadge tone="brand" className="size-5" />
                </AppLink>
                <AppLink
                  href="/releases"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
                >
                  Version 1.0 Release Notes
                </AppLink>
              </div>
            </div>
          </main>
        </div>
      </div>
    </PageLayout>
  );
}

import { site } from "@/content/site";
import { GithubIcon } from "@/components/icons/github-icon";
import { Logo } from "@/components/brand/logo";
import { AppLink } from "@/components/ui/app-link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50/50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-3 md:col-span-2">
            <Logo name={site.name} />
            <p className="max-w-md text-xs leading-relaxed text-zinc-600">
              Open-source, self-hosted developer control plane. Catalog microservices and infrastructure across environments, enforce scoped RBAC with ancestor inheritance, and verify every mutation in a cryptographic SHA-256 audit ledger.
            </p>
            <div className="mt-2 flex items-center gap-3">
              <AppLink
                href={site.links.docs}
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 shadow-2xs transition-colors hover:border-zinc-300 hover:text-black"
              >
                <GithubIcon className="size-3.5" />
                GitHub
              </AppLink>
              <span className="text-xs text-zinc-400">Zero cloud cost • 100% Docker containerized</span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Platform</span>
            <AppLink href="/" className="text-xs text-zinc-600 hover:text-brand">
              Product Overview
            </AppLink>
            <AppLink href="/architecture" className="text-xs text-zinc-600 hover:text-brand">
              Architecture & ADRs
            </AppLink>
            <AppLink href="/docs" className="text-xs text-zinc-600 hover:text-brand">
              Platform Docs
            </AppLink>
            <AppLink href="/releases" className="text-xs text-zinc-600 hover:text-brand">
              Release Notes (v1.0 & v2.0)
            </AppLink>
            <AppLink href="/roadmap" className="text-xs text-zinc-600 hover:text-brand">
              9-Phase Roadmap
            </AppLink>
          </div>

          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-900">Repositories</span>
            <AppLink href={site.links.api} className="text-xs text-zinc-600 hover:text-brand">
              iconfigly-api (Go)
            </AppLink>
            <AppLink href={site.links.web} className="text-xs text-zinc-600 hover:text-brand">
              iconfigly-web (Next.js)
            </AppLink>
            <AppLink href={site.links.docs} className="text-xs text-zinc-600 hover:text-brand">
              iconfigly-docs (Docs & Blueprints)
            </AppLink>
            <AppLink href={site.links.console} className="text-xs text-brand font-medium hover:underline">
              Launch Console (:3000)
            </AppLink>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} {site.name}. MIT Licensed Open-Source Platform.</p>
          <div className="flex items-center gap-4">
            <span>Built by {site.author.name}</span>
            <span>•</span>
            <span>Go 1.27 + Next.js 16 + PostgreSQL 18</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

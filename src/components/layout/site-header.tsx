"use client";

import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { consoleLink, primaryNavigation } from "@/content/navigation";
import { site } from "@/content/site";
import { GithubIcon } from "@/components/icons/github-icon";
import { Logo } from "@/components/brand/logo";
import { AppLink } from "@/components/ui/app-link";
import { ButtonLink } from "@/components/ui/button-link";

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <AppLink href="/" aria-label={`${site.name} home`}>
            <Logo name={site.name} />
          </AppLink>
          <span className="hidden rounded-full border border-brand/20 bg-brand/5 px-2.5 py-0.5 text-[11px] font-semibold text-brand sm:inline-block">
            v1.0 GA
          </span>
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {primaryNavigation.map((item) => (
            <AppLink
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-brand"
            >
              {item.label}
            </AppLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <AppLink
            href={site.links.docs}
            aria-label="GitHub Repository"
            className="hidden rounded-full border border-zinc-200 p-2 text-zinc-700 transition-colors hover:border-zinc-300 hover:text-black sm:inline-flex"
          >
            <GithubIcon className="size-4" />
          </AppLink>
          <ButtonLink href={consoleLink.href} size="default" className="text-xs">
            {consoleLink.label}
            <ArrowUpRight aria-hidden className="size-4 text-brand" strokeWidth={2.5} />
          </ButtonLink>
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            className="inline-flex items-center justify-center rounded-lg p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 md:hidden"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-b border-zinc-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {primaryNavigation.map((item) => (
              <AppLink
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="py-1 text-sm font-medium text-zinc-700 hover:text-brand"
              >
                {item.label}
              </AppLink>
            ))}
            <div className="pt-2">
              <AppLink
                href={site.links.docs}
                className="flex items-center gap-2 py-1 text-sm font-medium text-zinc-600"
              >
                <GithubIcon className="size-4" />
                GitHub Repository
              </AppLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

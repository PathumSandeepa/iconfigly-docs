"use client";

import { useState } from "react";
import { Laptop, Terminal, Layers, CheckCircle2, Info } from "lucide-react";
import type { OSPlatformGuide } from "@/domain/docs";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

interface OSGuidesTabsProps {
  readonly guides: readonly OSPlatformGuide[];
}

export function OSGuidesTabs({ guides }: OSGuidesTabsProps) {
  const [activeOS, setActiveOS] = useState<OSPlatformGuide["os"]>("mac");
  const currentGuide = guides.find((g) => g.os === activeOS) ?? guides[0];

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
          <Laptop className="size-4 text-brand" />
          <span>Cross-Platform Execution Matrix</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-zinc-900">
          Environment Guides: macOS, Linux & Windows
        </h3>
        <p className="text-xs leading-relaxed text-zinc-600">
          Select your local host operating system to view tailored Docker Compose startup commands, filesystem mount notes, and test suites.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        {guides.map((guide) => {
          const isActive = guide.os === activeOS;
          return (
            <button
              key={guide.os}
              type="button"
              onClick={() => setActiveOS(guide.os)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                isActive
                  ? "bg-brand text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900",
              )}
            >
              <span>{guide.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-2xs font-mono",
                  isActive ? "bg-white/20 text-lime" : "bg-zinc-200 text-zinc-600",
                )}
              >
                {guide.os.toUpperCase()}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-zinc-50 p-3.5 border border-zinc-200/70">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-800">
              Active Environment: {currentGuide.name}
            </span>
          </div>
          <span className="rounded-full bg-zinc-200/70 px-2.5 py-0.5 text-2xs font-mono font-medium text-zinc-700">
            {currentGuide.badge}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <CheckCircle2 className="size-3.5 text-brand" />
              <span>Host Prerequisites</span>
            </h4>
            <ul className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
              {currentGuide.prerequisites.map((req) => (
                <li
                  key={req}
                  className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <Info className="size-3.5 text-brand" />
              <span>Kernel & Filesystem Architecture</span>
            </h4>
            <ul className="flex flex-col gap-2 rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-4">
              {currentGuide.architectureNotes.map((note) => (
                <li
                  key={note}
                  className="flex items-start gap-2.5 text-xs leading-relaxed text-zinc-700"
                >
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-lime border border-zinc-900" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <Terminal className="size-3.5 text-brand" />
              <span>Bootstrap & Launch Sequence</span>
            </h4>
            <span className="text-2xs text-zinc-500">Copy & execute in root repository</span>
          </div>
          <CodeBlock
            code={currentGuide.bootstrapCommands}
            title={`${currentGuide.os}-bootstrap.sh`}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-800">
              <Layers className="size-3.5 text-brand" />
              <span>Platform Verification & Test Commands</span>
            </h4>
            <span className="text-2xs text-zinc-500">Verification in running containers</span>
          </div>
          <CodeBlock
            code={currentGuide.testCommands}
            title={`${currentGuide.os}-test-suite.sh`}
          />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { CheckCircle2, Play, Target } from "lucide-react";
import type { TestSuiteCommand } from "@/domain/docs";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

interface TestCommandsViewProps {
  readonly commands: readonly TestSuiteCommand[];
}

export function TestCommandsView({ commands }: TestCommandsViewProps) {
  const [filter, setFilter] = useState<"all" | "api" | "web" | "infra">("all");

  const filteredCommands =
    filter === "all" ? commands : commands.filter((c) => c.target === filter);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
          <Play className="size-4 text-brand" />
          <span>Verification & Quality Assurance</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-zinc-900">
          Automated Test Suites & Static Analysis
        </h3>
        <p className="text-xs leading-relaxed text-zinc-600">
          Every layer of the platform contains automated verification. Execute unit tests, concurrent race checks, end-to-end browser workflows, and schema migrations against live Docker containers.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        {(
          [
            { id: "all", label: "All Suites" },
            { id: "api", label: "API Backend (Go)" },
            { id: "web", label: "Web Frontend (Next.js)" },
            { id: "infra", label: "Infra (PostgreSQL)" },
          ] as const
        ).map((tab) => {
          const isActive = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all",
                isActive
                  ? "bg-zinc-900 text-lime shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {filteredCommands.map((test) => (
          <div
            key={test.name}
            className="flex flex-col justify-between gap-4 rounded-xl border border-zinc-200/90 bg-zinc-50/60 p-4 transition-all hover:border-zinc-300 hover:bg-zinc-50"
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-zinc-900">{test.name}</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-200/70 px-2 py-0.5 text-2xs font-mono font-semibold text-zinc-700">
                  <Target className="size-2.5 text-brand" />
                  {test.target.toUpperCase()}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-zinc-600">{test.purpose}</p>
            </div>

            <div className="flex flex-col gap-2">
              <CodeBlock code={test.command} title="terminal command" />
              <div className="flex items-start gap-1.5 rounded-lg border border-emerald-200/70 bg-emerald-50/60 p-2 text-2xs text-emerald-800">
                <CheckCircle2 className="mt-0.5 size-3 shrink-0 text-emerald-600" />
                <span className="font-mono">{test.expectation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Code2, Cpu, FileCode2 } from "lucide-react";
import type { CodeReferenceSpec } from "@/domain/docs";
import { CodeBlock } from "@/components/ui/code-block";
import { cn } from "@/lib/utils";

interface CodeReferencesViewProps {
  readonly specs: readonly CodeReferenceSpec[];
}

export function CodeReferencesView({ specs }: CodeReferencesViewProps) {
  const layers = Array.from(new Set(specs.map((s) => s.layer)));
  const [activeLayer, setActiveLayer] = useState<string>(layers[0] ?? "");

  const activeSpecs = specs.filter((s) => s.layer === activeLayer);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xs">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand">
          <Code2 className="size-4 text-brand" />
          <span>Internal Engineering Mechanics</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-zinc-900">
          Function-Wise Codebase Reference
        </h3>
        <p className="text-xs leading-relaxed text-zinc-600">
          In-depth technical breakdown of core handler functions, domain services, cryptographic operations, and Next.js BFF proxy routing.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3">
        {layers.map((layer) => {
          const isActive = layer === activeLayer;
          return (
            <button
              key={layer}
              type="button"
              onClick={() => setActiveLayer(layer)}
              className={cn(
                "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all",
                isActive
                  ? "bg-brand text-white shadow-xs"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900",
              )}
            >
              <Cpu className="size-3.5" />
              <span>{layer}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        {activeSpecs.map((spec) => (
          <div
            key={`${spec.packageOrModule}-${spec.symbol}`}
            className="flex flex-col gap-3 rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-5 transition-all hover:border-zinc-300"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileCode2 className="size-4 text-brand" />
                <span className="font-mono text-xs font-semibold text-zinc-500">
                  {spec.packageOrModule}
                </span>
                <span className="text-zinc-300">•</span>
                <span className="font-mono text-sm font-bold text-zinc-900">
                  {spec.symbol}
                </span>
              </div>
              <span className="rounded-full bg-brand/10 border border-brand/20 px-2.5 py-0.5 text-2xs font-bold text-brand">
                {spec.kind}
              </span>
            </div>

            <CodeBlock code={spec.signature} language="signature" />

            <p className="text-xs leading-relaxed text-zinc-700">{spec.description}</p>

            <div className="flex flex-col gap-1.5 rounded-lg border border-zinc-200/70 bg-white p-3.5">
              <span className="text-2xs font-bold uppercase tracking-wider text-zinc-500">
                Implementation Details & Guarantees
              </span>
              <ul className="flex flex-col gap-1.5">
                {spec.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2 text-xs leading-relaxed text-zinc-600"
                  >
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

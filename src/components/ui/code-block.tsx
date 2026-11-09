"use client";

import { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  readonly code: string;
  readonly title?: string;
  readonly className?: string;
  readonly language?: string;
}

export function CodeBlock({
  code,
  title,
  className,
  language = "bash",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 text-xs font-mono shadow-md",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/90 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <Terminal className="size-3.5 text-lime" />
          <span className="font-mono text-2xs uppercase tracking-wider text-zinc-400">
            {title ?? language}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy code to clipboard"
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-2xs font-sans text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          {copied ? (
            <>
              <Check className="size-3 text-lime" />
              <span className="text-lime">Copied</span>
            </>
          ) : (
            <>
              <Copy className="size-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-lime/95 leading-relaxed selection:bg-brand selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
}

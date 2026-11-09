"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Sparkles, BookOpen, Terminal, Shield } from "lucide-react";
import { FloatingStar, FloatingSparkles } from "@/components/brand/animated-elements";
import { AsteriskDecoration } from "@/components/brand/decorations";

export function DocsHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (badgeRef.current) {
        tl.from(badgeRef.current, { y: -15, opacity: 0, duration: 0.6 });
      }

      if (titleRef.current) {
        tl.from(titleRef.current, { y: 25, opacity: 0, duration: 0.75 }, "-=0.3");
      }

      if (descRef.current) {
        tl.from(descRef.current, { y: 20, opacity: 0, duration: 0.6 }, "-=0.3");
      }

      if (statsRef.current) {
        tl.from(statsRef.current, { y: 15, opacity: 0, duration: 0.5 }, "-=0.2");
      }
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden border-b border-zinc-200/80 bg-linear-to-b from-zinc-50 via-white to-zinc-50/50 py-16"
    >
      <div className="pointer-events-none absolute -top-6 right-8 hidden lg:block">
        <AsteriskDecoration className="size-24 text-lime/40" delay={0.2} />
      </div>
      <div className="pointer-events-none absolute bottom-4 left-6 hidden md:block">
        <FloatingStar size="lg" delay={0.4} />
      </div>
      <div className="pointer-events-none absolute top-12 right-1/4 hidden lg:block">
        <FloatingSparkles delay={0.6} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-4">
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand/5 px-3.5 py-1 text-xs font-semibold text-brand"
          >
            <Sparkles className="size-3.5 fill-brand text-brand" />
            <span>Platform Documentation & Engineering Manual</span>
            <span className="text-zinc-300">•</span>
            <span className="text-zinc-600 font-mono">v1.0.0 Stable</span>
          </div>

          <h1
            ref={titleRef}
            className="text-3xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl"
          >
            Engineering Guides, Multi-OS Runtimes & API Specs
          </h1>

          <p
            ref={descRef}
            className="max-w-3xl text-sm leading-relaxed text-zinc-600 sm:text-base"
          >
            Comprehensive developer manual covering Dockerized orchestration on macOS, Linux, and Windows, exhaustive test suite runners, cryptographic audit chains, and Go 1.27 / Next.js 16 internal function specifications.
          </p>

          <div
            ref={statsRef}
            className="mt-2 flex flex-wrap items-center gap-6 border-t border-zinc-200/80 pt-4 text-xs font-medium text-zinc-600"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="size-4 text-brand" />
              <span>20+ Internal Go Packages</span>
            </div>
            <div className="flex items-center gap-2">
              <Terminal className="size-4 text-brand" />
              <span>Full Cross-Platform Matrix</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-brand" />
              <span>Argon2id + SHA-256 Ledger</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

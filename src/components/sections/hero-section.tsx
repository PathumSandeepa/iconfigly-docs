"use client";

import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { site } from "@/content/site";
import { ArrowBadge } from "@/components/brand/arrow-badge";
import {
  AnimatedStarBadge,
  AsteriskDecoration,
  SparkleDecoration,
} from "@/components/brand/decorations";
import { AppLink } from "@/components/ui/app-link";
import { ButtonLink } from "@/components/ui/button-link";

function InlineArrowPill() {
  const pillRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      if (!pillRef.current) return;
      gsap.to(pillRef.current, {
        scale: 1.05,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    },
    { scope: pillRef },
  );

  return (
    <span
      ref={pillRef}
      aria-hidden
      className="mx-1 inline-flex h-10 w-20 items-center justify-center rounded-full bg-lime align-middle shadow-xs md:mx-3 md:h-14 md:w-28 lg:h-16 lg:w-32 select-none"
    >
      <ArrowRight className="size-7 text-ink md:size-10" strokeWidth={2.2} />
    </span>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      if (badgeRef.current) {
        tl.from(badgeRef.current, {
          y: -20,
          opacity: 0,
          duration: 0.8,
        });
      }

      if (headlineRef.current) {
        tl.from(
          headlineRef.current,
          {
            y: 35,
            opacity: 0,
            duration: 1,
          },
          "-=0.5",
        );
      }

      if (descRef.current) {
        tl.from(
          descRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.6",
        );
      }

      if (actionsRef.current) {
        tl.from(
          actionsRef.current,
          {
            y: 20,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        );
      }
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      className="relative flex flex-col items-center gap-6 pb-12 pt-8 text-center md:pt-14"
    >
      <div className="pointer-events-none absolute left-0 top-6 hidden size-16 md:block lg:left-6">
        <AsteriskDecoration className="size-16" delay={0.2} />
      </div>
      <div className="pointer-events-none absolute right-0 top-6 hidden size-16 md:block lg:right-6">
        <SparkleDecoration className="size-16" delay={0.6} />
      </div>

      <div ref={badgeRef} className="flex flex-wrap items-center justify-center gap-3">
        <AnimatedStarBadge />
        <AppLink
          href="/releases"
          className="group inline-flex items-center gap-2 rounded-full border border-brand/20 bg-white px-4 py-1.5 text-xs font-semibold text-zinc-800 shadow-2xs transition-colors hover:border-brand hover:shadow-xs"
        >
          <span className="flex size-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-brand">v1.0.0 General Availability</span>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-600 group-hover:text-zinc-900">v2.0 In Active Development</span>
        </AppLink>
      </div>

      <h1
        ref={headlineRef}
        className="text-4xl font-extrabold leading-[1.12] tracking-tight text-zinc-900 sm:text-5xl md:text-6xl lg:text-7xl"
      >
        <span className="block">Take Control of Your</span>
        <span className="block">
          Platform
          <InlineArrowPill />
          with One
        </span>
        <span className="block">Control Plane</span>
      </h1>

      <p
        ref={descRef}
        className="max-w-2xl text-base leading-relaxed text-zinc-600 md:text-lg"
      >
        {site.description}
      </p>

      <div
        ref={actionsRef}
        className="flex flex-wrap items-center justify-center gap-4 pt-2"
      >
        <ButtonLink href="/docs" size="lg">
          <ArrowBadge direction="up-left" />
          Documentation
        </ButtonLink>
        <ButtonLink href="/releases" size="lg">
          Release Notes
          <ArrowBadge />
        </ButtonLink>
      </div>
    </section>
  );
}

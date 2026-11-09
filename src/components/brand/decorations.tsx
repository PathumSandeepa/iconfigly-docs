"use client";

import { useRef } from "react";
import { Asterisk, Sparkle, Star } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

interface DecorationProps {
  readonly className?: string;
  readonly delay?: number;
}

export function AsteriskDecoration({ className, delay = 0 }: DecorationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        rotation: 360,
        duration: 16,
        repeat: -1,
        ease: "none",
        delay,
      });
      gsap.to(ref.current, {
        scale: 1.15,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay,
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-flex items-center justify-center select-none", className)}>
      <Asterisk aria-hidden strokeWidth={3.5} className="size-full text-lime" />
    </div>
  );
}

export function SparkleDecoration({ className, delay = 0.5 }: DecorationProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        scale: 1.25,
        opacity: 0.8,
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay,
      });
      gsap.to(ref.current, {
        rotation: 45,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay,
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("inline-flex items-center justify-center select-none", className)}>
      <Sparkle aria-hidden strokeWidth={1.5} className="size-full fill-lime text-lime" />
    </div>
  );
}

export function AnimatedStarBadge({ className }: { readonly className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.to(ref.current, {
        y: -4,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      });
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-lime/60 bg-lime/10 px-3 py-1 text-xs font-semibold text-zinc-900 shadow-2xs backdrop-blur-xs select-none",
        className,
      )}
    >
      <Star className="size-3.5 fill-lime text-lime" />
      <span>Production Core</span>
    </div>
  );
}

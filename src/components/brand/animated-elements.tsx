"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Sparkles, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingStarProps {
  readonly className?: string;
  readonly size?: "sm" | "md" | "lg";
  readonly delay?: number;
}

export function FloatingStar({ className, size = "md", delay = 0 }: FloatingStarProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.to(containerRef.current, {
        y: -10,
        rotation: 180,
        duration: 3.5,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        delay,
      });
      gsap.to(containerRef.current, {
        scale: 1.2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay + 0.5,
      });
    },
    { scope: containerRef },
  );

  const sizeClasses = {
    sm: "size-4",
    md: "size-6",
    lg: "size-9",
  }[size];

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-flex items-center justify-center select-none text-lime drop-shadow-xs",
        className,
      )}
    >
      <Star className={cn(sizeClasses, "fill-lime stroke-lime")} />
    </div>
  );
}

interface FloatingSparklesProps {
  readonly className?: string;
  readonly delay?: number;
}

export function FloatingSparkles({ className, delay = 0.3 }: FloatingSparklesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      gsap.to(containerRef.current, {
        scale: 1.3,
        opacity: 0.9,
        duration: 1.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay,
      });
      gsap.to(containerRef.current, {
        rotation: 90,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay,
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "inline-flex items-center justify-center select-none text-lime drop-shadow-xs",
        className,
      )}
    >
      <Sparkles className="size-6 fill-lime stroke-brand" />
    </div>
  );
}

interface AnimatedTextRevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

export function AnimatedTextReveal({
  children,
  className,
  delay = 0.1,
}: AnimatedTextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.from(ref.current, {
        y: 28,
        opacity: 0,
        duration: 0.85,
        ease: "power3.out",
        delay,
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

interface StaggeredContainerProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly selector?: string;
  readonly stagger?: number;
  readonly delay?: number;
}

export function StaggeredContainer({
  children,
  className,
  selector = "[data-animate]",
  stagger = 0.1,
  delay = 0.2,
}: StaggeredContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const elements = containerRef.current.querySelectorAll(selector);
      if (elements.length === 0) return;

      gsap.from(elements, {
        y: 35,
        opacity: 0,
        duration: 0.75,
        stagger,
        ease: "power2.out",
        delay,
      });
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

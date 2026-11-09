"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { showcaseTiles } from "@/content/showcase";
import { ShowcaseTile } from "@/components/sections/showcase-tile";

export function ShowcaseSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!containerRef.current) return;
      const tiles = containerRef.current.querySelectorAll(".showcase-tile-item");
      gsap.from(tiles, {
        y: 45,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.4,
      });
    },
    { scope: containerRef },
  );

  return (
    <section
      ref={containerRef}
      aria-label="Product highlights"
      className="flex items-center justify-center gap-3 pb-16 md:gap-5"
    >
      {showcaseTiles.map((tile) => (
        <div key={tile.id} className="showcase-tile-item flex flex-1 min-w-0">
          <ShowcaseTile tile={tile} />
        </div>
      ))}
    </section>
  );
}

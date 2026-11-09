import { cva } from "class-variance-authority";
import type { ShowcaseTile as ShowcaseTileModel } from "@/domain/showcase";
import { FeatureIcon } from "@/components/icons/feature-icon";
import { cn } from "@/lib/utils";

const tileVariants = cva(
  "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-3 rounded-[1.75rem] px-2 text-center",
  {
    variants: {
      tone: {
        brand: "bg-brand text-lime",
        ink: "bg-ink text-white",
      },
      emphasis: {
        compact: "hidden h-36 sm:flex md:h-48 lg:h-56",
        tall: "h-44 md:h-60 lg:h-72",
        hero: "h-56 flex-[1.2] md:h-72 lg:h-[22rem]",
      },
    },
  },
);

const accentPositions: readonly string[] = [
  "left-3 top-6 md:left-5",
  "right-3 top-3 md:right-5",
  "bottom-4 left-1/2 -translate-x-1/2 md:bottom-6",
];

export function ShowcaseTile({ tile }: { readonly tile: ShowcaseTileModel }) {
  return (
    <div className={cn(tileVariants({ tone: tile.tone, emphasis: tile.emphasis }))}>
      {tile.accents.map((accent, index) => (
        <span
          key={accent}
          className={`absolute inline-flex size-9 items-center justify-center rounded-xl bg-white text-brand md:size-10 ${accentPositions[index]}`}
        >
          <FeatureIcon name={accent} className="size-5" />
        </span>
      ))}
      <FeatureIcon name={tile.icon} className="size-12 md:size-16 lg:size-20" strokeWidth={1.5} />
      <span className="text-xs font-medium text-white md:text-sm">{tile.label}</span>
    </div>
  );
}

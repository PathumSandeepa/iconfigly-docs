import { ArrowUpLeft, ArrowUpRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const arrowBadgeVariants = cva("inline-flex size-10 shrink-0 items-center justify-center rounded-full", {
  variants: {
    tone: {
      lime: "bg-lime text-ink",
      brand: "bg-brand text-white",
    },
  },
  defaultVariants: {
    tone: "lime",
  },
});

type ArrowBadgeProps = VariantProps<typeof arrowBadgeVariants> & {
  readonly direction?: "up-left" | "up-right";
  readonly className?: string;
};

export function ArrowBadge({ tone, direction = "up-right", className }: ArrowBadgeProps) {
  const Arrow = direction === "up-left" ? ArrowUpLeft : ArrowUpRight;

  return (
    <span aria-hidden className={cn(arrowBadgeVariants({ tone }), className)}>
      <Arrow className="size-5" strokeWidth={2.5} />
    </span>
  );
}

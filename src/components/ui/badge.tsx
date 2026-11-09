import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      variant: {
        brand: "bg-brand text-white",
        soft: "bg-brand/10 text-brand",
        lime: "bg-lime text-ink",
        outline: "border border-ink/20 bg-white text-ink/70",
        highlight: "border-2 border-lime bg-white text-inherit",
      },
    },
    defaultVariants: {
      variant: "brand",
    },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

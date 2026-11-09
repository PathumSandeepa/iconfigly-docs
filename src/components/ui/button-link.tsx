import type { ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AppLink } from "@/components/ui/app-link";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full border-2 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
  {
    variants: {
      variant: {
        pill: "border-lime bg-white text-ink hover:bg-lime/25",
        solid: "border-brand bg-brand text-white hover:bg-brand/90",
        lime: "border-lime bg-lime text-ink hover:bg-lime/90",
      },
      size: {
        default: "h-10 gap-2 px-5 text-sm",
        lg: "h-14 gap-3 pl-2.5 pr-7 text-base md:text-lg",
      },
    },
    defaultVariants: {
      variant: "pill",
      size: "default",
    },
  },
);

type ButtonLinkProps = ComponentProps<"a"> &
  VariantProps<typeof buttonVariants> & { href: string };

export function ButtonLink({ className, variant, size, ...props }: ButtonLinkProps) {
  return <AppLink className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

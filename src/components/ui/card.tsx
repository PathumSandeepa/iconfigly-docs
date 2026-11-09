import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("rounded-3xl border-2 border-brand bg-white text-ink", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: ComponentProps<"h3">) {
  return <h3 className={cn("text-xl font-semibold leading-tight", className)} {...props} />;
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-sm leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-4", className)} {...props} />;
}

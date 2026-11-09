import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Separator({ className, ...props }: ComponentProps<"div">) {
  return <div role="separator" className={cn("h-0.5 w-full bg-brand", className)} {...props} />;
}

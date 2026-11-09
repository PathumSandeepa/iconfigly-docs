import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageFrame({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12", className)}>
      {children}
    </div>
  );
}

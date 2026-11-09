import { cn } from "@/lib/utils";

export function LogoMark({ className }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden className={cn("size-8", className)}>
      <rect width="32" height="32" rx="9" className="fill-brand" />
      <path
        d="M16 6.5L24.5 11.25V20.75L16 25.5L7.5 20.75V11.25L16 6.5Z"
        className="stroke-lime"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 6.5V16M24.5 20.75L16 16M7.5 20.75L16 16" className="stroke-lime" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="3" className="fill-lime" />
    </svg>
  );
}

export function Logo({ name }: { readonly name: string }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-ink">
      <LogoMark />
      {name}
    </span>
  );
}

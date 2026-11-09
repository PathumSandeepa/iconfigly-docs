import type { ComponentProps } from "react";
import Link from "next/link";

const EXTERNAL_URL = /^https?:\/\//;

export function AppLink({ href, children, ...props }: ComponentProps<"a"> & { href: string }) {
  if (EXTERNAL_URL.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  );
}

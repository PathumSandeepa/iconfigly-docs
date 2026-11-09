import type { NavigationLink } from "@/domain/navigation";
import { site } from "@/content/site";

export const primaryNavigation: readonly NavigationLink[] = [
  { label: "Product", href: "/" },
  { label: "Architecture", href: "/architecture" },
  { label: "Docs", href: "/docs" },
  { label: "Release Notes", href: "/releases" },
  { label: "Roadmap", href: "/roadmap" },
];

export const leadingLinks: readonly NavigationLink[] = primaryNavigation;

export const trailingLinks: readonly NavigationLink[] = [];

export const consoleLink: NavigationLink = {
  label: "Launch Console",
  href: site.links.console,
};

import type { ShowcaseTile } from "@/domain/showcase";

export const showcaseTiles: readonly ShowcaseTile[] = [
  {
    id: "catalog",
    label: "Service Catalog",
    icon: "boxes",
    tone: "brand",
    emphasis: "compact",
    accents: [],
  },
  {
    id: "graph",
    label: "Dependency Graph",
    icon: "network",
    tone: "ink",
    emphasis: "tall",
    accents: [],
  },
  {
    id: "context",
    label: "Single-Pane Context",
    icon: "layers",
    tone: "brand",
    emphasis: "hero",
    accents: ["database", "lock", "git-branch"],
  },
  {
    id: "rbac",
    label: "Scoped RBAC",
    icon: "shield-check",
    tone: "ink",
    emphasis: "tall",
    accents: [],
  },
  {
    id: "audit",
    label: "Audit Trail",
    icon: "scroll-text",
    tone: "brand",
    emphasis: "compact",
    accents: [],
  },
];

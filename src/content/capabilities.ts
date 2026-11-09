import type { Capability } from "@/domain/capability";

export const capabilities: readonly Capability[] = [
  {
    id: "catalog",
    title: "Service Catalog",
    summary:
      "Register services and shared resources across DEV, QA, UAT and PROD, then map every binding and dependency.",
    visual: "catalog",
    highlighted: false,
  },
  {
    id: "access",
    title: "Scoped Access",
    summary:
      "Grant roles at organization, project or environment scope and see exactly who has access to what.",
    visual: "access",
    highlighted: true,
  },
  {
    id: "audit",
    title: "Immutable Audit",
    summary:
      "Every change is written to an append-only, hash-chained log you can verify at any time.",
    visual: "audit",
    highlighted: false,
  },
];

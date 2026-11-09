import type { AccessRow, AuditEntry, SampleResource } from "@/domain/sample";

export const environmentTiers: readonly string[] = ["DEV", "QA", "UAT", "PROD"];

export const sampleResources: readonly SampleResource[] = [
  { name: "core-banking-db", kind: "POSTGRES", icon: "database" },
  { name: "session-cache", kind: "REDIS", icon: "server" },
  { name: "events-bus", kind: "KAFKA", icon: "container" },
];

export const accessColumns: readonly string[] = ["DEV", "UAT", "PROD"];

export const accessRows: readonly AccessRow[] = [
  { team: "Payments", levels: ["write", "read", "none"] },
  { team: "Platform", levels: ["write", "write", "read"] },
];

export const auditChain: readonly AuditEntry[] = [
  { action: "service.created", hash: "9f2c41" },
  { action: "binding.attached", hash: "c07a9e" },
  { action: "role.granted", hash: "4be1d8" },
];

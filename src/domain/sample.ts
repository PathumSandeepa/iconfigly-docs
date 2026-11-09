import type { IconName } from "@/domain/icon";

export type AccessLevel = "write" | "read" | "none";

export interface AccessRow {
  readonly team: string;
  readonly levels: readonly AccessLevel[];
}

export interface AuditEntry {
  readonly action: string;
  readonly hash: string;
}

export interface SampleResource {
  readonly name: string;
  readonly kind: string;
  readonly icon: IconName;
}

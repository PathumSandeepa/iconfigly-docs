export interface ArchitectureDecision {
  readonly id: string;
  readonly area: string;
  readonly decision: string;
  readonly rationale: string;
  readonly alternative: string;
}

export interface BoundedContextInfo {
  readonly name: string;
  readonly pkg: string;
  readonly category: "Core" | "Catalog" | "Governance" | "Shared";
  readonly summary: string;
  readonly keyArtifacts: readonly string[];
}

export type CapabilityVisual = "catalog" | "access" | "audit";

export interface Capability {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly visual: CapabilityVisual;
  readonly highlighted: boolean;
}

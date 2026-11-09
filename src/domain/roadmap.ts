export type RoadmapStatus = "live" | "in_progress" | "planned";

export interface RoadmapPhase {
  readonly version: string;
  readonly title: string;
  readonly summary: string;
  readonly status: RoadmapStatus;
}

export function isLivePhase(phase: RoadmapPhase): boolean {
  return phase.status === "live";
}

export function isInProgressPhase(phase: RoadmapPhase): boolean {
  return phase.status === "in_progress";
}

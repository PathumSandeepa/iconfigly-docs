export interface SubPhaseRelease {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly scope: string;
  readonly deliverable: string;
}

export interface ReleaseVersion {
  readonly version: string;
  readonly title: string;
  readonly label: string;
  readonly status: "shipped" | "in_progress" | "planned";
  readonly releaseDate: string;
  readonly summary: string;
  readonly highlights: readonly string[];
  readonly subPhases: readonly SubPhaseRelease[];
}

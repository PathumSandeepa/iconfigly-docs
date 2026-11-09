import type { IconName } from "@/domain/icon";

export type ShowcaseTone = "brand" | "ink";

export type ShowcaseEmphasis = "compact" | "tall" | "hero";

export interface ShowcaseTile {
  readonly id: string;
  readonly label: string;
  readonly icon: IconName;
  readonly tone: ShowcaseTone;
  readonly emphasis: ShowcaseEmphasis;
  readonly accents: readonly IconName[];
}

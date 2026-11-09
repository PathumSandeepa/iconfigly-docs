import type { QuickStartStep } from "@/domain/quick-start";

export const quickStartSteps: readonly QuickStartStep[] = [
  {
    title: "Start the stack",
    command: "docker compose up -d",
  },
  {
    title: "Apply migrations",
    command: "docker compose --profile tools run --rm migrate",
  },
  {
    title: "Open the console",
    command: "http://localhost:3000",
  },
];

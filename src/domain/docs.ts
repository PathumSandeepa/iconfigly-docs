export interface DocSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly codeExample?: string;
  readonly bulletPoints: readonly string[];
}

export interface DocCategory {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly sections: readonly DocSection[];
}

export interface OSPlatformGuide {
  readonly os: "mac" | "linux" | "windows";
  readonly name: string;
  readonly badge: string;
  readonly prerequisites: readonly string[];
  readonly bootstrapCommands: string;
  readonly testCommands: string;
  readonly architectureNotes: readonly string[];
}

export interface CodeReferenceSpec {
  readonly layer: "API Backend (Go 1.27)" | "Web Frontend (Next.js 16)";
  readonly packageOrModule: string;
  readonly symbol: string;
  readonly kind: "Handler" | "Service" | "Repository" | "Middleware" | "Route Handler" | "Component";
  readonly signature: string;
  readonly description: string;
  readonly details: readonly string[];
}

export interface TestSuiteCommand {
  readonly name: string;
  readonly target: "api" | "web" | "infra";
  readonly command: string;
  readonly purpose: string;
  readonly expectation: string;
}

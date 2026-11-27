import type { SiteProfile } from "@/domain/site";

const env = typeof process !== "undefined" ? process.env : undefined;
const consoleUrl = env?.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const appVersion = (env?.NEXT_PUBLIC_APP_VERSION ?? "1.0.0").replace(/^v/, "");

export const site: SiteProfile = {
  name: "iconfigly",
  title: "iconfigly — Open-Source Developer Control Plane",
  description:
    "Self-hosted Internal Developer Platform built in Go and Next.js. Catalog microservices and shared infrastructure across environments, enforce scoped RBAC with ancestor inheritance, and verify changes with cryptographic audit chains.",
  version: appVersion,
  author: {
    name: "Pathum Sandeepa",
    role: "Core Platform Architect",
  },
  links: {
    console: consoleUrl,
    docs: "https://github.com/PathumSandeepa/iconfigly-docs",
    api: "https://github.com/PathumSandeepa/iconfigly-api",
    web: "https://github.com/PathumSandeepa/iconfigly-web",
  },
};

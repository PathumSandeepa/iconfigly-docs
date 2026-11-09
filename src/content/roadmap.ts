import type { RoadmapPhase } from "@/domain/roadmap";

export const roadmapPhases: readonly RoadmapPhase[] = [
  {
    version: "v1",
    title: "Foundation Core",
    summary:
      "Production-ready modular monolith, multi-environment service & resource catalog, scoped RBAC engine, and SHA-256 hash-chained immutable audit log.",
    status: "live",
  },
  {
    version: "v2",
    title: "Change Safety & Impact",
    summary:
      "Automated graph-based blast-radius impact analysis, versioned configuration items, multi-approver governance, temporary access leases, and transactional outbox.",
    status: "in_progress",
  },
  {
    version: "v3",
    title: "Secrets Engine & Dynamic Leases",
    summary:
      "OpenBao / HashiCorp Vault integration, zero-leakage credential leases, break-glass elevation guardrails, and cryptographic secret rotation.",
    status: "planned",
  },
  {
    version: "v4",
    title: "Developer CLI & Polyglot SDKs",
    summary:
      "High-performance Go CLI (iconfigly-cli), TypeScript, Go, and Java client SDKs, runtime bundle delivery, rollout tracking, and drift detection.",
    status: "planned",
  },
  {
    version: "v5",
    title: "Kubernetes Operator & Helm",
    summary:
      "Cloud-native Kubernetes deployment via Helm and kind, cluster workload state inspector, and the declarative iconfigly-operator controller.",
    status: "planned",
  },
  {
    version: "v6",
    title: "Enterprise Identity & GitOps",
    summary:
      "SAML / OIDC SSO, GitHub repository and CI/CD synchronization, Argo CD GitOps correlation, and Slack / Teams ChatOps notifications.",
    status: "planned",
  },
  {
    version: "v7",
    title: "Production Observability & Hardening",
    summary:
      "Native Prometheus metrics, OpenTelemetry distributed tracing, Grafana operational dashboards, disaster recovery runbooks, and k6 load tests.",
    status: "planned",
  },
  {
    version: "v8",
    title: "Open-Source Launch & Packaging",
    summary:
      "Multi-arch container distribution via GHCR, GoReleaser artifacts, OCI Helm registries, 60-second interactive demo sandbox, and supply-chain SLSA security.",
    status: "planned",
  },
  {
    version: "v9",
    title: "Declarative Policy & Incident Lock-Down",
    summary:
      "Policy-as-code governance engine, scheduled change-freeze windows, one-click incident lock-down mode, and guardrailed troubleshooting assistants.",
    status: "planned",
  },
];

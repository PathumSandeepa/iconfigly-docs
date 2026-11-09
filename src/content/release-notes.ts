import type { ReleaseVersion } from "@/domain/release";

export const v1ReleaseNotes: ReleaseVersion = {
  version: "1.0.0",
  title: "Foundation, Microservice Catalog, Scoped RBAC & Immutable Audit",
  label: "General Availability",
  status: "shipped",
  releaseDate: "November 2026",
  summary:
    "The initial production release of iconfigly establishes the foundational developer control plane. It delivers a self-hosted, modular monolith API in Go, an enterprise Next.js console, multi-tier environment topology, granular hierarchical access control, and a tamper-evident audit ledger.",
  highlights: [
    "Zero-Cloud-Cost Local Stack: PostgreSQL 18, Go 1.27.2 API, and Next.js 16.4.5 in Docker Compose",
    "Go Standard Library net/http Router: High-throughput routing with sub-millisecond response latency",
    "PostgreSQL 18 Native uuidv7(): Time-ordered primary keys eliminating B-tree index page splits",
    "Multi-Tier Topology: DEV, QA, UAT, and PROD environments with service-to-resource binding matrices",
    "Granular Scoped RBAC: Hierarchical evaluation engine with ancestor inheritance and reverse-lookup inspection",
    "Cryptographic Audit Ledger: Trigger-enforced append-only PostgreSQL table with SHA-256 hash chains",
    "Same-Origin BFF Gateway: Next.js route proxy eliminating cross-origin cookie complexity",
  ],
  subPhases: [
    {
      id: "sub-1.0",
      code: "Sub-Phase 1.0",
      title: "Containerized Infrastructure & Environment Bootstrap",
      scope: "iconfigly-infra",
      deliverable:
        "Docker Compose orchestration with healthcheck-gated PostgreSQL 18, Go 1.27.2 API server, Next.js web console, golang-migrate runner, and persistent volume topology.",
    },
    {
      id: "sub-1.1",
      code: "Sub-Phase 1.1",
      title: "Core Go API Engine & Clean Architecture Bootstrap",
      scope: "iconfigly-api",
      deliverable:
        "Go Modular Monolith skeleton adhering to Clean Architecture with strict package boundaries in internal/, implicit interface contracts, and standard library net/http routing.",
    },
    {
      id: "sub-1.2",
      code: "Sub-Phase 1.2",
      title: "Shared Kernel, Middleware & RFC 9457 Problem Details",
      scope: "iconfigly-api/internal/shared",
      deliverable:
        "Standardized RFC 7807 / 9457 error serialization, contextual deadline propagation, structured logger, and atomic transaction manager abstraction.",
    },
    {
      id: "sub-1.3",
      code: "Sub-Phase 1.3",
      title: "Relational Data Model & PostgreSQL Migrations",
      scope: "iconfigly-api/migrations",
      deliverable:
        "Fifteen relational tables with UUIDv7 primary keys, check constraints, foreign keys with cascade policies, and pgxpool thread-safe connection pooling.",
    },
    {
      id: "sub-1.4",
      code: "Sub-Phase 1.4",
      title: "Organization & Identity Bounded Contexts",
      scope: "iconfigly-api/internal/{organization,user,auth}",
      deliverable:
        "Multi-tenant tenant isolation, Argon2id password hashing, revocable server-side PostgreSQL sessions with sliding expiration, HttpOnly cookies, and prefix-indexed PATs.",
    },
    {
      id: "sub-1.5",
      code: "Sub-Phase 1.5",
      title: "Team Bounded Context & Member Rosters",
      scope: "iconfigly-api/internal/team",
      deliverable:
        "Collaborative team aggregates, member rosters with LEAD and MEMBER roles, and team-level permission inheritance.",
    },
    {
      id: "sub-1.6",
      code: "Sub-Phase 1.6",
      title: "Service & Infrastructure Resource Catalog",
      scope: "iconfigly-api/internal/{project,environment,service,resource,binding}",
      deliverable:
        "Cross-environment catalog supporting DEV, QA, UAT, PROD lifecycle tiers, cloud infrastructure resources (Postgres, Redis, Kafka, S3, APIs), and many-to-many binding matrices.",
    },
    {
      id: "sub-1.7",
      code: "Sub-Phase 1.7",
      title: "Scoped Hierarchical RBAC & Who-Has-Access Engine",
      scope: "iconfigly-api/internal/access",
      deliverable:
        "Hierarchical authorization engine evaluating Org -> Project -> Environment -> Resource scope trees with ancestor inheritance and reverse-lookup permission inspection.",
    },
    {
      id: "sub-1.8",
      code: "Sub-Phase 1.8",
      title: "Cryptographically Chained Immutable Audit Trail",
      scope: "iconfigly-api/internal/audit",
      deliverable:
        "Append-only PostgreSQL triggers blocking UPDATE and DELETE mutations, SHA-256 hash chains linking each event to its predecessor, and verification endpoints.",
    },
    {
      id: "sub-1.9",
      code: "Sub-Phase 1.9",
      title: "Next.js 16 Developer Control Plane Console",
      scope: "iconfigly-web",
      deliverable:
        "Production dashboard with App Router, Turbopack, Tailwind CSS v4, Lucide React, Shadcn UI primitives, responsive navigation, and same-origin BFF proxying.",
    },
    {
      id: "sub-1.10",
      code: "Sub-Phase 1.10",
      title: "Comprehensive Test Suites & CI Verification",
      scope: "All Repositories",
      deliverable:
        "Complete automated test coverage: Go unit tests, PostgreSQL integration tests, Playwright end-to-end user workflows, and GitHub Actions CI pipelines.",
    },
  ],
};

export const v2DevelopmentMilestone: ReleaseVersion = {
  version: "2.0.0",
  title: "Change-Safety Core, Blast-Radius Impact Analysis & Approvals",
  label: "In Active Development",
  status: "in_progress",
  releaseDate: "Target: Q1 2027",
  summary:
    "Engineering has commenced on Phase 2. This milestone transforms iconfigly from a static catalog into an active change governance platform, featuring graph-based blast radius impact calculations, multi-approver workflows, dynamic temporary access, and transactional outbox event delivery.",
  highlights: [
    "Blast-Radius Impact Analysis: Directed graph traversal calculating downstream blast radius before mutations take effect",
    "Versioned Configuration Items: Key-value configuration versioning with unified visual diffs and instant point-in-time rollbacks",
    "Multi-Approver Change Governance: Guardrailed review workflows requiring peer approvals for sensitive environments",
    "Time-Boxed Temporary Access: Self-service privilege escalation with cryptographic lease expiration and automatic revocation",
    "Transactional Outbox Pattern: Zero-loss background event dispatching with Mailpit notifications and webhooks",
    "AES-256-GCM Envelope Encryption: Hardware-accelerated local secret encryption with zero-leakage provider interfaces",
  ],
  subPhases: [
    {
      id: "sub-2.0",
      code: "Sub-Phase 2.0",
      title: "Mailpit Notification Infrastructure & Envelope Encryption",
      scope: "iconfigly-infra & iconfigly-api",
      deliverable:
        "Mailpit SMTP test harness in Docker Compose, and shared kernel AES-256-GCM envelope encryption for secret references.",
    },
    {
      id: "sub-2.2",
      code: "Sub-Phase 2.2",
      title: "Versioned Configuration Item Core",
      scope: "iconfigly-api/internal/configitem",
      deliverable:
        "Key-value configuration versioning, structural schema validation, environment override inheritance, and visual diff generation.",
    },
    {
      id: "sub-2.4",
      code: "Sub-Phase 2.4",
      title: "Automated Blast-Radius Impact Analysis Engine",
      scope: "iconfigly-api/internal/impact",
      deliverable:
        "Graph traversal algorithm evaluating microservice dependency topology to compute affected downstream consumers prior to change execution.",
    },
    {
      id: "sub-2.5",
      code: "Sub-Phase 2.5",
      title: "Change Request & Multi-Approver Governance",
      scope: "iconfigly-api/internal/{change,approval}",
      deliverable:
        "Formal change request lifecycle (Draft, Pending Approval, Approved, Rejected, Applied) with configurable approver policies.",
    },
    {
      id: "sub-2.6",
      code: "Sub-Phase 2.6",
      title: "Temporary Access Approval & Dynamic Leases",
      scope: "iconfigly-api/internal/access",
      deliverable:
        "Time-boxed role grants with automated lease expiration, emergency break-glass elevation, and audit-linked reasoning.",
    },
    {
      id: "sub-2.7",
      code: "Sub-Phase 2.7",
      title: "Transactional Outbox & Background Notification Workers",
      scope: "iconfigly-api/internal/{notification,worker}",
      deliverable:
        "Reliable PostgreSQL-backed outbox queue with polling worker pools, email delivery via Mailpit, and webhook dispatchers.",
    },
  ],
};

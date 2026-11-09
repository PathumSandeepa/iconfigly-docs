import type { ArchitectureDecision, BoundedContextInfo } from "@/domain/architecture";

export const architectureDecisions: readonly ArchitectureDecision[] = [
  {
    id: "ADR-001",
    area: "Backend Architecture",
    decision: "DDD Modular Monolith in Go 1.27.2",
    rationale:
      "A single deployable binary with strict internal domain boundaries in internal/ eliminates distributed transaction failures and network latency while preserving clean module isolation.",
    alternative: "Microservices (rejected: unwarranted operational complexity for a core control plane).",
  },
  {
    id: "ADR-002",
    area: "HTTP Transport",
    decision: "Go Standard Library net/http ServeMux",
    rationale:
      "Go 1.22+ ServeMux natively supports method-matching and wildcard path parameters without external dependencies or heavy reflection wrappers.",
    alternative: "Gin / Fiber (rejected: incompatible custom context types and reflection overhead).",
  },
  {
    id: "ADR-003",
    area: "Data Engine & Identifiers",
    decision: "PostgreSQL 18 + Native uuidv7()",
    rationale:
      "ACID transactional safety combined with native time-ordered UUIDv7 primary keys prevents B-tree index fragmentation on high-write tables.",
    alternative: "Random UUIDv4 (rejected: causes frequent B-tree page splits on high insert volumes).",
  },
  {
    id: "ADR-004",
    area: "Data Access Layer",
    decision: "pgx/v5 Connection Pool + Repository Interfaces",
    rationale:
      "pgxpool delivers maximal performance and explicit SQL query plan control, hidden behind DDD repository interfaces for clean test mocking.",
    alternative: "GORM (rejected: reflection-heavy queries hide SQL execution plans and leak persistence structs).",
  },
  {
    id: "ADR-005",
    area: "Schema Migrations",
    decision: "golang-migrate via Docker Compose Tools Profile",
    rationale:
      "Deterministic version-controlled .up.sql and .down.sql files executed in an isolated container maintain safe database state transitions.",
    alternative: "ORM auto-migrate (rejected: cannot reliably manage custom triggers and partial indexes).",
  },
  {
    id: "ADR-007",
    area: "Browser Authentication",
    decision: "Argon2id + Revocable Server-Side Sessions",
    rationale:
      "HttpOnly, SameSite=Lax cookies backed by SHA-256 hashed sessions in PostgreSQL allow instantaneous revocation on policy changes or credential resets.",
    alternative: "Stateless JWTs in localStorage (rejected: vulnerable to XSS exfiltration and unrevocable).",
  },
  {
    id: "ADR-009",
    area: "Authorization Model",
    decision: "Hierarchical Scoped RBAC (authz.Can)",
    rationale:
      "Evaluates permissions across an ancestor scope tree: Organization -> Project -> Environment -> Service/Resource, supporting time-bound leases and role inheritance.",
    alternative: "Flat organization roles (rejected: cannot represent environment-specific developer restrictions).",
  },
  {
    id: "ADR-010",
    area: "Audit Trail Integrity",
    decision: "Append-Only PostgreSQL Trigger + SHA-256 Hash Chain",
    rationale:
      "Database-level triggers block UPDATE and DELETE mutations, while each audit event hashes the previous record hash alongside its own payload to form a tamper-evident cryptographic chain.",
    alternative: "Standard mutable log table (rejected: vulnerable to silent tampering by compromised accounts).",
  },
  {
    id: "ADR-011",
    area: "Frontend Networking",
    decision: "Next.js Server-Side Same-Origin Proxy (/api/v1/[...path])",
    rationale:
      "The browser communicates solely with the Next.js origin, which forwards requests over the internal Docker network to the Go API, eliminating cross-origin cookie issues.",
    alternative: "Direct browser-to-API calls (rejected: exposes internal hostnames and requires complex CORS setup).",
  },
  {
    id: "ADR-012",
    area: "Error Contract",
    decision: "RFC 9457 Problem Details (application/problem+json)",
    rationale:
      "Machine-readable structured error objects containing type, title, status, detail, instance, and request_id provide unambiguous error contracts across all clients.",
    alternative: "Ad-hoc JSON strings (rejected: inconsistent client error parsing across web and future SDKs).",
  },
];

export const boundedContexts: readonly BoundedContextInfo[] = [
  {
    name: "Identity & Auth Context",
    pkg: "internal/auth & internal/user",
    category: "Core",
    summary:
      "Manages user principals, Argon2id password verification, PostgreSQL session lifecycles, and constant-time Personal Access Token validation.",
    keyArtifacts: ["SessionStore", "TokenGenerator", "AuthMiddleware", "Argon2Hasher"],
  },
  {
    name: "Catalog & Topology Context",
    pkg: "internal/{service,resource,binding}",
    category: "Catalog",
    summary:
      "Maintains the microservice catalog, cloud infrastructure resources (Postgres, Redis, Kafka, S3, APIs), and many-to-many environment bindings.",
    keyArtifacts: ["ServiceCatalog", "ResourceRegistry", "BindingMatrix", "DependencyGraph"],
  },
  {
    name: "Scoped RBAC Context",
    pkg: "internal/access",
    category: "Governance",
    summary:
      "Enforces hierarchical authorization with ancestor inheritance, evaluate scope trees, and powers the reverse-lookup Who Has Access inspector.",
    keyArtifacts: ["PermissionEvaluator", "RoleBindingRepo", "ScopeTree", "AccessInspector"],
  },
  {
    name: "Immutable Audit Context",
    pkg: "internal/audit",
    category: "Governance",
    summary:
      "Records all state changes into an append-only, trigger-protected PostgreSQL table with cryptographic SHA-256 hash chaining and on-demand verification.",
    keyArtifacts: ["AuditRecorder", "HashChainValidator", "TamperDetector", "EventQuery"],
  },
  {
    name: "Shared Kernel & Transport",
    pkg: "internal/shared & internal/server",
    category: "Shared",
    summary:
      "Provides RFC 9457 Problem Details serializers, contextual deadline propagation, standard library HTTP routing, and database transaction managers.",
    keyArtifacts: ["ProblemWriter", "TxManager", "UUIDv7Generator", "ServeMuxPipeline"],
  },
];

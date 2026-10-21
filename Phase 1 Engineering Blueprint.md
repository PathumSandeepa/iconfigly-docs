# iconfigly — Phase 1 Engineering Blueprint: Foundation, DDD Catalog, Scoped RBAC & Immutable Audit

> **Document Scope:** Phase 1 Complete Engineering Plan (Sub-Phase 1.0 to Sub-Phase 1.10)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Modular Monolith
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; learning Go and DevOps from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 1 Executive Summary & Scope](#1-phase-1-executive-summary--scope)
2. [Phase 1 Architectural Decisions & Rationale (ADRs)](#2-phase-1-architectural-decisions--rationale-adrs)
3. [Domain-Driven Design (DDD), Clean Code & Go Best Practices](#3-domain-driven-design-ddd-clean-code--go-best-practices)
4. [Complete Phase 1 Folder & File Evolution](#4-complete-phase-1-folder--file-evolution)
5. [Sub-Phase 1.0: Containerized Infrastructure & Workspace Bootstrap (`iconfigly-infra`)](#5-sub-phase-10-containerized-infrastructure--workspace-bootstrap-iconfigly-infra)
6. [Sub-Phase 1.1: Core API Bootstrap (`iconfigly-api` Initial Skeleton)](#6-sub-phase-11-core-api-bootstrap-iconfigly-api-initial-skeleton)
7. [Sub-Phase 1.2: Shared Kernel, Middleware, Readiness & Transaction Manager](#7-sub-phase-12-shared-kernel-middleware-readiness--transaction-manager)
8. [Sub-Phase 1.3: Relational Data Model & Database Migrations (`000001`–`000009`)](#8-sub-phase-13-relational-data-model--database-migrations-000001000009)
9. [Sub-Phase 1.4: Organization & Identity Bounded Contexts (`organization`, `user`, `auth`)](#9-sub-phase-14-organization--identity-bounded-contexts-organization-user-auth)
10. [Sub-Phase 1.5: Team Bounded Context (`team`)](#10-sub-phase-15-team-bounded-context-team)
11. [Sub-Phase 1.6: Service & Resource Catalog Bounded Context (`project`, `environment`, `service`, `resource`, `binding`)](#11-sub-phase-16-service--resource-catalog-bounded-context-project-environment-service-resource-binding)
12. [Sub-Phase 1.7: Access Control & Scoped RBAC Bounded Context (`access`)](#12-sub-phase-17-access-control--scoped-rbac-bounded-context-access)
13. [Sub-Phase 1.8: Immutable Audit Trail Bounded Context (`audit`)](#13-sub-phase-18-immutable-audit-trail-bounded-context-audit)
14. [Sub-Phase 1.9: Next.js Web Dashboard Architecture & UI (`iconfigly-web`)](#14-sub-phase-19-nextjs-web-dashboard-architecture--ui-iconfigly-web)
15. [Sub-Phase 1.10: Comprehensive Testing Strategy, CI Pipelines & Phase 1 Verification](#15-sub-phase-110-comprehensive-testing-strategy-ci-pipelines--phase-1-verification)

---

## 1. Phase 1 Executive Summary & Scope

### 1.1 Phase 1 Objective
Phase 1 establishes the foundational control plane of **iconfigly**. By the end of Phase 1, an engineering organization can deploy the platform via Docker Compose, initialize their organization, manage users and teams, catalog all microservices and shared infrastructure resources across environments (`DEV`, `QA`, `UAT`, `PROD`), map service-to-resource and service-to-service dependencies, enforce granular Role-Based Access Control (RBAC), inspect effective permissions via a *"Who Has Access?"* engine, and verify every state change in a tamper-evident, hash-chained audit log.

### 1.2 Why Phase 1 Comes First
Advanced capabilities in later phases—such as automated blast-radius impact analysis, multi-approver change requests, OpenBao secret rotation, and instance rollout tracking—cannot exist without a single source of truth answering four foundational questions:
1. **Identity:** Who are the users and teams in the organization?
2. **Topology:** Which microservices exist, and which databases, caches, queues, and APIs do they bind to in each environment?
3. **Governance:** Which roles have permission to read or mutate specific environments, services, or resources?
4. **Accountability:** Who performed what action, when, and from where?

### 1.3 Repository Activation in Phase 1

| Repository | Phase 1 Status | Role in Phase 1 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Local Docker Compose orchestration (`postgres`, `api`, `web`, `migrate`), volume management, and environment templates. |
| **`iconfigly-api`** | **Active** | Go 1.27.2 Modular Monolith REST API implementing the Phase 1 DDD bounded contexts and PostgreSQL migrations. |
| **`iconfigly-web`** | **Active** | Next.js + TypeScript App Router UI providing the setup wizard, catalog explorer, dependency graph, RBAC manager, and audit viewer. |
| **`iconfigly-docs`** | **Active** | Architectural blueprints, ADRs, and phase specifications. |
| **`iconfigly-cli`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-js`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-go`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-java`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-operator`** | Dormant (Phase 5) | Empty repository placeholder. |

### 1.4 Scope Boundaries for Phase 1

| In Scope for Phase 1 | Out of Scope for Phase 1 (Deferred to Later Phases) |
| :--- | :--- |
| Containerized PostgreSQL 18, Go API, Next.js Web, and SQL Migration runner | Configuration key-value versioning, diffing, and rollbacks (Phase 2) |
| First-run Organization & Super Admin initialization wizard | Secret reference pointers and OpenBao / Vault integration (Phases 2 & 3) |
| Argon2id authentication, PostgreSQL revocable sessions, CSRF protection, and PATs | Change requests, blast-radius impact calculation, and approval workflows (Phase 2) |
| Organizations, Users, Teams, and Team Memberships (`LEAD`, `MEMBER`) | Transactional outbox worker, Mailpit email delivery, and webhooks (Phase 2) |
| Projects and Environment tiers (`DEV`, `QA`, `UAT`, `PROD`) | Temporary access approval workflows and dynamic database leases (Phases 2 & 3) |
| Microservice catalog and Single-Pane Service Context aggregator | CLI binary, language SDKs, and instance heartbeat telemetry (Phase 4) |
| Infrastructure Resource catalog (`POSTGRES`, `REDIS`, `KAFKA`, `S3`, `EXTERNAL_API`) | Kubernetes Helm charts, `kind` cluster, and `iconfigly-operator` (Phase 5) |
| Many-to-many `service_resource_bindings` and `service_dependencies` | OIDC/SSO, GitHub repository sync, and Slack/Teams notifications (Phase 6) |
| Scoped RBAC engine (`authz.Can`) and *"Who Has Access?"* inspector | |
| Append-only, SHA-256 hash-chained `audit_logs` | |
| Unit tests, PostgreSQL integration tests, Playwright E2E tests, and GitHub Actions CI | |

---

## 2. Phase 1 Architectural Decisions & Rationale (ADRs)

Every technical choice in Phase 1 is intentional and optimized for reliability, security, clean code, and developer productivity.

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-001** | **Backend Architecture** | **DDD Modular Monolith in Go (`1.27.2`)** | Single deployable binary with strict internal domain boundaries (`internal/*`). Eliminates network latency and distributed transaction complexity while keeping code modular. | **Microservices:** Overkill for a control plane; introduces distributed state bugs. **Unstructured Monolith:** Leads to spaghetti imports and untestable handlers. |
| **ADR-002** | **HTTP Routing** | **Go Standard Library `net/http` (`ServeMux`)** | Supports method and path parameters natively (`GET /health`, `POST /api/v1/projects/{projectID}/services`) with zero external router dependencies. | **Gin / Fiber:** Custom context wrappers break standard `http.Handler` compatibility (`Fiber` uses `fasthttp`, which is incompatible with standard `net/http`). |
| **ADR-003** | **Database Engine & Primary Keys** | **PostgreSQL 18 (`postgres:18-alpine`) + Native `uuidv7()`** | Provides ACID transactions, strict relational integrity for RBAC and dependency graphs, and native time-ordered UUIDv7 primary keys that eliminate B-tree index fragmentation. | **MongoDB:** Poor fit for relational dependency graphs and scoped RBAC joins. **Random UUIDv4:** Causes heavy B-tree index page splits on insert. |
| **ADR-004** | **Data Access Layer** | **`pgx/v5` (`v5.10.0`) Connection Pool + Repository Interfaces** | `pgxpool` is the highest-performance native PostgreSQL driver for Go. Wrapping queries behind DDD Repository interfaces keeps business logic 100% decoupled from SQL. | **GORM:** Reflection-based ORM hides SQL execution plans, slows down complex graph queries, and leaks persistence concerns into domain structs. |
| **ADR-005** | **Schema Migrations** | **`golang-migrate` (`migrate/migrate:latest`) via Docker Compose Profile** | Explicit, version-controlled `.up.sql` and `.down.sql` files executed on demand via the `tools` profile. | **ORM Auto-Migrate:** Unsafe in production; cannot express custom PostgreSQL triggers, `CHECK` constraints, or partial indexes cleanly. |
| **ADR-006** | **Dependency Graph Data Model** | **Many-to-Many `service_resource_bindings` per Environment** | Models the real-world enterprise reality where multiple microservices connect to the same database or Kafka cluster in a given environment. | **Nesting `resources` inside `services`:** Makes it impossible to represent shared infrastructure or compute multi-service blast radius in Phase 2. |
| **ADR-007** | **Browser Authentication** | **Argon2id + Server-Side PostgreSQL Sessions (`HttpOnly` Cookie + CSRF)** | Allows instant session revocation when an engineer leaves or an incident occurs. Stores only the SHA-256 hash of the session token in PostgreSQL. | **Stateless Browser JWTs in `localStorage`:** Vulnerable to XSS token theft and impossible to revoke immediately before token expiry without a database blocklist anyway. |
| **ADR-008** | **Machine / CLI Authentication** | **Scoped Personal Access Tokens (PATs)** | Provides clean `Authorization: Bearer icfg_pat_...` authentication for API scripts and the Phase 4 CLI/SDKs, stored as SHA-256 hashes with prefix lookup. | **Basic Auth with User Password:** Exposes raw user credentials in scripts and cannot be scoped or revoked independently. |
| **ADR-009** | **Authorization Model** | **Hierarchical Scoped RBAC (`authz.Can`)** | Evaluates permissions across a clean scope tree: $\text{Org} \rightarrow \text{Project} \rightarrow \text{Environment} \rightarrow (\text{Service} \lor \text{Resource})$, supporting both permanent and time-expiring bindings. | **Flat Role Checks (`if user.Role == "ADMIN"`):** Cannot express rules like *"Payments Team has Write access in DEV, Read in UAT, and No Access in PROD."* |
| **ADR-010** | **Audit Trail Integrity** | **Append-Only PostgreSQL Trigger + SHA-256 Hash Chain** | Every audit row hashes the previous row's hash alongside its own payload, and a database trigger blocks `UPDATE` and `DELETE`, proving tamper resistance. | **Standard Mutable Log Table:** A compromised database user could silently delete or alter past audit entries. |
| **ADR-011** | **Frontend-to-Backend Networking** | **Next.js Server-Side Same-Origin Proxy (`/api/v1/[...path]`)** | Browser talks strictly to `http://localhost:3000`. Next.js proxies `/api/v1/*` internally over the Docker network to `http://api:8080`, eliminating CORS issues and allowing `SameSite=Lax` cookies. | **Direct Browser Calls to `http://api:8080`:** Fails on the host machine because the hostname `api` only resolves inside the Docker network, and requires complex cross-origin cookie configurations. |
| **ADR-012** | **Error Contract** | **RFC 9457 Problem Details (`application/problem+json`)** | Standardized machine-readable error format (`type`, `title`, `status`, `detail`, `instance`, `request_id`) mapped cleanly from Go Domain Errors. | **Ad-hoc `{"error": "message"}` JSON:** Difficult for the frontend and future SDKs to distinguish validation errors, permission denials, and conflicts programmatically. |

---

## 3. Domain-Driven Design (DDD), Clean Code & Go Best Practices

### 3.1 Go Concepts Mapped for TypeScript / Next.js Engineers

Before diving into the DDD layers, here is how Go's building blocks correspond to TypeScript concepts you use daily:

* **Packages & Visibility:** Every folder in Go is a package. Instead of `export` and `private` keywords, Go uses **capitalization**:
  * `type Service struct` or `func Load()` (starts with an **UPPERCASE** letter) $\rightarrow$ **Exported (Public)** outside the package.
  * `type pgRepository struct` or `func validateSlug()` (starts with a **lowercase** letter) $\rightarrow$ **Unexported (Private)** to that package.
* **The `internal/` Compiler Rule:** Any package placed inside `iconfigly-api/internal/` is enforced by the Go compiler to be private to `iconfigly-api`. External libraries can never import it.
* **Implicit Interfaces (Duck Typing for Dependency Inversion):** In Go, a struct does not write `implements ServiceRepository`. If your PostgreSQL repository struct defines all the methods listed in the `ServiceRepository` interface, the Go compiler automatically allows it to be passed wherever `ServiceRepository` is expected. This makes mocking in unit tests effortless.
* **Explicit Error Values:** Go has no `try / catch` exceptions. Functions that can fail return a tuple `(result, error)`. Every caller inspects `if err != nil`, wraps context onto the error, and returns it up the stack.
* **`context.Context` (`ctx`):** Every database call, service method, and external request accepts `ctx context.Context` as its **first parameter**. It carries request deadlines/timeouts (so if a user closes their browser tab, PostgreSQL immediately aborts the running query) and request-scoped metadata (such as `request_id` and the authenticated `Actor`).

### 3.2 Phase 1 Bounded Contexts

In Domain-Driven Design, a large system is partitioned into **Bounded Contexts**—autonomous domain modules with clear responsibilities and strict boundaries:

```mermaid
flowchart TD
    subgraph Transport["HTTP Transport & Routing Layer"]
        Srv["internal/server\n(Route Registration & Middleware Chain)"]
    end

    subgraph CatalogContext["Catalog & Topology Bounded Contexts"]
        Bind["internal/binding\n(Service-Resource Links & Service Dependencies)"]
        Svc["internal/service\n(Microservice Catalog & Context Aggregator)"]
        Res["internal/resource\n(Infrastructure Resources: DB, Redis, Kafka, API)"]
        Env["internal/environment\n(Environment Tiers: DEV, QA, UAT, PROD)"]
        Proj["internal/project\n(Logical Project Groupings)"]
    end

    subgraph GovernanceContext["Governance, Identity & Accountability Contexts"]
        Acc["internal/access\n(Scoped RBAC Engine & Who-Has-Access Inspector)"]
        Tm["internal/team\n(Teams & Team Memberships)"]
        Auth["internal/auth & internal/user\n(Sessions, PATs, Argon2id, Users)"]
        Org["internal/organization\n(Root Tenant Aggregate)"]
        Aud["internal/audit\n(Hash-Chained Immutable Audit Trail)"]
    end

    subgraph SharedKernel["Shared Kernel & Infrastructure Foundation"]
        AppErr["internal/shared/apperror\n(Canonical Domain Error Types)"]
        HTTPUtil["internal/shared/httputil\n(RFC 9457 Problem Writer, Middleware, Pagination)"]
        Crypto["internal/shared/crypto\n(Argon2id & SHA-256 Token Hashing)"]
        DB["internal/database\n(pgxpool Connection Pool & TxManager)"]
        Cfg["internal/config\n(Environment Configuration Loader)"]
    end

    Srv --> CatalogContext
    Srv --> GovernanceContext
    Bind --> Svc
    Bind --> Res
    Svc --> Proj
    Svc --> Tm
    Res --> Env
    Env --> Proj
    CatalogContext --> Acc
    CatalogContext --> Aud
    GovernanceContext --> SharedKernel
    CatalogContext --> SharedKernel
```

### 3.3 The 4-Layer DDD Anatomy Inside Every Module

To enforce **Clean Architecture** and the **Dependency Inversion Principle**, every domain module under `internal/<module>/` is structured into four strict layers. Dependencies point **inward** toward the Domain Layer:

```mermaid
flowchart LR
    H["1. Transport Layer\n(handler.go, dto.go)\nnet/http JSON parsing\n& RFC 9457 mapping"]
    A["2. Application Layer\n(service.go)\nUse-case orchestration,\nRBAC checks, Tx & Audit"]
    D["3. Domain Layer\n(domain.go, errors.go, repository.go)\nEntities, Value Objects,\nInvariants & Repo Interface"]
    I["4. Infrastructure Layer\n(postgres_repo.go)\npgxpool SQL execution\nimplementing Repo Interface"]

    H -->|"Calls"| A
    A -->|"Manipulates & Depends on"| D
    I -->|"Implements Interface in"| D
```

1. **Domain Layer (`domain.go`, `value_objects.go`, ` repository.go`):**
   * **Zero external dependencies:** Never imports `net/http`, `pgx`, or JSON libraries.
   * **Entities & Aggregates:** Structs with identity (`ID uuid.UUID`) and business behavior methods (e.g., `Environment.MarkAsProduction()`, `Session.IsExpired(now)`).
   * **Value Objects:** Immutable, self-validating types (`Slug`, `Email`, `RoleName`, `ResourceType`, `AccessMode`). If an invalid slug (`"My Service!"`) is passed to `NewSlug()`, the constructor rejects it immediately so an invalid Value Object can never exist in memory.
   * **Repository Interface:** Defines the contract for saving and loading the Aggregate (e.g., `type Repository interface { Create(ctx, org) error; GetBySlug(ctx, slug) (*Organization, error) }`).
2. **Application / Use-Case Layer (`service.go`):**
   * Coordinates a complete business operation:
     1. Calls `access.Authorizer.Require(ctx, actor, permission, scope)` to verify RBAC authorization.
     2. Constructs and validates Domain Entities and Value Objects.
     3. Opens an atomic database transaction via `database.TxManager.WithTx(ctx, func(txCtx) error { ... })`.
     4. Persists the entity via the `Repository` interface.
     5. Appends an immutable entry to the Audit Trail via `audit.Service.Record(txCtx, ...)`.
   * Returns pure Domain Entities or Read Models—never HTTP status codes.
3. **Infrastructure / Persistence Layer (`postgres_repo.go`):**
   * Implements the Domain's `Repository` interface using `pgxpool` (and `sqlc`-generated helpers).
   * Translates PostgreSQL-specific error codes (such as `23505` unique constraint violation or `pgx.ErrNoRows`) into canonical Domain Errors (`apperror.ErrConflict`, `apperror.ErrNotFound`).
4. **Transport / HTTP Layer (`handler.go`, `dto.go`):**
   * Parses URL path parameters (`r.PathValue("projectID")`), query strings, and JSON request bodies into Request DTOs.
   * Calls the Application `Service`.
   * Maps returned Domain Entities into Response DTOs, or translates any returned `apperror.Error` into an RFC 9457 HTTP Problem response.

### 3.4 Clean Code & Testing Standards Enforced Across Phase 1

* **Constructor Dependency Injection:** Global mutable state is strictly forbidden. Every Repository, Service, and Handler is instantiated in `internal/server/server.go` via explicit constructor functions (`NewPostgresRepository(db)`, `NewService(repo, authz, audit, tx)`, `NewHandler(svc)`).
* **Small, Single-Purpose Functions:** Functions should do one thing well, keep cyclomatic complexity low, and use **guard clauses** (early returns on error) rather than deeply nested `if/else` blocks.
* **Domain Error Translation:** Database drivers (`pgx`) and internal stack traces must never leak to HTTP clients. All errors map through `internal/shared/apperror` to deterministic HTTP status codes (`400`, `401`, `403`, `404`, `409`, `422`, `500`).
* **Test-First Verification:**
  * **Domain & Value Object Unit Tests:** Fast, zero-I/O table-driven tests verifying invariants and edge cases.
  * **Application Service Unit Tests:** Use in-memory Fake/Mock implementations of the Domain `Repository` interface to test business workflows, RBAC denials, and audit recording in milliseconds.
  * **PostgreSQL Repository Integration Tests:** Run against the real PostgreSQL 18 container to verify constraints, foreign keys, and SQL queries.

---

## 4. Complete Phase 1 Folder & File Evolution

This section maps the complete folder hierarchy across the four active repositories from initial bootstrap (`Sub-Phase 1.0 & 1.1`) through the completed Phase 1 platform (`Sub-Phase 1.10`).

### 4.1 `iconfigly-infra` Complete File Tree

```text
iconfigly-infra/
├── .env                                      # Local git-ignored environment secrets (POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD)
├── .env.example                              # Committed template showing required environment variables with safe placeholders
├── .gitignore                                # Ignores .env, *.log, and IDE folders (.idea/, .vscode/, .DS_Store)
└── compose.yaml                              # Docker Compose orchestration for postgres, api, web, and migrate (tools profile)
```

### 4.2 `iconfigly-api` Complete File Tree (Step 1.1 Bootstrap $\rightarrow$ Step 1.8 Full DDD Monolith)

```text
iconfigly-api/
├── .air.toml                                 # Live-reload watcher configuration for rapid Go development in Docker
├── .gitignore                                # Ignores bin/, dist/, coverage.out, .env*, and IDE metadata
├── Dockerfile                                # Multi-stage production container build (builder -> distroless/bookworm-slim)
├── go.mod                                    # Go module definition (github.com/PathumSandeepa/iconfigly-api, Go 1.27.2)
├── go.sum                                    # Cryptographic checksums of Go module dependencies
├── sqlc.yaml                                 # Configuration for generating type-safe Go SQL wrappers
├── api/
│   └── openapi.yaml                          # OpenAPI 3.1 contract defining all Phase 1 REST endpoints and schemas
├── cmd/
│   └── server/
│       └── main.go                           # Application entrypoint: loads config, connects DB, wires server, handles graceful shutdown
├── migrations/
│   ├── 000001_create_organizations.up.sql
│   ├── 000001_create_organizations.down.sql
│   ├── 000002_create_users_and_auth.up.sql
│   ├── 000002_create_users_and_auth.down.sql
│   ├── 000003_create_teams.up.sql
│   ├── 000003_create_teams.down.sql
│   ├── 000004_create_projects_and_environments.up.sql
│   ├── 000004_create_projects_and_environments.down.sql
│   ├── 000005_create_services.up.sql
│   ├── 000005_create_services.down.sql
│   ├── 000006_create_resources.up.sql
│   ├── 000006_create_resources.down.sql
│   ├── 000007_create_bindings_and_dependencies.up.sql
│   ├── 000007_create_bindings_and_dependencies.down.sql
│   ├── 000008_create_role_bindings.up.sql
│   ├── 000008_create_role_bindings.down.sql
│   ├── 000009_create_audit_logs.up.sql
│   └── 000009_create_audit_logs.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # Loads & validates env vars (DATABASE_URL, PORT, ICONFIGLY_ENV, session settings)
    │   └── config_test.go                    # Unit tests for required & default configuration values
    ├── database/
    │   ├── postgres.go                       # Initializes pgxpool.Pool and verifies connectivity with 5s Ping timeout
    │   ├── tx.go                             # Unit-of-Work TxManager (WithTx) propagating pgx.Tx via context.Context
    │   └── tx_test.go                        # Integration tests verifying commit on success and rollback on error/panic
    ├── health/
    │   ├── handler.go                        # Liveness (GET /health) and DB Readiness (GET /ready) HTTP handlers
    │   └── handler_test.go                   # Unit tests for liveness and readiness responses
    ├── server/
    │   ├── server.go                         # Instantiates DDD repositories, services, handlers, middleware, and http.ServeMux
    │   └── server_test.go                    # Smoke tests verifying route registration and middleware headers
    ├── shared/
    │   ├── apperror/
    │   │   ├── apperror.go                   # Canonical Domain Error struct, error codes (NOT_FOUND, CONFLICT, FORBIDDEN, etc.)
    │   │   └── apperror_test.go              # Tests error wrapping and HTTP status code mapping
    │   ├── valueobject/
    │   │   ├── slug.go                       # Validated lowercase alphanumeric-hyphen Slug value object
    │   │   ├── email.go                      # Normalized and validated Email value object
    │   │   └── valueobject_test.go           # Table-driven validation tests for Slug and Email
    │   ├── crypto/
    │   │   ├── password.go                   # Argon2id password hashing and constant-time verification
    │   │   ├── token.go                      # Cryptographic 256-bit random token generator and SHA-256 hasher
    │   │   └── crypto_test.go                # Unit tests for Argon2id and token hash determinism
    │   └── httputil/
    │       ├── response.go                   # WriteJSON and WriteProblem (RFC 9457 application/problem+json) helpers
    │       ├── middleware.go                 # RequestID, Structured slog Logger, Panic Recovery, Rate Limiter middleware
    │       ├── pagination.go                 # Base64 cursor encoder/decoder for paginated list endpoints
    │       └── httputil_test.go              # Unit tests for Problem JSON formatting, middlewares, and cursor encoding
    ├── organization/
    │   ├── domain.go                         # Organization Aggregate Root entity and invariants
    │   ├── repository.go                     # OrganizationRepository interface definition
    │   ├── postgres_repo.go                  # PostgreSQL implementation of OrganizationRepository
    │   ├── service.go                        # Organization application use cases (Get, Update)
    │   ├── handler.go                        # HTTP transport handlers for /api/v1/organizations
    │   └── service_test.go                   # Unit tests for organization service
    ├── user/
    │   ├── domain.go                         # User Entity, UserStatus enum (ACTIVE, DISABLED)
    │   ├── repository.go                     # UserRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation of UserRepository
    │   ├── service.go                        # User management use cases (CreateUser, ListUsers, ChangeStatus)
    │   ├── handler.go                        # HTTP handlers for /api/v1/users
    │   └── service_test.go                   # Unit tests for user creation and status transitions
    ├── auth/
    │   ├── domain.go                         # Session Entity, PersonalAccessToken Entity, Actor Principal struct
    │   ├── context.go                        # Helpers to inject and extract authenticated Actor from context.Context
    │   ├── repository.go                     # SessionRepository and TokenRepository interfaces
    │   ├── postgres_repo.go                  # PostgreSQL implementation for sessions and personal_access_tokens
    │   ├── service.go                        # SetupStatus, InitialSetup, Login, Logout, AuthenticateRequest, PAT management
    │   ├── middleware.go                     # AuthenticateMiddleware (cookie or Bearer PAT) and CSRFMiddleware
    │   ├── handler.go                        # HTTP handlers for /api/v1/auth/*
    │   └── service_test.go                   # Table-driven unit tests for setup, login, session expiry, CSRF, and PATs
    ├── team/
    │   ├── domain.go                         # Team Aggregate, TeamMember Entity, TeamRole Value Object (LEAD, MEMBER)
    │   ├── repository.go                     # TeamRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation for teams and team_members
    │   ├── service.go                        # CreateTeam, ListTeams, GetTeam, AddMember, UpdateMemberRole, RemoveMember
    │   ├── handler.go                        # HTTP handlers for /api/v1/teams/*
    │   └── service_test.go                   # Unit tests for team creation and membership invariants
    ├── project/
    │   ├── domain.go                         # Project Aggregate Root
    │   ├── repository.go                     # ProjectRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation for projects
    │   ├── service.go                        # CreateProject (auto-seeds DEV, QA, UAT, PROD environments), ListProjects, GetProject
    │   ├── handler.go                        # HTTP handlers for /api/v1/projects/*
    │   └── service_test.go                   # Unit tests verifying atomic project creation + default environment seeding
    ├── environment/
    │   ├── domain.go                         # Environment Entity (tier_order, is_production, required_approvals)
    │   ├── repository.go                     # EnvironmentRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation for environments
    │   ├── service.go                        # ListEnvironments, CreateEnvironment, UpdateEnvironmentPolicy
    │   ├── handler.go                        # HTTP handlers for /api/v1/projects/{projectID}/environments/*
    │   └── service_test.go                   # Unit tests for environment ordering and approval threshold rules
    ├── service/
    │   ├── domain.go                         # Service Aggregate Root and ServiceContextView read-model struct
    │   ├── repository.go                     # ServiceRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation for services and context aggregation query
    │   ├── service.go                        # CreateService, ListServices, GetService, GetServiceEnvironmentContext
    │   ├── handler.go                        # HTTP handlers for /api/v1/projects/{projectID}/services/*
    │   └── service_test.go                   # Unit tests for service registration and single-pane context assembly
    ├── resource/
    │   ├── domain.go                         # Resource Aggregate, ResourceType enum (POSTGRES, REDIS, KAFKA, S3, EXTERNAL_API, CUSTOM)
    │   ├── repository.go                     # ResourceRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation for resources
    │   ├── service.go                        # CreateResource, ListResources, GetResource, UpdateConnectionMetadata
    │   ├── handler.go                        # HTTP handlers for /api/v1/projects/{projectID}/resources/*
    │   └── service_test.go                   # Unit tests for resource validation and environment scoping
    ├── binding/
    │   ├── domain.go                         # ServiceResourceBinding Entity (AccessMode), ServiceDependency Entity (Protocol)
    │   ├── repository.go                     # BindingRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation for service_resource_bindings & service_dependencies
    │   ├── service.go                        # BindServiceToResource, UnbindServiceFromResource, AddServiceDependency, GetProjectGraph
    │   ├── handler.go                        # HTTP handlers for /api/v1/projects/{projectID}/bindings, /dependencies, /graph
    │   └── service_test.go                   # Unit tests preventing self-dependency cycles and cross-environment binding mismatches
    ├── access/
    │   ├── domain.go                         # RoleBinding Entity, RoleName, PermissionVerb, ScopeType, SubjectType, EffectiveGrant
    │   ├── authorizer.go                     # Central policy evaluator: Can(ctx, actor, verb, scope) & Require(...)
    │   ├── repository.go                     # AccessRepository interface
    │   ├── postgres_repo.go                  # PostgreSQL implementation querying active role_bindings across ancestor scopes
    │   ├── service.go                        # GrantRole, RevokeRole, ListBindings, InspectWhoHasAccess
    │   ├── handler.go                        # HTTP handlers for /api/v1/projects/{projectID}/access/*
    │   └── authorizer_test.go                # Exhaustive table-driven unit tests for scope inheritance, expiry, and deny-by-default
    └── audit/
        ├── domain.go                         # AuditEntry Entity and deterministic SHA-256 EntryHash computation method
        ├── repository.go                     # AuditRepository interface (AppendWithLock, ListPaginated, GetLatestHash)
        ├── postgres_repo.go                  # PostgreSQL implementation for audit_logs
        ├── service.go                        # Record(ctx, cmd) and QueryAuditLogs(ctx, filter)
        ├── handler.go                        # HTTP handlers for /api/v1/audit-logs
        └── service_test.go                   # Unit & integration tests verifying hash chain continuity and immutability
```

### 4.3 `iconfigly-web` Complete File Tree (Feature-Driven Architecture in `src/`)

```text
iconfigly-web/
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx                        # Root HTML shell, QueryClientProvider, AuthProvider, Toast notifications
    │   ├── page.tsx                          # Root entrypoint redirecting to /dashboard, /login, or /setup
    │   ├── globals.css                       # Global Tailwind CSS styles and design tokens
    │   ├── api/
    │   │   └── v1/
    │   │       └── [...path]/
    │   │           └── route.ts              # Server-side same-origin proxy forwarding /api/v1/* to API_URL (http://api:8080)
    │   ├── (auth)/
    │   │   ├── layout.tsx                    # Centered unauthenticated card layout
    │   │   ├── setup/
    │   │   │   └── page.tsx                  # First-run Organization & Super Admin initialization wizard
    │   │   └── login/
    │   │       └── page.tsx                  # Email & password sign-in page
    │   └── (dashboard)/
    │       ├── layout.tsx                    # Authenticated shell: Sidebar, Project Switcher, User Menu
    │       ├── dashboard/
    │       │   └── page.tsx                  # Organization overview: service count, resource count, recent audit activity
    │       ├── teams/
    │       │   ├── page.tsx                  # Teams directory & Create Team dialog
    │       │   └── [teamId]/
    │       │       └── page.tsx              # Team detail view: members list, role selector (LEAD/MEMBER), owned services
    │       ├── users/
    │       │   └── page.tsx                  # Organization users list & Invite/Create User modal
    │       ├── projects/
    │       │   └── [projectId]/
    │       │       ├── environments/
    │       │       │   └── page.tsx          # Environment tiers (DEV, QA, UAT, PROD) & approval policy settings
    │       │       ├── services/
    │       │       │   ├── page.tsx          # Microservices catalog table with search & owner filter
    │       │       │   └── [serviceSlug]/
    │       │       │       └── page.tsx      # Single-Pane Service Context View (Env tabs, bound DB/Redis/Kafka, dependencies, access badge)
    │       │       ├── resources/
    │       │       │   ├── page.tsx          # Infrastructure resource catalog filtered by environment & type
    │       │       │   └── [resourceId]/
    │       │       │       └── page.tsx      # Resource detail view: connection metadata, bound services list, access inspector
    │       │       ├── graph/
    │       │       │   └── page.tsx          # Interactive visual topology graph (Services -> Resources & Service -> Service)
    │       │       └── access/
    │       │           └── page.tsx          # Scoped RBAC Role Binding manager & "Who Has Access?" live inspector
    │       ├── audit/
    │       │   └── page.tsx                  # Immutable Audit Trail explorer with filters, hash-chain badge & JSON drawer
    │       └── settings/
    │           └── tokens/
    │               └── page.tsx              # Personal Access Token (PAT) creation and revocation screen
    ├── components/
    │   ├── layout/                           # AppSidebar, TopHeader, ProjectSelector, EnvironmentBadge
    │   └── ui/                               # Reusable accessible UI primitives (Button, Input, Modal, Table, Badge, Tabs, Card)
    ├── features/
    │   ├── auth/                             # LoginForm, SetupWizardForm, TokenManagerTable, useAuth hook
    │   ├── teams/                            # TeamListTable, CreateTeamModal, TeamMembersPanel, useTeams hooks
    │   ├── catalog/                          # ServiceCatalogTable, ServiceContextCard, ResourceFormModal, BindResourceModal, TopologyGraph
    │   ├── access/                           # RoleBindingTable, GrantAccessModal, WhoHasAccessInspector, useAccess hooks
    │   └── audit/                            # AuditLogTable, AuditFilterBar, AuditMetadataDrawer, useAuditLogs hook
    └── lib/
        ├── api-client.ts                     # Central fetch wrapper injecting X-CSRF-Token and parsing RFC 9457 Problem errors
        ├── query-client.ts                   # TanStack React Query configuration
        └── types.ts                          # TypeScript domain interfaces matching OpenAPI 3.1 schemas
```

---

## 5. Sub-Phase 1.0: Containerized Infrastructure & Workspace Bootstrap (`iconfigly-infra`)

### 5.1 Goal & Engineering Rationale
Create a 100% reproducible local container environment where PostgreSQL 18, the Go API server, the Next.js web server, and the SQL migration runner operate inside an isolated Docker network without requiring Go, Node.js, or PostgreSQL to be installed on the host Windows 11 machine.

### 5.2 Exact File Specifications in `iconfigly-infra`

| File Path | Detailed Responsibility & Configuration |
| :--- | :--- |
| `iconfigly-infra/.env.example` | Committed template defining three required database variables: `POSTGRES_DB=iconfigly`, `POSTGRES_USER=iconfigly`, and `POSTGRES_PASSWORD=change-me`. |
| `iconfigly-infra/.env` | Local, git-ignored environment file used by Docker Compose, setting `POSTGRES_DB=iconfigly`, `POSTGRES_USER=iconfigly`, and `POSTGRES_PASSWORD=iconfigly_dev`. |
| `iconfigly-infra/.gitignore` | Prevents accidental commits of `.env`, `*.log`, `.idea/`, `.vscode/`, and `.DS_Store`. |
| `iconfigly-infra/compose.yaml` | Defines project name `iconfigly`, four container services (`postgres`, `api`, `web`, `migrate`), and five named persistent volumes (`postgres_data`, `go_mod_cache`, `go_build_cache`, `web_node_modules`, `web_next`). |

### 5.3 Container Service Breakdown in `compose.yaml`

1. **`postgres` Service:**
   * **Image:** `postgres:18-alpine` (Container name: `iconfigly-postgres`).
   * **Environment:** Injects `POSTGRES_DB`, `POSTGRES_USER`, and `POSTGRES_PASSWORD` from `.env`.
   * **Port Mapping:** Binds `127.0.0.1:5432:5432` (restricted to localhost interface for security).
   * **Volume:** Mounts `postgres_data:/var/lib/postgresql` so database records survive container restarts.
   * **Healthcheck:** Runs `pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}` every `5s` (timeout `5s`, `10` retries) so dependent containers wait until PostgreSQL is ready to accept connections.
2. **`api` Service:**
   * **Image:** `golang:1.27.2-bookworm` (Container name: `iconfigly-api`, working directory `/app`).
   * **Volumes:** Mounts `../iconfigly-api:/app` for live source access, plus `go_mod_cache:/go/pkg/mod` and `go_build_cache:/root/.cache/go-build` so Go module downloads and build artifacts are cached across `docker compose run` executions.
   * **Environment:** Constructs `DATABASE_URL` as `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?sslmode=disable`.
   * **Port Mapping:** Binds `127.0.0.1:8080:8080`.
   * **Dependency & Command:** Waits for `postgres` (`condition: service_healthy`) and executes `go run ./cmd/server`.
3. **`web` Service:**
   * **Image:** `node:26-bookworm-slim` (Container name: `iconfigly-web`, working directory `/app`).
   * **Volumes:** Mounts `../iconfigly-web:/app`, while isolating Linux container dependencies in named volumes `web_node_modules:/app/node_modules` and `web_next:/app/.next` so Windows host file systems never conflict with container native binaries.
   * **Environment:** Sets `NEXT_TELEMETRY_DISABLED=1`, `WATCHPACK_POLLING=true` (essential for WSL2/Windows bind-mount hot reloading), and `API_URL=http://api:8080`.
   * **Port Mapping & Command:** Binds `127.0.0.1:3000:3000`, depends on `api`, and executes `sh -c "npm install && npm run dev"`.
4. **`migrate` Service:**
   * **Image:** `migrate/migrate:latest` (Container name: `iconfigly-migrate`).
   * **Profile:** Assigned to `profiles: ["tools"]` so it only runs when explicitly invoked, never looping in the background during normal `docker compose up -d`.
   * **Volume & Command:** Mounts `../iconfigly-api/migrations:/migrations:ro` (read-only) and runs `-path=/migrations -database=postgres://... up` once `postgres` is healthy.

---

## 6. Sub-Phase 1.1: Core API Bootstrap (`iconfigly-api` Initial Skeleton)

### 6.1 Goal & Engineering Rationale
Establish the minimal, idiomatic Go HTTP server, environment configuration loader, PostgreSQL connection pool initializer, liveness health endpoint, initial database migration files, and unit test harness.

### 6.2 File-by-File & Function-by-Function Specification

| File Path | Structs / Functions | Exact Behavior & Responsibilities |
| :--- | :--- | :--- |
| `go.mod` & `go.sum` | Module `github.com/PathumSandeepa/iconfigly-api` | Declares Go version `1.27.2` and direct dependency `github.com/jackc/pgx/v5 v5.10.0`. |
| `.gitignore` | Ignore rules | Excludes compiled binaries (`bin/`, `dist/`), test coverage profiles (`coverage.out`), `.env*` (except `!.env.example`), and editor folders. |
| `internal/config/config.go` | Struct: `Config`<br>Func: `Load() (Config, error)` | **`Config` Struct:** Holds `DatabaseURL string` and `Port string`.<br>**`Load()` Function:** Reads `DATABASE_URL` from `os.Getenv`. If empty, returns an explicit error (`"DATABASE_URL is required"`). Reads `PORT` from `os.Getenv`; if empty, defaults `Port` to `"8080"`. Returns the populated `Config` value. |
| `internal/config/config_test.go` | Func: `TestLoadRequiresDatabaseURL(t *testing.T)`<br>Func: `TestLoadUsesDefaultPort(t *testing.T)` | **`TestLoadRequiresDatabaseURL`:** Clears `DATABASE_URL` and `PORT` using `t.Setenv`, calls `Load()`, and asserts that a non-nil error is returned.<br>**`TestLoadUsesDefaultPort`:** Sets `DATABASE_URL` to a dummy connection string via `t.Setenv`, calls `Load()`, asserts no error occurred, and verifies `cfg.Port == "8080"`. |
| `internal/database/postgres.go` | Func: `NewPostgres(databaseURL string) (*pgxpool.Pool, error)` | Validates that `databaseURL` is non-empty. Parses the connection string via `pgxpool.ParseConfig`. Creates a concurrent connection pool via `pgxpool.NewWithConfig`. Creates a 5-second timeout context (`context.WithTimeout`) and calls `pool.Ping(ctx)` to verify database reachability at startup—closing the pool and returning a wrapped error if the ping fails. |
| `internal/health/handler.go` | Func: `Handler(w http.ResponseWriter, r *http.Request)` | Sets response header `Content-Type: application/json`, writes HTTP status `200 OK`, and encodes a JSON map containing `"status": "ok"` and `"service": "iconfigly-api"`. |
| `internal/server/server.go` | Func: `New(port string) *http.Server` | Instantiates Go's standard library router (`http.NewServeMux()`), binds `"GET /health"` to `health.Handler`, and returns a configured `*http.Server` listening on `":" + port` with `ReadHeaderTimeout: 5 * time.Second` (protecting against Slowloris denial-of-service attacks). |
| `cmd/server/main.go` | Func: `main()` | Entrypoint of the API process. Calls `config.Load()`, exiting on error. Calls `database.NewPostgres(cfg.DatabaseURL)`, exiting on error, and schedules `defer db.Close()`. Constructs the HTTP server via `server.New(cfg.Port)`, logs the startup port, and blocks on `appServer.ListenAndServe()`, ignoring `http.ErrServerClosed`. |
| `migrations/000001_create_organizations.up.sql` & `.down.sql` | Initial SQL migration pair | `.up.sql` creates the root `organizations` table (`id`, `slug`, `name`, `created_at`, `updated_at`); `.down.sql` drops the `organizations` table. |

---

## 7. Sub-Phase 1.2: Shared Kernel, Middleware, Readiness & Transaction Manager

### 7.1 Goal & Engineering Rationale
Evolve the initial bootstrap into a production-grade foundation before adding domain modules. This sub-phase introduces the **DDD Shared Kernel** (canonical domain errors, reusable value objects, cryptographic helpers, RFC 9457 error formatting, HTTP middleware chain, cursor pagination), a database-backed readiness probe (`GET /ready`), a Unit-of-Work Transaction Manager (`TxManager`), and graceful OS signal shutdown in `cmd/server/main.go`.

### 7.2 Folder Changes & New Files in Sub-Phase 1.2

* **Create new folders:**
  * `internal/shared/apperror/`
  * `internal/shared/valueobject/`
  * `internal/shared/crypto/`
  * `internal/shared/httputil/`
* **Create new files & update existing bootstrap files** as detailed in the table below:

| File Path | Action | Structs, Interfaces & Functions | Detailed Responsibility & Why Needed |
| :--- | :--- | :--- | :--- |
| `internal/config/config.go` | **Update** | Struct `Config` (expanded)<br>Func `Load() (Config, error)` | Adds `Env string` (`ICONFIGLY_ENV`, default `"development"`), `SessionCookieName string` (`ICONFIGLY_SESSION_COOKIE`, default `"iconfigly_session"`), `SessionTTLHours int` (`ICONFIGLY_SESSION_TTL_HOURS`, default `24`), and `MasterKeyHex string` (`ICONFIGLY_MASTER_KEY`, 64-character hex string for AES-256-GCM; generates a deterministic dev key only when `Env == "development"` and requires an explicit key in `"production"`). |
| `internal/shared/apperror/apperror.go` | **Create** | Enum `Code` (`NOT_FOUND`, `CONFLICT`, `VALIDATION_FAILED`, `UNAUTHORIZED`, `FORBIDDEN`, `SEPARATION_OF_DUTIES`, `RATE_LIMITED`, `INTERNAL`)<br>Struct `Error`<br>Constructors: `NotFound`, `Conflict`, `Validation`, `Unauthorized`, `Forbidden`, `Internal` | Provides a single canonical Domain Error type across all bounded contexts. Holds `Code`, `Title`, `Detail`, `Fields map[string]string` (for field-level validation errors), and an wrapped `Cause error`. Prevents domain services from importing `net/http` while allowing HTTP handlers to map any `apperror.Error` to an exact HTTP status code. |
| `internal/shared/valueobject/slug.go` | **Create** | Type `Slug string`<br>Func `NewSlug(raw string) (Slug, error)`<br>Method `String() string` | Enforces the invariant that all slugs across organizations, teams, projects, environments, services, and resources are trimmed, lowercase, between 2 and 63 characters, and match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Returns `apperror.Validation` if violated. |
| `internal/shared/valueobject/email.go` | **Create** | Type `Email string`<br>Func `NewEmail(raw string) (Email, error)`<br>Method `String() string` | Trims whitespace, lowercases the email address, validates format via `net/mail.ParseAddress`, and enforces max length of 254 characters. |
| `internal/shared/crypto/password.go` | **Create** | Func `HashPassword(plain string) (string, error)`<br>Func `VerifyPassword(plain, encodedHash string) (bool, error)` | Uses `golang.org/x/crypto/argon2` (`Argon2id`, time=1, memory=64MB, threads=4, keyLen=32, 16-byte random salt) formatted in standard PHC string format (`$argon2id$v=19$m=65536,t=1,p=4$<salt>$<hash>`). Constant-time comparison (`crypto/subtle.ConstantTimeCompare`) prevents timing attacks. |
| `internal/shared/crypto/token.go` | **Create** | Func `GenerateRandomToken(prefix string, byteLen int) (rawToken string, tokenHash []byte, err error)`<br>Func `HashToken(rawToken string) []byte` | Uses `crypto/rand` to generate cryptographically secure random bytes, encodes them in base64url with an optional prefix (e.g., `icfg_pat_`), and computes the 32-byte SHA-256 digest (`crypto/sha256`). Ensures raw session tokens and PATs are never stored in PostgreSQL. |
| `internal/shared/httputil/response.go` | **Create** | Struct `ProblemDetails`<br>Func `WriteJSON(w, status, payload)`<br>Func `WriteProblem(w, r, err)` | `WriteJSON` serializes success envelopes (`{"data": ...}`). `WriteProblem` inspects any `error`: if it is an `*apperror.Error`, it maps its `Code` to the corresponding HTTP status (`400`, `401`, `403`, `404`, `409`, `422`) and outputs an RFC 9457 `application/problem+json` body including the `request_id` from `r.Context()`. Unrecognized errors log the internal cause via `slog` and return a safe `500 Internal Server Error`. |
| `internal/shared/httputil/middleware.go` | **Create** | Func `Chain(h http.Handler, mws ...Middleware) http.Handler`<br>Func `RequestIDMiddleware`<br>Func `LoggerMiddleware(logger *slog.Logger)`<br>Func `RecoverMiddleware(logger *slog.Logger)` | **`RequestIDMiddleware`:** Reads or generates `X-Request-ID` and stores it in `r.Context()` and response headers.<br>**`LoggerMiddleware`:** Wraps `http.ResponseWriter` to capture the status code and logs structured JSON (`method`, `path`, `status`, `duration_ms`, `request_id`, `ip`).<br>**`RecoverMiddleware`:** Catches any runtime `panic`, logs the stack trace, and returns a clean `500` RFC 9457 response instead of crashing the Go process. |
| `internal/shared/httputil/pagination.go` | **Create** | Struct `PageRequest` (`Limit int`, `Cursor string`)<br>Struct `PageResponse[T any]` (`Items []T`, `NextCursor *string`, `HasMore bool`)<br>Func `ParsePageRequest(r *http.Request)`<br>Func `EncodeCursor(id uuid.UUID, createdAt time.Time)`<br>Func `DecodeCursor(cursor string)` | Implements keyset/cursor pagination (`?limit=25&cursor=...`) for list endpoints (`services`, `resources`, `audit-logs`), avoiding the slow performance of `OFFSET` pagination on large tables. |
| `internal/database/tx.go` | **Create** | Interface `DBTX` (satisfied by both `*pgxpool.Pool` and `pgx.Tx`)<br>Struct `TxManager`<br>Func `NewTxManager(pool *pgxpool.Pool) *TxManager`<br>Method `WithTx(ctx, fn func(txCtx context.Context) error) error`<br>Method `Conn(ctx context.Context) DBTX` | Implements the **Unit-of-Work pattern**. `WithTx` starts a PostgreSQL transaction, injects the `pgx.Tx` into `txCtx`, runs `fn(txCtx)`, rolls back if `fn` returns an error or panics, and commits on success. `Conn(ctx)` checks if `ctx` carries an active `pgx.Tx`; if so, repositories automatically execute their queries inside that transaction without changing repository method signatures! |
| `internal/health/handler.go` | **Update** | Func `Handler(w, r)` (existing liveness)<br>Func `ReadyHandler(db *pgxpool.Pool) http.HandlerFunc` | Adds `ReadyHandler` for `GET /ready`. Executes `db.Ping(ctx)` with a 2-second timeout. Returns `200 OK` (`{"status": "ready", "database": "connected"}`) if healthy, or `503 Service Unavailable` RFC 9457 Problem JSON if PostgreSQL is unreachable. |
| `internal/server/server.go` | **Update** | Func `New(cfg config.Config, db *pgxpool.Pool, logger *slog.Logger) *http.Server` | Updates `New` to accept `cfg`, `db`, and `logger`. Registers `GET /health` and `GET /ready`, mounts all `/api/v1/*` domain handlers, and wraps the `ServeMux` with `RecoverMiddleware`, `RequestIDMiddleware`, and `LoggerMiddleware`. |
| `cmd/server/main.go` | **Update** | Func `main()` | Initializes structured JSON logger (`slog.New(slog.NewJSONHandler(os.Stdout, nil))`). Passes `cfg, db, logger` to `server.New`. Uses `signal.NotifyContext` (`os.Interrupt`, `syscall.SIGTERM`) to listen for termination signals and calls `appServer.Shutdown(shutdownCtx)` with a 10-second timeout so in-flight HTTP requests complete cleanly before `db.Close()` executes. |

---

## 8. Sub-Phase 1.3: Relational Data Model & Database Migrations (`000001`–`000009`)

### 8.1 Entity-Relationship Diagram (Phase 1 Schema)

All 14 tables in Phase 1 use PostgreSQL 18's native time-ordered `uuidv7()` function for primary keys and `TIMESTAMPTZ` (UTC timestamp with time zone) for all temporal columns.

```mermaid
erDiagram
    organizations ||--o{ users : "contains"
    organizations ||--o{ teams : "contains"
    organizations ||--o{ projects : "owns"
    organizations ||--o{ role_bindings : "governs"
    organizations ||--o{ audit_logs : "records"

    users ||--o{ sessions : "authenticates"
    users ||--o{ personal_access_tokens : "generates"
    users ||--o{ team_members : "joins"
    teams ||--o{ team_members : "has"

    projects ||--o{ environments : "defines"
    projects ||--o{ services : "catalogs"
    teams ||--o{ services : "owns"

    projects ||--o{ resources : "provisions"
    environments ||--o{ resources : "scopes"
    teams ||--o{ resources : "owns"

    services ||--o{ service_resource_bindings : "binds"
    resources ||--o{ service_resource_bindings : "bound_to"
    environments ||--o{ service_resource_bindings : "in_env"

    services ||--o{ service_dependencies : "caller_or_callee"
    environments ||--o{ service_dependencies : "in_env"
```

### 8.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

Each migration consists of an `.up.sql` file (applying the schema) and a `.down.sql` file (cleanly dropping the created triggers, indexes, and tables in reverse dependency order).

#### Migration `000001_create_organizations`
* **Table `organizations`:** Root multi-tenant boundary.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `slug`: `TEXT NOT NULL UNIQUE` (indexed via `idx_organizations_slug`)
  * `name`: `TEXT NOT NULL`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### Migration `000002_create_users_and_auth`
* **Table `users`:** Human principals belonging to an organization.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `email`: `TEXT NOT NULL UNIQUE`
  * `full_name`: `TEXT NOT NULL`
  * `password_hash`: `TEXT NOT NULL` (Argon2id encoded string)
  * `is_super_admin`: `BOOLEAN NOT NULL DEFAULT FALSE`
  * `status`: `TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED'))`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Indexes:* `idx_users_org_id` on `(organization_id)`.
* **Table `sessions`:** Revocable server-side browser sessions.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `token_hash`: `BYTEA NOT NULL UNIQUE` (SHA-256 digest of the opaque session cookie token)
  * `csrf_token`: `TEXT NOT NULL` (Synchronizer token verified on `POST`/`PUT`/`PATCH`/`DELETE`)
  * `ip_address`: `TEXT NOT NULL DEFAULT ''`
  * `user_agent`: `TEXT NOT NULL DEFAULT ''`
  * `expires_at`: `TIMESTAMPTZ NOT NULL`
  * `revoked_at`: `TIMESTAMPTZ NULL`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Indexes:* `idx_sessions_user_id` on `(user_id)`, `idx_sessions_expires_at` on `(expires_at)`.
* **Table `personal_access_tokens`:** Scoped machine tokens for CLI and SDKs.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `name`: `TEXT NOT NULL`
  * `token_prefix`: `TEXT NOT NULL` (First 12 characters e.g. `icfg_pat_a1b` for UI identification)
  * `token_hash`: `BYTEA NOT NULL UNIQUE` (SHA-256 digest of the full token)
  * `scopes`: `TEXT[] NOT NULL DEFAULT '{}'`
  * `expires_at`: `TIMESTAMPTZ NOT NULL`
  * `last_used_at`: `TIMESTAMPTZ NULL`
  * `revoked_at`: `TIMESTAMPTZ NULL`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### Migration `000003_create_teams`
* **Table `teams`:** Functional engineering groups (`Payments Team`, `DevOps Team`, `QA Team`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `slug`: `TEXT NOT NULL`
  * `name`: `TEXT NOT NULL`
  * `description`: `TEXT NOT NULL DEFAULT ''`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (organization_id, slug)`.
* **Table `team_members`:** Join table linking Users to Teams with a team-level role.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `team_id`: `UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE`
  * `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `team_role`: `TEXT NOT NULL DEFAULT 'MEMBER' CHECK (team_role IN ('LEAD', 'MEMBER'))`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (team_id, user_id)`, `idx_team_members_user_id` on `(user_id)`.

#### Migration `000004_create_projects_and_environments`
* **Table `projects`:** Logical product or domain grouping (e.g., `Core Banking`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `slug`: `TEXT NOT NULL`
  * `name`: `TEXT NOT NULL`
  * `description`: `TEXT NOT NULL DEFAULT ''`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (organization_id, slug)`.
* **Table `environments`:** Deployment stages within a project (`dev`, `qa`, `uat`, `prod`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `slug`: `TEXT NOT NULL`
  * `name`: `TEXT NOT NULL`
  * `tier_order`: `INT NOT NULL DEFAULT 1` (Determines pipeline promotion order: `1=DEV`, `2=QA`, `3=UAT`, `4=PROD`)
  * `is_production`: `BOOLEAN NOT NULL DEFAULT FALSE`
  * `required_approvals`: `INT NOT NULL DEFAULT 0 CHECK (required_approvals >= 0)`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (project_id, slug)`.

#### Migration `000005_create_services`
* **Table `services`:** Microservice catalog records.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `owner_team_id`: `UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT` (Cannot delete a team that still owns active services)
  * `slug`: `TEXT NOT NULL`
  * `name`: `TEXT NOT NULL`
  * `description`: `TEXT NOT NULL DEFAULT ''`
  * `repo_url`: `TEXT NOT NULL DEFAULT ''`
  * `runbook_url`: `TEXT NOT NULL DEFAULT ''`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (project_id, slug)`, `idx_services_owner_team` on `(owner_team_id)`.

#### Migration `000006_create_resources`
* **Table `resources`:** Environment-specific infrastructure instances (e.g., `payments-db` in `UAT`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `owner_team_id`: `UUID NOT NULL REFERENCES teams(id) ON DELETE RESTRICT`
  * `slug`: `TEXT NOT NULL`
  * `name`: `TEXT NOT NULL`
  * `resource_type`: `TEXT NOT NULL CHECK (resource_type IN ('POSTGRES', 'MYSQL', 'REDIS', 'KAFKA', 'S3', 'EXTERNAL_API', 'CUSTOM'))`
  * `connection_metadata`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Non-secret connection attributes: `host`, `port`, `database_name`, `ssl_mode`, `topic_prefix`)
  * `version`: `INT NOT NULL DEFAULT 1`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (environment_id, slug)`, `idx_resources_env_id` on `(environment_id)`.

#### Migration `000007_create_bindings_and_dependencies`
* **Table `service_resource_bindings`:** Many-to-many graph edge connecting a `service` to a `resource` in a specific `environment`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `resource_id`: `UUID NOT NULL REFERENCES resources(id) ON DELETE CASCADE`
  * `access_mode`: `TEXT NOT NULL DEFAULT 'READ_WRITE' CHECK (access_mode IN ('READ', 'WRITE', 'READ_WRITE', 'ADMIN'))`
  * `notes`: `TEXT NOT NULL DEFAULT ''`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (environment_id, service_id, resource_id)`, `idx_srb_resource_env` on `(resource_id, environment_id)`, `idx_srb_service_env` on `(service_id, environment_id)`.
* **Table `service_dependencies`:** Directed graph edge connecting a `caller_service_id` to a `callee_service_id` in an `environment`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`, `project_id`, `environment_id`: Foreign keys with `ON DELETE CASCADE`
  * `caller_service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `callee_service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `protocol`: `TEXT NOT NULL DEFAULT 'HTTP' CHECK (protocol IN ('HTTP', 'GRPC', 'KAFKA', 'EVENT'))`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `CHECK (caller_service_id <> callee_service_id)`, `UNIQUE (environment_id, caller_service_id, callee_service_id)`, `idx_sdep_callee_env` on `(callee_service_id, environment_id)`.

#### Migration `000008_create_role_bindings`
* **Table `role_bindings`:** Polymorphic RBAC grant attaching a Subject (`USER` or `TEAM`) to a Role at a specific Scope (`ORG`, `PROJECT`, `ENVIRONMENT`, `SERVICE`, `RESOURCE`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `subject_type`: `TEXT NOT NULL CHECK (subject_type IN ('USER', 'TEAM'))`
  * `subject_id`: `UUID NOT NULL`
  * `role_name`: `TEXT NOT NULL CHECK (role_name IN ('ORG_ADMIN', 'ENV_ADMIN', 'SERVICE_LEAD', 'DEVELOPER', 'VIEWER'))`
  * `scope_type`: `TEXT NOT NULL CHECK (scope_type IN ('ORG', 'PROJECT', 'ENVIRONMENT', 'SERVICE', 'RESOURCE'))`
  * `scope_id`: `UUID NOT NULL`
  * `granted_by`: `UUID REFERENCES users(id) ON DELETE SET NULL`
  * `expires_at`: `TIMESTAMPTZ NULL` (Null for permanent grants; populated for time-boxed access)
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (organization_id, subject_type, subject_id, role_name, scope_type, scope_id)`, `idx_role_bindings_subject` on `(organization_id, subject_type, subject_id)`, `idx_role_bindings_scope` on `(organization_id, scope_type, scope_id)`.

#### Migration `000009_create_audit_logs`
* **Table `audit_logs`:** Immutable, cryptographically chained ledger of all platform mutations.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `actor_user_id`: `UUID REFERENCES users(id) ON DELETE SET NULL`
  * `actor_type`: `TEXT NOT NULL DEFAULT 'USER' CHECK (actor_type IN ('USER', 'SYSTEM', 'TOKEN'))`
  * `action`: `TEXT NOT NULL` (e.g., `org.initialized`, `service.created`, `binding.created`, `access.role_granted`)
  * `target_type`: `TEXT NOT NULL` (`ORGANIZATION`, `USER`, `TEAM`, `PROJECT`, `ENVIRONMENT`, `SERVICE`, `RESOURCE`, `BINDING`, `ROLE_BINDING`)
  * `target_id`: `UUID NOT NULL`
  * `environment_id`: `UUID REFERENCES environments(id) ON DELETE SET NULL`
  * `metadata`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Structured before/after summary)
  * `ip_address`: `TEXT NOT NULL DEFAULT ''`
  * `prev_hash`: `TEXT NOT NULL DEFAULT ''` (Hex SHA-256 `entry_hash` of the preceding row in the same organization, or `"GENESIS"` for the first row)
  * `entry_hash`: `TEXT NOT NULL` (Hex SHA-256 digest of `prev_hash || organization_id || actor_user_id || action || target_type || target_id || metadata || created_at`)
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Trigger `trg_audit_logs_immutable`:** Executes PL/pgSQL function `forbid_audit_log_mutation()` `BEFORE UPDATE OR DELETE ON audit_logs`, raising an exception if any code attempts to modify or delete an existing audit record.

---

## 9. Sub-Phase 1.4: Organization & Identity Bounded Contexts (`organization`, `user`, `auth`)

### 9.1 Domain Model & Invariants
* **`Organization` Aggregate (`internal/organization/domain.go`):**
  * Fields: `ID uuid.UUID`, `Slug valueobject.Slug`, `Name string`, `CreatedAt time.Time`, `UpdatedAt time.Time`.
  * Invariant: `Name` must be 2–100 characters; `Slug` is immutable after creation.
* **`User` Aggregate (`internal/user/domain.go`):**
  * Fields: `ID uuid.UUID`, `OrganizationID uuid.UUID`, `Email valueobject.Email`, `FullName string`, `PasswordHash string`, `IsSuperAdmin bool`, `Status UserStatus` (`ACTIVE` or `DISABLED`), `CreatedAt`, `UpdatedAt`.
  * Invariant: A `DISABLED` user cannot authenticate or use any existing Session or PAT; the last remaining `ACTIVE` Super Admin in an organization cannot be disabled.
* **`Actor` Principal & Auth Entities (`internal/auth/domain.go`):**
  * `Actor` Struct (stored in `r.Context()` after authentication): `UserID uuid.UUID`, `OrganizationID uuid.UUID`, `Email string`, `IsSuperAdmin bool`, `TeamIDs []uuid.UUID`, `LeadTeamIDs []uuid.UUID`, `AuthMethod string` (`SESSION` or `TOKEN`), `CSRFToken string`, `ClientIP string`.
  * `Session` Entity: Valid only when `RevokedAt == nil` and `ExpiresAt.After(now)`.
  * `PersonalAccessToken` Entity: Valid only when `RevokedAt == nil` and `ExpiresAt.After(now)`.

### 9.2 File & Function Breakdown (`organization`, `user`, `auth`)

| File Path | Functions / Methods | Detailed Execution Flow & Business Rules |
| :--- | :--- | :--- |
| `internal/organization/repository.go` & `postgres_repo.go` | `Count(ctx) (int64, error)`<br>`Create(ctx, *Organization) error`<br>`GetByID(ctx, id) (*Organization, error)`<br>`Update(ctx, *Organization) error` | Executes SQL against `organizations` using `txManager.Conn(ctx)`. `Count(ctx)` is used by the first-run setup check to determine if the platform has been initialized. |
| `internal/user/repository.go` & `postgres_repo.go` | `Create(ctx, *User) error`<br>`GetByID(ctx, orgID, userID) (*User, error)`<br>`GetByEmail(ctx, email) (*User, error)`<br>`ListByOrg(ctx, orgID, page) ([]*User, error)`<br>`UpdateStatus(ctx, orgID, userID, status) error` | Manages persistence for `users`. Translates duplicate email constraint errors to `apperror.Conflict("Email already registered")`. |
| `internal/auth/service.go` | `GetSetupStatus(ctx) (bool, error)`<br>`InitializePlatform(ctx, cmd SetupCmd) (*LoginResult, error)`<br>`Login(ctx, cmd LoginCmd) (*LoginResult, error)`<br>`Logout(ctx, rawSessionToken string) error`<br>`AuthenticateSession(ctx, rawToken string) (*Actor, error)`<br>`AuthenticatePAT(ctx, rawPAT string) (*Actor, error)`<br>`CreatePAT(ctx, actor, cmd) (rawToken string, *PersonalAccessToken, error)`<br>`ListPATs(ctx, actor) ([]*PersonalAccessToken, error)`<br>`RevokePAT(ctx, actor, tokenID) error` | **`InitializePlatform`:** Acquires a transaction via `txManager.WithTx`. Verifies `orgRepo.Count(ctx) == 0` (returns `409 Conflict` if already initialized). Creates the `Organization`, hashes the admin password with Argon2id, creates the first `User` with `IsSuperAdmin = true`, creates an `ORG_ADMIN` role binding at `ORG` scope, records the ` GENESIS` `org.initialized` audit log, and creates an initial browser `Session`.<br>**`Login`:** Looks up `User` by email, verifies `status == ACTIVE`, checks password via `crypto.VerifyPassword` (using a dummy Argon2id verify if email is not found to prevent user-enumeration timing attacks), generates a 32-byte random session token and 32-byte CSRF token, persists the SHA-256 hash in `sessions`, and records `auth.login` in `audit_logs`. |
| `internal/auth/middleware.go` | `AuthenticateMiddleware(authSvc *Service)`<br>`CSRFMiddleware()` | **`AuthenticateMiddleware`:** Inspects the `iconfigly_session` cookie first; if absent, checks `Authorization: Bearer icfg_pat_...`. Resolves the `Actor` (including the user's current `TeamIDs` and `LeadTeamIDs`), injects `Actor` into `r.Context()`, or returns `401 Unauthorized`.<br>**`CSRFMiddleware`:** For mutating HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`) authenticated via `SESSION` cookie, verifies that the `X-CSRF-Token` request header matches `actor.CSRFToken` in constant time; returns `403 Forbidden` if missing or mismatched. (Skipped for `Bearer` PAT requests, which are immune to browser CSRF). |
| `internal/auth/handler.go` & `internal/user/handler.go` | HTTP Handlers for `/api/v1/auth/*` and `/api/v1/users/*` | Sets `HttpOnly; SameSite=Lax; Path=/` cookie on `POST /api/v1/auth/setup` and `POST /api/v1/auth/login`, and clears the cookie on `POST /api/v1/auth/logout`. Returns `csrf_token` and user profile in `GET /api/v1/auth/me`. |

---

## 10. Sub-Phase 1.5: Team Bounded Context (`team`)

### 10.1 Domain Model & Invariants
* **`Team` Aggregate (`internal/team/domain.go`):**
  * Fields: `ID uuid.UUID`, `OrganizationID uuid.UUID`, `Slug valueobject.Slug`, `Name string`, `Description string`, `CreatedAt`, `UpdatedAt`.
* **`TeamMember` Entity (`internal/team/domain.go`):**
  * Fields: `ID uuid.UUID`, `TeamID uuid.UUID`, `UserID uuid.UUID`, `UserEmail string`, `UserFullName string`, `Role TeamRole` (`LEAD` or `MEMBER`), `CreatedAt`.
  * Invariant: A user must belong to the same `OrganizationID` as the `Team` to be added as a member.

### 10.2 File & Function Breakdown (`internal/team/`)

| File Path | Functions / Methods | Detailed Execution Flow & Business Rules |
| :--- | :--- | :--- |
| `internal/team/repository.go` & `postgres_repo.go` | `Create(ctx, *Team) error`<br>`GetByID(ctx, orgID, teamID) (*Team, error)`<br>`ListByOrg(ctx, orgID) ([]*TeamWithMemberCount, error)`<br>`AddMember(ctx, *TeamMember) error`<br>`RemoveMember(ctx, teamID, userID) error`<br>`ListMembers(ctx, teamID) ([]*TeamMember, error)`<br>`ListUserTeamMemberships(ctx, userID) ([]UserTeamMembership, error)` | Handles persistence for `teams` and `team_members`. `ListUserTeamMemberships` is used by the Auth and Access services to determine which teams a user belongs to and which teams they lead. |
| `internal/team/service.go` | `CreateTeam(ctx, actor, cmd) (*Team, error)`<br>`ListTeams(ctx, actor) ([]*TeamWithMemberCount, error)`<br>`GetTeamDetails(ctx, actor, teamID) (*TeamDetails, error)`<br>`AddTeamMember(ctx, actor, teamID, userID, role) (*TeamMember, error)`<br>`RemoveTeamMember(ctx, actor, teamID, userID) error` | **`CreateTeam`:** Requires `catalog.write` permission at `ORG` scope. Validates `Slug` and `Name`, inserts team and writes `team.created` audit log inside a single transaction.<br>**`AddTeamMember` / `RemoveTeamMember`:** Allowed if `actor` has `catalog.write` at `ORG` scope OR if `actor` is already a `LEAD` of that specific `teamID`. Records `team.member_added` or `team.member_removed` in `audit_logs`. |
| `internal/team/handler.go` | `HandleCreateTeam`, `HandleListTeams`, `HandleGetTeam`, `HandleAddMember`, `HandleRemoveMember` | Exposes REST routes under `/api/v1/teams` and `/api/v1/teams/{teamID}/members`. |

---

## 11. Sub-Phase 1.6: Service & Resource Catalog Bounded Context (`project`, `environment`, `service`, `resource`, `binding`)

### 11.1 Domain Model & Invariants
* **`Project` Aggregate (`internal/project/domain.go`):** Top-level container grouping related microservices, environments, and infrastructure resources.
* **`Environment` Entity (`internal/environment/domain.go`):** Represents an isolated runtime stage (`DEV`, `QA`, `UAT`, `PROD`). Holds `TierOrder int`, `IsProduction bool`, and `RequiredApprovals int`.
* **`Service` Aggregate (`internal/service/domain.go`):** Represents a deployable microservice owned by a specific `OwnerTeamID`.
* **`Resource` Aggregate (`internal/resource/domain.go`):** Represents an infrastructure dependency (`POSTGRES`, `MYSQL`, `REDIS`, `KAFKA`, `S3`, `EXTERNAL_API`, `CUSTOM`) scoped to a specific `(ProjectID, EnvironmentID)` and owned by an `OwnerTeamID`.
* **`ServiceResourceBinding` & `ServiceDependency` Entities (`internal/binding/domain.go`):**
  * **Cross-Environment Invariant:** A `Service` can only bind to a `Resource` if both belong to the exact same `ProjectID` and the binding's `EnvironmentID` matches `Resource.EnvironmentID`.
  * **No Self-Dependency Invariant:** In `ServiceDependency`, `CallerServiceID` must never equal `CalleeServiceID`.

### 11.2 The Single-Pane Service Context Aggregator (`GetServiceEnvironmentContext`)

One of the core user stories of `iconfigly` is answering: *"What does `payment-service` use in `UAT`, who owns it, and what access do I have?"*

```mermaid
sequenceDiagram
    actor Dev as Developer (Browser)
    participant H as service.Handler
    participant S as service.Service
    participant Authz as access.Authorizer
    participant Repo as service.PostgresRepository
    participant DB as PostgreSQL 18

    Dev->>H: GET /api/v1/projects/{projectID}/services/payment-service/context?env=uat
    H->>S: GetServiceEnvironmentContext(ctx, actor, projectID, "payment-service", "uat")
    S->>Authz: Require(ctx, actor, "catalog.read", ScopeService)
    Authz-->>S: Allowed (Resolves effective role: e.g. VIEWER or DEVELOPER)
    S->>Repo: FetchServiceContextView(ctx, projectID, "payment-service", "uat")
    Repo->>DB: Query Service + Owner Team + Environment + Bound Resources + Upstream/Downstream Dependencies + Latest Audit Entry
    DB-->>Repo: Aggregated Rows
    Repo-->>S: ServiceContextView
    S-->>H: ServiceContextView + CallerEffectiveRole
    H-->>Dev: 200 OK JSON (Complete Single-Pane Context Card)
```

### 11.3 File & Function Breakdown Across the 5 Catalog Packages

| Package | Files | Key Service Functions & Exact Responsibilities |
| :--- | :--- | :--- |
| `internal/project` | `domain.go`, `repository.go`, `postgres_repo.go`, `service.go`, `handler.go`, `service_test.go` | **`CreateProject(ctx, actor, cmd)`:** Verifies `catalog.write` at `ORG` scope. Inside `txManager.WithTx`: creates the `Project` row, automatically seeds the 4 canonical environments (`dev` with `tier=1, approvals=0, prod=false`; `qa` with `tier=2, approvals=0, prod=false`; `uat` with `tier=3, approvals=1, prod=false`; `prod` with `tier=4, approvals=2, prod=true`), and records `project.created` in `audit_logs`. |
| `internal/environment` | `domain.go`, `repository.go`, `postgres_repo.go`, `service.go`, `handler.go`, `service_test.go` | **`ListEnvironments(ctx, actor, projectID)`:** Returns environments ordered by `tier_order ASC`.<br>**`UpdateEnvironmentPolicy(ctx, actor, envID, cmd)`:** Requires `ORG_ADMIN` or `ENV_ADMIN`. Updates `is_production` and `required_approvals`, writing `environment.updated` to `audit_logs`. |
| `internal/service` | `domain.go`, `repository.go`, `postgres_repo.go`, `service.go`, `handler.go`, `service_test.go` | **`CreateService(ctx, actor, projectID, cmd)`:** Verifies `catalog.write` at `PROJECT` scope (or team lead status), validates `Slug`, verifies `OwnerTeamID` exists in the organization, persists the service, and audits `service.created`.<br>**`GetServiceEnvironmentContext(ctx, actor, projectID, serviceSlug, envSlug)`:** Assembles the `ServiceContextView` containing: Service metadata, Owner Team summary, target Environment details, all bound `Resources` in that environment (with `access_mode` and `connection_metadata`), upstream/downstream `ServiceDependencies` in that environment, the caller's effective RBAC permissions on that service/environment, and the timestamp/actor of the most recent audit log entry. |
| `internal/resource` | `domain.go`, `repository.go`, `postgres_repo.go`, `service.go`, `handler.go`, `service_test.go` | **`CreateResource(ctx, actor, projectID, cmd)`:** Verifies `catalog.write` at the target `EnvironmentID` scope. Validates `ResourceType` (`POSTGRES`, `REDIS`, `KAFKA`, etc.) and `ConnectionMetadata` JSON map (ensuring no forbidden keys like `"password"` or `"secret"` are passed in plain metadata), saves the resource with `version = 1`, and writes `resource.created` to `audit_logs`. |
| `internal/binding` | `domain.go`, `repository.go`, `postgres_repo.go`, `service.go`, `handler.go`, `service_test.go` | **`BindServiceToResource(ctx, actor, projectID, cmd)`:** Verifies both `Service` and `Resource` belong to `projectID` and that `Resource.EnvironmentID == cmd.EnvironmentID`. Inserts into `service_resource_bindings` and records `binding.created` in `audit_logs`.<br>**`AddServiceDependency(ctx, actor, projectID, cmd)`:** Links `CallerServiceID -> CalleeServiceID` in `EnvironmentID` with protocol (`HTTP`, `GRPC`, `KAFKA`, `EVENT`).<br>**`GetProjectTopologyGraph(ctx, actor, projectID, envID)`:** Returns a structured graph (`Nodes []GraphNode`, `Edges []GraphEdge`) of all Services and Resources in `envID` for rendering the interactive dependency map in the UI. |

---

## 12. Sub-Phase 1.7: Access Control & Scoped RBAC Bounded Context (`access`)

### 12.1 Scoped RBAC Hierarchy & Inheritance Model

Permissions in `iconfigly` are never hardcoded to user accounts. Instead, `role_bindings` grant a **Role** (`ORG_ADMIN`, `ENV_ADMIN`, `SERVICE_LEAD`, `DEVELOPER`, `VIEWER`) to a **Subject** (`USER` or `TEAM`) at a specific **Scope** in the resource hierarchy:

$$
\text{ORG} \rightarrow \text{PROJECT} \rightarrow \text{ENVIRONMENT} \rightarrow (\text{SERVICE} \lor \text{RESOURCE})
$$

When `Authorizer.Can(ctx, actor, permissionVerb, targetScope)` evaluates whether an action is permitted, it follows a deterministic **Deny-by-Default Inheritance Algorithm**:

```mermaid
flowchart TD
    Start(["authz.Can(ctx, actor, verb, targetScope)"])
    Super{"Is actor.IsSuperAdmin\ntrue?"}
    Resolve["Resolve Target Scope Ancestor Chain:\n[Target (Service/Resource), Environment, Project, Organization]"]
    Query["Query Active role_bindings WHERE:\n1. subject = actor.UserID OR subject IN actor.TeamIDs\n2. scope IN Ancestor Chain\n3. expires_at IS NULL OR expires_at > NOW()"]
    Loop{"Does ANY matched RoleBinding\ninclude 'verb' in its Role Matrix?"}
    Allow(["Return ALLOWED (true)"])
    Deny(["Return DENIED (false -> 403 Forbidden)"])

    Start --> Super
    Super -->|"Yes"| Allow
    Super -->|"No"| Resolve
    Resolve --> Query
    Query --> Loop
    Loop -->|"Yes"| Allow
    Loop -->|"No"| Deny
```

### 12.2 Phase 1 Role-to-Permission Matrix

| Permission Verb | `ORG_ADMIN` | `ENV_ADMIN` (DevOps) | `SERVICE_LEAD` | `DEVELOPER` | `VIEWER` |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **`org.manage`** (Manage org & users) | Allowed | Denied | Denied | Denied | Denied |
| **`catalog.read`** (View projects, services, resources, graph) | Allowed | Allowed | Allowed | Allowed | Allowed |
| **`catalog.write`** (Create/update services, resources, bindings) | Allowed | Allowed | Allowed | Denied | Denied |
| **`access.read`** (Inspect RBAC bindings & *"Who Has Access?"*) | Allowed | Allowed | Allowed | Allowed | Allowed |
| **`access.manage`** (Grant or revoke RBAC `role_bindings`) | Allowed | Allowed (at Env/Resource scope) | Allowed (at Service scope) | Denied | Denied |
| **`audit.read`** (Query immutable `audit_logs`) | Allowed | Allowed | Allowed | Denied | Allowed |

### 12.3 The "Who Has Access?" Inspector (`InspectTargetAccess`)

When a user opens a Service (`payment-service`) or a Resource (`payments-db` in `UAT`) and clicks **"Who Has Access?"**, `access.Service.InspectTargetAccess` computes the complete effective access table:
1. Walks the target's ancestor chain (`RESOURCE -> ENVIRONMENT -> PROJECT -> ORG`).
2. Fetches all active `role_bindings` attached to any scope in that chain.
3. Groups results into **Team Grants** (e.g., `DevOps Team -> ENV_ADMIN (Inherited from UAT Environment)`) and **Direct User Grants** (e.g., `Alice -> DEVELOPER (Direct on payments-db, Expires in 47m)`).

---

## 13. Sub-Phase 1.8: Immutable Audit Trail Bounded Context (`audit`)

### 13.1 Cryptographic Hash Chain Design

Every mutating use case across `auth`, `user`, `team`, `project`, `environment`, `service`, `resource`, `binding`, and `access` calls `audit.Service.Record(txCtx, entry)` **inside the same database transaction** as the domain state change.

To guarantee tamper-evidence:
1. Inside the transaction, `AuditRepository.AppendWithLock(txCtx, entry)` acquires an organization-scoped advisory lock (`pg_advisory_xact_lock(hashtext(organization_id::text))`) to serialize concurrent audit inserts within the same tenant.
2. It fetches the `entry_hash` of the most recent `audit_logs` row for that `organization_id` (or uses `"GENESIS"` if no prior rows exist) and sets `entry.PrevHash`.
3. It computes the deterministic SHA-256 digest:

$$
\text{entry\_hash} = \text{SHA256}(\text{prev\_hash} \parallel \text{org\_id} \parallel \text{actor\_id} \parallel \text{action} \parallel \text{target\_type} \parallel \text{target\_id} \parallel \text{canonical\_json(metadata)} \parallel \text{created\_at\_unix\_micro})
$$

4. It inserts the row into `audit_logs`. Because `trg_audit_logs_immutable` blocks `UPDATE` and `DELETE` at the PostgreSQL engine level, the audit trail is both append-only and cryptographically verifiable via `GET /api/v1/audit-logs/verify`.

---

## 14. Sub-Phase 1.9: Next.js Web Dashboard Architecture & UI (`iconfigly-web`)

### 14.1 Clean Frontend Architecture Principles
* **Same-Origin Server Proxy (`src/app/api/v1/[...path]/route.ts`):** Browser code never calls `http://api:8080` directly. All client requests call `/api/v1/...` on `http://localhost:3000`. The Next.js Route Handler forwards the method, query string, request body, `Cookie`, and `X-CSRF-Token` headers to `${process.env.API_URL}/api/v1/...` (`http://api:8080`) and streams the response (including `Set-Cookie` headers) back to the browser.
* **Feature-Sliced Modules (`src/features/*`):** UI components, form schemas, and TanStack Query hooks are organized by bounded context (`auth`, `teams`, `catalog`, `access`, `audit`), keeping `src/app/` route files thin and declarative.

### 14.2 Complete Phase 1 UI Screen & Component Specifications

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/` | `app/page.tsx` | Calls `/api/v1/auth/setup-status` and `/api/v1/auth/me`. Redirects to `/setup` if uninitialized, `/login` if unauthenticated, or `/dashboard` if authenticated. |
| `/setup` | `app/(auth)/setup/page.tsx` | **First-Run Initialization Wizard:** Form capturing Organization Name, Organization Slug (auto-generated from name), Admin Full Name, Email, and Password. Submits to `POST /api/v1/auth/setup` and redirects to `/dashboard`. |
| `/login` | `app/(auth)/login/page.tsx` | **Sign-In Screen:** Email & password form with RFC 9457 error alert banner. Submits to `POST /api/v1/auth/login`. |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | **Organization Overview:** Displays summary metric cards (Total Projects, Microservices, Infrastructure Resources, Active Teams), Quick-Start action buttons, and the 10 most recent Audit Log entries. |
| `/teams` & `/teams/[teamId]` | `app/(dashboard)/teams/page.tsx`<br>`app/(dashboard)/teams/[teamId]/page.tsx` | **Teams Management:** Lists teams with member counts and owned service counts. Detail page allows adding organization users to the team as `LEAD` or `MEMBER` and viewing all services and resources owned by the team. |
| `/users` | `app/(dashboard)/users/page.tsx` | **User Directory:** Lists all users in the organization, their status (`ACTIVE` / `DISABLED`), Super Admin badge, and a modal for `ORG_ADMIN`s to create new user accounts. |
| `/projects/[projectId]/environments` | `app/(dashboard)/projects/[projectId]/environments/page.tsx` | **Environment Matrix:** Displays the ordered pipeline stages (`DEV` $\rightarrow$ `QA` $\rightarrow$ `UAT` $\rightarrow$ `PROD`), production protection badges, and approval count settings (`required_approvals`). |
| `/projects/[projectId]/services` | `app/(dashboard)/projects/[projectId]/services/page.tsx` | **Microservice Catalog:** Searchable table of all services in the project showing Slug, Owner Team badge, Repository link, Runbook link, and a `Register Service` modal. |
| `/projects/[projectId]/services/[serviceSlug]` | `app/(dashboard)/projects/[projectId]/services/[serviceSlug]/page.tsx` | **Single-Pane Service Context View:** Features an **Environment Switcher Bar** (`DEV` \| `QA` \| `UAT` \| `PROD`). For the selected environment, displays:<br>1. **Service Header:** Owner Team, Repo URL, Runbook URL, and Caller's Effective Permission Badge (`READ`, `WRITE`, `ADMIN`).<br>2. **Bound Infrastructure Resources Card:** Lists every PostgreSQL, Redis, Kafka, or API bound in that environment, its `access_mode` (`READ_WRITE`, `READ`), and its connection metadata (`host`, `port`, `db`). Includes a `+ Bind Resource` button.<br>3. **Service Dependencies Card:** Shows upstream callers and downstream callees with protocol badges (`HTTP`, `GRPC`, `KAFKA`).<br>4. **Last Activity Footer:** Shows the latest audit event affecting this service. |
| `/projects/[projectId]/resources` & `[resourceId]` | `app/(dashboard)/projects/[projectId]/resources/page.tsx` | **Infrastructure Resource Catalog:** Filterable by Environment (`DEV`/`QA`/`UAT`/`PROD`) and Resource Type (`POSTGRES`, `REDIS`, `KAFKA`, etc.). Detail view shows all microservices bound to that resource (previewing the shared dependency graph) and connection metadata. |
| `/projects/[projectId]/graph` | `app/(dashboard)/projects/[projectId]/graph/page.tsx` | **Interactive Topology Graph:** Visual node-and-edge diagram per environment showing how Microservices connect to shared Databases, Caches, and Queues, highlighting shared resources connected to multiple services. |
| `/projects/[projectId]/access` | `app/(dashboard)/projects/[projectId]/access/page.tsx` | **Scoped RBAC & "Who Has Access?" Inspector:** Two-tab interface:<br>1. **Role Bindings Tab:** Create and revoke role grants (`Subject: Team/User` $\rightarrow$ `Role` $\rightarrow$ `Scope: Org/Project/Env/Service/Resource` + optional expiration time).<br>2. **"Who Has Access?" Inspector Tab:** Select any Environment, Service, or Resource to see the exact list of Teams and Users with effective access, the role granted, and whether it is direct or inherited. |
| `/audit` | `app/(dashboard)/audit/page.tsx` | **Immutable Audit Log Explorer:** Filterable by Action, Target Type, Environment, and Actor. Includes a `Verify Hash Chain Integrity` button and a slide-over drawer displaying the full JSON metadata and cryptographic `prev_hash` / `entry_hash` values. |
| `/settings/tokens` | `app/(dashboard)/settings/tokens/page.tsx` | **Personal Access Tokens:** Allows developers to generate scoped PATs (`icfg_pat_...`), displays the raw token once with a copy button, and lists active tokens with last-used timestamps and a `Revoke` button. |

---

## 15. Sub-Phase 1.10: Comprehensive Testing Strategy, CI Pipelines & Phase 1 Verification

### 15.1 Complete Phase 1 REST API Endpoint Catalog

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Public | Liveness probe returning `200 OK`. |
| `GET` | `/ready` | Public | Readiness probe verifying PostgreSQL pool connectivity (`200` or `503`). |
| `GET` | `/api/v1/auth/setup-status` | Public | Returns `{"initialized": bool}` indicating whether an organization exists. |
| `POST` | `/api/v1/auth/setup` | Public (Only when `initialized == false`) | Creates initial Organization, Super Admin User, `ORG_ADMIN` binding, and session. |
| `POST` | `/api/v1/auth/login` | Public | Authenticates email/password and sets `HttpOnly` session cookie. |
| `POST` | `/api/v1/auth/logout` | Authenticated | Revokes current session in PostgreSQL and clears cookie. |
| `GET` | `/api/v1/auth/me` | Authenticated | Returns current `Actor` profile, team memberships, and `csrf_token`. |
| `POST` | `/api/v1/auth/tokens` | Authenticated | Generates a new Personal Access Token (`icfg_pat_...`). |
| `GET` | `/api/v1/auth/tokens` | Authenticated | Lists active Personal Access Tokens for the current user. |
| `DELETE` | `/api/v1/auth/tokens/{tokenID}` | Authenticated | Revokes a Personal Access Token. |
| `GET` | `/api/v1/users` | `catalog.read` | Lists users in the organization. |
| `POST` | `/api/v1/users` | `org.manage` | Creates a new user account in the organization. |
| `PATCH` | `/api/v1/users/{userID}/status` | `org.manage` | Enables or disables a user account (and revokes sessions if disabled). |
| `GET` | `/api/v1/teams` | `catalog.read` | Lists teams in the organization with member and service counts. |
| `POST` | `/api/v1/teams` | `catalog.write` | Creates a new team (`Payments Team`, `DevOps Team`, etc.). |
| `GET` | `/api/v1/teams/{teamID}` | `catalog.read` | Returns team details, members (`LEAD`/`MEMBER`), and owned services. |
| `POST` | `/api/v1/teams/{teamID}/members` | `catalog.write` or Team `LEAD` | Adds a user to a team with role `LEAD` or `MEMBER`. |
| `DELETE` | `/api/v1/teams/{teamID}/members/{userID}` | `catalog.write` or Team `LEAD` | Removes a user from a team. |
| `GET` | `/api/v1/projects` | `catalog.read` | Lists projects in the organization. |
| `POST` | `/api/v1/projects` | `catalog.write` | Creates a project and auto-seeds `DEV`, `QA`, `UAT`, and `PROD` environments. |
| `GET` | `/api/v1/projects/{projectID}/environments` | `catalog.read` | Lists environments ordered by `tier_order`. |
| `PATCH` | `/api/v1/projects/{projectID}/environments/{envID}` | `access.manage` | Updates environment approval threshold (`required_approvals`) or production flag. |
| `GET` | `/api/v1/projects/{projectID}/services` | `catalog.read` | Lists microservices in the project (supports search & owner team filter). |
| `POST` | `/api/v1/projects/{projectID}/services` | `catalog.write` | Registers a new microservice in the project catalog. |
| `GET` | `/api/v1/projects/{projectID}/services/{serviceSlug}/context` | `catalog.read` (at Env/Service scope) | Returns the complete Single-Pane Service Context for `?env={envSlug}`. |
| `GET` | `/api/v1/projects/{projectID}/resources` | `catalog.read` | Lists infrastructure resources (filterable by `?env_id=` and `?type=`). |
| `POST` | `/api/v1/projects/{projectID}/resources` | `catalog.write` (at Env scope) | Registers an infrastructure resource (`payments-db`, `redis-main`, etc.). |
| `POST` | `/api/v1/projects/{projectID}/bindings` | `catalog.write` (at Env scope) | Binds a microservice to an infrastructure resource in an environment. |
| `DELETE` | `/api/v1/projects/{projectID}/bindings/{bindingID}` | `catalog.write` (at Env scope) | Removes a service-to-resource binding. |
| `POST` | `/api/v1/projects/{projectID}/dependencies` | `catalog.write` | Registers a directed service-to-service dependency in an environment. |
| `GET` | `/api/v1/projects/{projectID}/graph` | `catalog.read` | Returns nodes and edges for the interactive dependency graph in `?env={envSlug}`. |
| `GET` | `/api/v1/projects/{projectID}/access/bindings` | `access.read` | Lists RBAC role bindings within the project hierarchy. |
| `POST` | `/api/v1/projects/{projectID}/access/bindings` | `access.manage` | Grants a role binding (`USER` or `TEAM`) at a specified scope. |
| `DELETE` | `/api/v1/projects/{projectID}/access/bindings/{bindingID}` | `access.manage` | Revokes a role binding. |
| `GET` | `/api/v1/projects/{projectID}/access/inspect` | `access.read` | Computes *"Who Has Access?"* for `?scope_type=...&scope_id=...`. |
| `GET` | `/api/v1/audit-logs` | `audit.read` | Cursor-paginated query over immutable audit logs. |
| `GET` | `/api/v1/audit-logs/verify` | `audit.read` | Recomputes and verifies the SHA-256 hash chain across all organization audit logs. |

### 15.2 Phase 1 Testing Matrix

| Test Layer | Target Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. Value Object & Crypto Unit Tests** | `valueobject_test.go`, `crypto_test.go` | Table-driven validation of valid/invalid Slugs and Emails; Argon2id hashing and wrong-password rejection; SHA-256 token hash determinism. |
| **2. Scoped RBAC Authorizer Table-Driven Tests** | `internal/access/authorizer_test.go` | Tests 25+ permission combinations: Super Admin bypass, `ORG` scope inheritance down to `RESOURCE`, `TEAM` grant inherited by team members, `ENVIRONMENT`-scoped grant allowing `UAT` read while denying `PROD` read (`403`), expired `role_binding` (`expires_at < NOW()`) automatically denied, and ungranted user denied by default. |
| **3. Domain & Application Service Unit Tests** | `internal/*/service_test.go` | Tests first-run setup conflict when run twice, atomic project + 4 default environments creation, cross-environment service-resource binding rejection, self-dependency cycle rejection, and audit log emission on every mutation. |
| **4. PostgreSQL Integration Tests** | `internal/database/tx_test.go`, `internal/audit/service_test.go` | Verifies `TxManager.WithTx` rollback on error, verifies the PostgreSQL trigger `trg_audit_logs_immutable` rejects `UPDATE` and `DELETE` on `audit_logs`, and verifies concurrent audit entries maintain an unbroken `prev_hash -> entry_hash` chain. |
| **5. End-to-End Browser Tests (Playwright)** | `iconfigly-web/e2e/phase1-foundation.spec.ts` | Automates the full Phase 1 Demo Story in a headless browser against the running Docker Compose stack. |

### 15.3 End-to-End Phase 1 Demo Scenario & Definition of Done Checklist

To mark Phase 1 100% complete, the following end-to-end workflow must execute cleanly from a fresh Docker volume state:

* [ ] **Step 1 (Infrastructure & Migrations):** Starting `docker compose up -d` and running the `migrate` tool profile applies migrations `000001` through `000009` with zero errors; `GET /health` and `GET /ready` return `200 OK`.
* [ ] **Step 2 (First-Run Setup):** Opening `http://localhost:3000` automatically redirects to `/setup`. Submitting Organization `Acme Fintech` (`acme-fintech`) and Admin `Alice` initializes the organization, logs Alice in, and redirects to `/dashboard`.
* [ ] **Step 3 (Teams & Users):** Alice creates three teams (`Payments Team`, `QA Team`, `DevOps Team`), creates user `Bob` (a developer), and adds `Bob` as a `MEMBER` of `Payments Team`.
* [ ] **Step 4 (Project & Auto-Seeded Environments):** Alice creates Project `Core Banking` (`core-banking`), which automatically provisions `DEV`, `QA`, `UAT`, and `PROD` environments.
* [ ] **Step 5 (Service & Resource Catalog):** Alice registers microservice `payment-service` (owned by `Payments Team`) and registers three resources in `UAT`: `payments-db` (`POSTGRES`), `payment-cache` (`REDIS`), and `payment-events` (`KAFKA`).
* [ ] **Step 6 (Bindings & Single-Pane Context):** Alice binds `payments-db`, `payment-cache`, and `payment-events` to `payment-service` in `UAT`. Navigating to the `payment-service` context screen and selecting the `UAT` tab displays all three bound infrastructure resources, their connection metadata, and `Payments Team` ownership in one unified view.
* [ ] **Step 7 (Scoped RBAC & "Who Has Access?"):** Alice grants `Payments Team` the `DEVELOPER` role on `DEV` and `QA`, the `VIEWER` role on `UAT`, and no role on `PROD`. Opening the *"Who Has Access?"* inspector for `payments-db` in `UAT` displays `Payments Team (VIEWER - Inherited from UAT)`. Logging in as `Bob` allows viewing `UAT` context (`200 OK`), while attempting to create a resource in `UAT` or access `PROD` is blocked (`403 Forbidden`).
* [ ] **Step 8 (Cryptographic Audit Verification):** Opening `/audit` displays every action from `org.initialized` through `access.role_granted` in chronological order, and clicking `Verify Hash Chain Integrity` confirms 100% hash continuity.
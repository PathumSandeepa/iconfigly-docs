# iconfigly — Phase 4 Engineering Blueprint: Developer CLI (`iconfigly-cli`), Polyglot SDKs (`js`, `go`, `java`), Runtime Bundle Delivery, Rollout Tracking & Drift Detection

> **Document Scope:** Phase 4 Complete Engineering Plan (Sub-Phase 4.0 to Sub-Phase 4.9)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Pull-With-ETag Runtime Delivery + Heartbeat Telemetry & Drift State Machine
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; building cross-platform Go CLI tooling, polyglot SDKs, and distributed fleet telemetry from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 4 Executive Summary & Scope](#1-phase-4-executive-summary--scope)
2. [Phase 4 Architectural Decisions & Rationale (ADRs)](#2-phase-4-architectural-decisions--rationale-adrs)
3. [Phase 4 DDD Bounded Contexts & Runtime Telemetry Sequence Flows](#3-phase-4-ddd-bounded-contexts--runtime-telemetry-sequence-flows)
4. [Complete Phase 4 Folder & File Evolution Across 6 Repositories](#4-complete-phase-4-folder--file-evolution-across-6-repositories)
5. [Sub-Phase 4.0: Relational Data Model & Database Migrations (`000018`–`000019`)](#5-sub-phase-40-relational-data-model--database-migrations-000018000019)
6. [Sub-Phase 4.1: Unified Runtime Bundle Assembler & Conditional ETag Caching (`internal/runtime`)](#6-sub-phase-41-unified-runtime-bundle-assembler--conditional-etag-caching-internalruntime)
7. [Sub-Phase 4.2: Telemetry, Rollout Progress & Drift Detection Bounded Context (`internal/telemetry`)](#7-sub-phase-42-telemetry-rollout-progress--drift-detection-bounded-context-internaltelemetry)
8. [Sub-Phase 4.3: Background Drift & Stale-Instance Sweeper Worker (`internal/worker/drift_worker.go`)](#8-sub-phase-43-background-drift--stale-instance-sweeper-worker-internalworkerdrift_workergo)
9. [Sub-Phase 4.4: Cross-Platform Developer CLI Architecture (`iconfigly-cli`)](#9-sub-phase-44-cross-platform-developer-cli-architecture-iconfigly-cli)
10. [Sub-Phase 4.5: Node.js & TypeScript SDK Architecture (`iconfigly-sdk-js`)](#10-sub-phase-45-nodejs--typescript-sdk-architecture-iconfigly-sdk-js)
11. [Sub-Phase 4.6: Idiomatic Go SDK Architecture (`iconfigly-sdk-go`)](#11-sub-phase-46-idiomatic-go-sdk-architecture-iconfigly-sdk-go)
12. [Sub-Phase 4.7: Java 21 & Spring Boot 3 Starter SDK Architecture (`iconfigly-sdk-java`)](#12-sub-phase-47-java-21--spring-boot-3-starter-sdk-architecture-iconfigly-sdk-java)
13. [Sub-Phase 4.8: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 4)](#13-sub-phase-48-nextjs-web-dashboard-architecture--ui-iconfigly-web-phase-4)
14. [Sub-Phase 4.9: Comprehensive Testing Strategy & Phase 4 Verification Checklist](#14-sub-phase-49-comprehensive-testing-strategy--phase-4-verification-checklist)

---

## 1. Phase 4 Executive Summary & Scope

### 1.1 Phase 4 Objective

Phases 1 through 3 built the complete **Governance Control Plane** and **OpenBao Secret Engine integration**—allowing teams to catalog services and resources, compute blast-radius impact, enforce multi-approver Change Requests, rotate secrets in OpenBao, and issue ephemeral database leases.

Phase 4 closes the operational loop between **Control Plane State** (what version a microservice *should* be running after a Change Request is applied) and **Runtime Reality** (what version running microservice instances are *actually* using in memory). By the end of Phase 4:

1. **Zero-Disk-Footprint CLI (`iconfigly-cli`):** Developers can run `iconfigly service context payment-service --env uat` from their terminal or execute `iconfigly run --project core-banking --service payment-service --env dev -- npm start` to inject authorized configurations, resource connection strings, and OpenBao secrets directly into a child process's memory without ever writing a `.env` file to disk.
2. **Polyglot Microservice SDKs (`iconfigly-sdk-js`, `iconfigly-sdk-go`, `iconfigly-sdk-java`):** Node.js/TypeScript, Go, and Java/Spring Boot microservices can load versioned configuration bundles at startup, poll for approved updates using lightweight `ETag` conditional requests, and emit periodic **Instance Heartbeats** (`POST /api/v1/telemetry/heartbeat`).
3. **Live Rollout Progress & Configuration Drift Detection (`internal/telemetry`):** When a Change Request is applied in `UAT` or `PROD` (e.g., upgrading `payment-service` from `v14` to `v15` or rotating `payments-db` secret from `v1` to `v2`), `iconfigly` tracks every running instance in real time (`6 / 8 instances updated to v15; 2 instances drifted on v14`) and automatically alerts owning teams if a rollout stalls or an instance drifts!

### 1.2 Repository Activation in Phase 4

Phase 4 activates **four new repositories** (`iconfigly-cli`, `iconfigly-sdk-js`, `iconfigly-sdk-go`, `iconfigly-sdk-java`), bringing 8 of the 9 ecosystem repositories into active operation:

| Repository | Phase 4 Status | Role in Phase 4 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds CLI & SDK test runner containers (`cli-dev`, `sdk-test`) under the `tools` profile in `compose.yaml` so CLI and SDK builds/tests run 100% inside Docker on Windows 11 + WSL2. |
| **`iconfigly-api`** | **Active** | Adds migrations `000018`–`000019`, `internal/runtime` (atomic config + resource + secret bundle assembler with `ETag` support), `internal/telemetry` (heartbeat ingestion, rollout tracker, drift detector), and `internal/worker/drift_worker.go`. |
| **`iconfigly-web`** | **Active** | Adds Live Instance Rollout Progress Bars on Change Requests, Fleet Instances & Drift Status table on Service Context views, and an interactive CLI/SDK Quick-Start Snippet Drawer. |
| **`iconfigly-cli`** | **Activated in Phase 4** | Cross-platform Go CLI (`iconfigly` / alias `icfg`) for terminal login, context inspection, config diffing, temporary access credentials, and `iconfigly run` process injection + heartbeat reporting. |
| **`iconfigly-sdk-js`** | **Activated in Phase 4** | Zero-dependency TypeScript / Node.js 26 SDK with typed config loading, hot-reload event emitter, and automatic heartbeat timer. |
| **`iconfigly-sdk-go`** | **Activated in Phase 4** | Idiomatic Go 1.27 SDK with `context.Context` lifecycle management, atomic snapshot swapping, and background heartbeat goroutine. |
| **`iconfigly-sdk-java`** | **Activated in Phase 4** | Multi-module Maven project (`Java 21`) providing both `iconfigly-client` and `iconfigly-spring-boot-starter` (`PropertySource` + `@ConfigurationProperties` binding + scheduled heartbeat reporter). |
| **`iconfigly-docs`** | **Active** | Phase 4 engineering blueprint, CLI reference manual, and SDK integration guides. |
| **`iconfigly-operator`** | Dormant (Phase 5) | Empty repository placeholder (activated in Phase 5 for Kubernetes CRD & ConfigMap/Secret reconciliation). |

### 1.3 Scope Boundaries for Phase 4

| In Scope for Phase 4 | Out of Scope for Phase 4 (Deferred to Later Phases) |
| :--- | :--- |
| Unified Runtime Bundle API (`GET /api/v1/runtime/bundle`) with deterministic `ETag` (`If-None-Match` $\rightarrow$ `304 Not Modified`) and optional secret resolution | Kubernetes `kind` cluster, Helm chart (`helm/iconfigly`), and `iconfigly-operator` syncing Kubernetes `ConfigMap`/`Secret` objects (Phase 5) |
| Instance Heartbeat Ingestion (`POST /api/v1/telemetry/heartbeat`) & Graceful Deregistration (`POST /api/v1/telemetry/deregister`) | Native OIDC/SSO login and GitHub repository/PR status webhooks (Phase 6) |
| Automated Rollout Progress Tracking (`service_rollouts` table) linked to applied Change Requests (`IN_PROGRESS` $\rightarrow$ `COMPLETED` or `STALLED`) | Prometheus `/metrics` endpoint, Grafana dashboards, and `k6` load testing suite (Phase 7) |
| Configuration & Secret Version Drift Detection (`IN_SYNC`, `DRIFTED`, `STALE`) and background `DriftWorker` alerting via Transactional Outbox | GoReleaser multi-OS binary publishing to GitHub Releases & npm/Maven Central publishing (Phase 8) |
| Complete `iconfigly-cli` (`login`, `whoami`, `service context`, `config pull`, `config diff`, `run`, `access request`, `access credentials`) | |
| Complete `iconfigly-sdk-js`, `iconfigly-sdk-go`, and `iconfigly-sdk-java` (including Spring Boot Starter) | |

---

## 2. Phase 4 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-031** | **Runtime Config Delivery Protocol** | **Single Atomic Runtime Bundle Endpoint (`GET /api/v1/runtime/bundle`) + HTTP `ETag` (`304 Not Modified`)** | A starting microservice or `iconfigly run` process needs three things at once: plain `config_items`, bound `resource` connection metadata (`host`, `port`), and resolved `secret_refs`. Returning a single canonical bundle with a SHA-256 `ETag` allows SDKs to poll every 30s with near-zero bandwidth and database load when nothing has changed. | **Requiring SDKs to make 15 separate REST calls per startup/poll:** Causes high latency, race conditions between config and secret versions, and thundering-herd API load. |
| **ADR-032** | **CLI Process Secret Injection** | **In-Memory Child Process Environment Injection (`os/exec` in `iconfigly run`) — Zero `.env` Files on Disk** | `iconfigly run` fetches the bundle into Go memory, merges the key-value pairs with `os.Environ()`, spawns the child process (`cmd.Env`), forwards OS signals (`SIGINT`/`SIGTERM`), and exits. Secrets never touch the developer's SSD or git working tree. | **Writing a temporary `.env` file to disk and deleting it on exit:** If the process crashes or is `SIGKILL`ed, plaintext secrets remain on disk and risk being committed to Git. |
| **ADR-033** | **Instance Identity & Heartbeat Deduplication** | **Composite Instance Key `(environment_id, service_id, instance_id)` with Graceful Deregistration** | Container restarts or auto-scaling events create ephemeral instances. Using a deterministic or UUIDv7 `instance_id` (or K8s Pod name) with an explicit `POST /telemetry/deregister` hook on `SIGTERM` prevents terminated containers from falsely appearing as "drifted" during deployments. | **Tracking instances by IP address alone:** Multiple local processes or containers behind NAT share IPs, causing heartbeat collisions. |
| **ADR-034** | **Drift Detection Definition** | **Multi-Dimensional Version Vector Comparison ($\text{ConfigVersion} \land \text{ResourceVersions} \land \text{SecretVersions}$)** | Drift occurs not only when a service's own `config_items` change, but also when a bound database's connection metadata or `secret_ref` version is rotated! Comparing the full version vector catches both service-level and shared-resource drift. | **Checking only a single service config integer:** Would fail to detect when `payments-db` rotated its password to `v2` while `payment-service` is still connected using `v1`. |
| **ADR-035** | **Thundering Herd Prevention in SDKs** | **Full Jitter on Poll & Heartbeat Intervals ($T_{\text{sleep}} = T_{\text{base}} \pm \text{Uniform}(0, 0.15 \times T_{\text{base}})$)** | If 50 microservice instances start simultaneously after a deployment, fixed 30.0s timers will hit `iconfigly-api` at the exact same millisecond forever. Adding $\pm 15\%$ random jitter spreads requests smoothly over time. | **Fixed interval timers (`setInterval(fn, 30000)`):** Causes periodic CPU and database connection spikes every 30 seconds. |
| **ADR-036** | **CLI Framework** | **Go `spf13/cobra` + Standard Library `net/http` + `0600` Credential Store** | `cobra` is the industry standard powering `kubectl`, `docker`, `gh`, and `helm`. Pairing it with a strict `0600` permission check on `~/.config/iconfigly/credentials.json` ensures PAT tokens are protected on Linux/macOS/WSL2. | **Node.js CLI (`oclif` / `commander`):** Requires users to have a specific Node.js runtime installed on target servers, whereas Go compiles to a single dependency-free static binary. |
| **ADR-037** | **Node.js / TypeScript SDK Design** | **Zero-Dependency Native `fetch` + `EventEmitter` (`iconfigly-sdk-js`)** | Node.js 20–26 includes native `fetch` and `AbortSignal.timeout`. Building `iconfigly-sdk-js` with zero runtime `node_modules` dependencies eliminates supply-chain vulnerabilities and keeps bundle size under $15\text{ KB}$. | **Depending on `axios` or `lodash`:** Introduces transitive security advisories and version conflicts in consumer apps. |
| **ADR-038** | **Java SDK & Spring Boot Integration** | **Java 21 `HttpClient` Core (`iconfigly-client`) + Spring Boot 3 `EnvironmentPostProcessor` (`iconfigly-spring-boot-starter`)** | Enterprise banking and fintech teams heavily use Spring Boot. Providing a native `EnvironmentPostProcessor` injects `iconfigly` configs directly into Spring's `Environment` before beans initialize, so `@Value("${db.pool.max}")` works out of the box! | **Requiring Java developers to manually call `iconfiglyClient.get("KEY")` everywhere:** Breaks standard Spring Boot dependency injection patterns. |
| **ADR-039** | **Containerized Polyglot Dev & Testing** | **Docker Compose `tools` Profile Services for CLI, JS, Go, and Java SDKs** | Preserves our strict rule that you never need Go, Node.js, or Maven/JDK installed on Windows 11. All 4 new repositories are built and tested inside reproducible Docker containers mounting the workspace. | **Requiring local JDK 21, Maven, and Go installations on Windows:** Breaks environment reproducibility. |

---

## 3. Phase 4 DDD Bounded Contexts & Runtime Telemetry Sequence Flows

### 3.1 Phase 4 Bounded Context & Multi-Repository Ecosystem Map

```
flowchart TD
    subgraph ExternalRuntimes["Developer Terminal & Running Microservice Fleet (NEW REPOS)"]
        CLI["iconfigly-cli\n(iconfigly run / context / pull)"]
        SDKJS["iconfigly-sdk-js\n(Node.js / TypeScript Services)"]
        SDKGO["iconfigly-sdk-go\n(Go Microservices)"]
        SDKJAVA["iconfigly-sdk-java\n(Java 21 / Spring Boot Services)"]
    end

    subgraph ControlPlaneAPI["iconfigly-api (Go Modular Monolith)"]
        RunAPI["internal/runtime (NEW)\n(Unified Bundle Assembler & ETag Engine)"]
        TelAPI["internal/telemetry (NEW)\n(Heartbeat Ingestor, Rollout & Drift Engine)"]
        DriftWrk["internal/worker/drift_worker.go (NEW)\n(Stale Sweeper & Stalled Rollout Alerter)"]
        Chg["internal/change (UPDATED)\n(Creates RolloutTracker on Apply)"]
        Catalog["internal/configitem + resource + secretref + binding\n(Phase 1-3 State & OpenBao Resolution)"]
        Notif["internal/notification + audit\n(Outbox Alerts & Hash-Chained Audit)"]
    end

    subgraph Storage["State & Cryptographic Engines"]
        PG[("PostgreSQL 18\n(instance_heartbeats & service_rollouts)")]
        Bao["OpenBao Server\n(KV v2 & Dynamic Leases)"]
    end

    CLI -->|"1. GET /api/v1/runtime/bundle\n2. POST /api/v1/telemetry/heartbeat"| RunAPI
    SDKJS -->|"GET /bundle (If-None-Match)\nPOST /heartbeat"| RunAPI
    SDKGO -->|"GET /bundle (If-None-Match)\nPOST /heartbeat"| RunAPI
    SDKJAVA -->|"GET /bundle (If-None-Match)\nPOST /heartbeat"| RunAPI

    CLI --> TelAPI
    SDKJS --> TelAPI
    SDKGO --> TelAPI
    SDKJAVA --> TelAPI

    RunAPI --> Catalog
    Catalog --> Bao
    Chg -->|"Initializes Rollout"| TelAPI
    TelAPI --> PG
    DriftWrk --> TelAPI
    DriftWrk --> Notif
```

### 3.2 Sequence Flow 1: `iconfigly run` Zero-Disk Secret Injection & Lifecycle

```
sequenceDiagram
    actor Dev as Developer (Terminal)
    participant CLI as iconfigly-cli (iconfigly run)
    participant API as iconfigly-api (runtime & telemetry)
    participant Bao as OpenBao Server
    participant Child as Child Process (e.g. npm start)

    Dev->>CLI: iconfigly run --project core-banking --service payment-service --env uat -- npm start
    CLI->>CLI: Load PAT from ~/.config/iconfigly/credentials.json (Verify 0600 perms)
    CLI->>API: GET /api/v1/runtime/bundle?project=core-banking&service=payment-service&env=uat&resolve_secrets=true
    API->>API: Verify RBAC (config.read + secretref.resolve on payment-service & bound resources)
    API->>Bao: Resolve attached KV v2 secrets (payments-db#password, payment-cache#token)
    Bao-->>API: Resolved secret values (wrapped in redact.SecretString)
    API->>API: Write audit_logs (action="runtime.bundle_resolved") + Compute Bundle ETag
    API-->>CLI: 200 OK (ConfigItems + Resource Env Vars + Resolved Secrets + BundleChecksum + VersionVector)
    CLI->>Child: Spawn os/exec "npm start" with in-memory Env (Zero .env files written to disk!)
    CLI->>API: POST /api/v1/telemetry/heartbeat (instance_id, status=IN_SYNC, config_version=15)

    loop Every 30s (+ Jitter) While Child Process Runs
        CLI->>API: POST /api/v1/telemetry/heartbeat (instance_id, active_version_vector)
        API-->>CLI: 200 OK (drift_status="IN_SYNC", latest_etag="sha256:...")
    end

    Dev->>CLI: Presses Ctrl+C (SIGINT)
    CLI->>Child: Forward SIGINT & wait for graceful exit
    CLI->>API: POST /api/v1/telemetry/deregister (instance_id)
    API-->>CLI: 204 No Content
```

### 3.3 Sequence Flow 2: Change Request Apply $\rightarrow$ Live Rollout Tracking & Drift Alerting

```
sequenceDiagram
    actor Lead as Service Lead (Browser)
    participant ChgSvc as change.Service
    participant TelSvc as telemetry.Service
    participant SDK1 as Instance 1 & 2 (Updated)
    participant SDK3 as Instance 3 (Stuck on v14)
    participant Worker as worker.DriftWorker

    Lead->>ChgSvc: POST /change-requests/{id}/apply (Updates payment-service config v14 -> v15)
    ChgSvc->>TelSvc: StartRolloutForChange(txCtx, changeReq, affectedServices)
    TelSvc->>TelSvc: INSERT service_rollouts (expected_config_ver=15, total=3, updated=0, status='IN_PROGRESS')
    TelSvc->>TelSvc: Mark existing active instances of payment-service as DRIFTED (v14 != v15)

    SDK1->>TelSvc: POST /telemetry/heartbeat (instance_id="pod-1", config_version=15)
    TelSvc->>TelSvc: Compare (15 == 15) -> Set pod-1 status = 'IN_SYNC'
    TelSvc->>TelSvc: Recalculate Rollout: 2 / 3 instances updated (66.7%)

    SDK3->>TelSvc: POST /telemetry/heartbeat (instance_id="pod-3", config_version=14)
    TelSvc->>TelSvc: Compare (14 != 15) -> Keep pod-3 status = 'DRIFTED' (Reason: "config_version 14 != expected 15")

    Note over Worker,TelSvc: If pod-3 remains DRIFTED beyond rollout_timeout (e.g. 5 mins)
    Worker->>TelSvc: EvaluateActiveRolloutsAndDrift(ctx, now)
    TelSvc->>TelSvc: Transition service_rollout status = 'STALLED'
    TelSvc->>Worker: Enqueue outbox_events (type="telemetry.drift_detected", affected_instance="pod-3")
```

---

## 4. Complete Phase 4 Folder & File Evolution Across 6 Repositories

### 4.1 `iconfigly-api` File Additions & Updates

Files marked `[NEW]` are created in Phase 4; files marked `[UPDATED]` evolve existing Phase 1–3 files cleanly.

```
iconfigly-api/
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds /api/v1/runtime/bundle and /api/v1/telemetry/* schemas & routes
├── migrations/
│   ├── 000001..000017                        # Unchanged Phase 1, 2 & 3 migrations
│   ├── 000018_create_instance_heartbeats.up.sql
│   ├── 000018_create_instance_heartbeats.down.sql
│   ├── 000019_create_service_rollouts.up.sql
│   └── 000019_create_service_rollouts.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # [UPDATED] Adds HeartbeatStaleSeconds (default 90s) and RolloutStallMinutes (default 10m)
    │   └── config_test.go                    # [UPDATED] Tests telemetry timeout config defaults
    ├── server/
    │   ├── server.go                         # [UPDATED] Wires runtime.Service, telemetry.Service, and Phase 4 HTTP routes
    │   └── server_test.go                    # [UPDATED] Verifies Phase 4 route registration
    ├── access/
    │   ├── authorizer.go                     # [UPDATED] Adds telemetry.write and telemetry.read permission verbs
    │   └── authorizer_test.go                # [UPDATED] Tests service token & developer permissions for runtime bundle & telemetry
    ├── change/
    │   └── service.go                        # [UPDATED] Calls telemetry.Service.InitializeRollouts when a Change Request is APPLIED
    ├── runtime/
    │   ├── domain.go                         # [NEW] RuntimeBundle, VersionVector, ResourceBindingEnv, and ETag checksum builder
    │   ├── service.go                        # [NEW] AssembleBundle(ctx, actor, query) combining configs, resource metadata & secrets
    │   ├── handler.go                        # [NEW] GET /api/v1/runtime/bundle supporting If-None-Match -> 304 Not Modified
    │   └── service_test.go                   # [NEW] Unit tests for deterministic ETag calculation, 304 caching, and RBAC secret gating
    ├── telemetry/
    │   ├── domain.go                         # [NEW] InstanceHeartbeat, ClientType, DriftStatus, DriftReason, ServiceRollout, FleetSummary
    │   ├── evaluator.go                      # [NEW] Pure deterministic DriftEvaluator comparing reported vs expected VersionVector
    │   ├── repository.go                     # [NEW] TelemetryRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for instance_heartbeats and service_rollouts
    │   ├── service.go                        # [NEW] RecordHeartbeat, DeregisterInstance, GetServiceFleetStatus, GetChangeRolloutStatus, SweepStaleAndDrifted
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/telemetry/* and /api/v1/projects/{id}/services/{slug}/fleet
    │   └── evaluator_test.go                 # [NEW] Table-driven unit tests for config drift, resource version drift, secret drift & rollout %
    └── worker/
        ├── drift_worker.go                   # [NEW] Periodic background worker marking stale instances and firing drift/stalled alerts
        └── worker_test.go                    # [UPDATED] Adds tests for stale heartbeat transition and drift notification emission
```

### 4.2 `iconfigly-cli` Complete File Tree (Newly Activated Repository)

```
iconfigly-cli/
├── .gitignore                                # Ignores bin/, dist/, coverage.out, .env
├── go.mod                                    # Module github.com/PathumSandeepa/iconfigly-cli (Go 1.27.2, spf13/cobra)
├── go.sum
├── cmd/
│   └── iconfigly/
│       └── main.go                           # CLI entrypoint executing root command and mapping exit codes
└── internal/
    ├── config/
    │   ├── store.go                          # Reads/writes ~/.config/iconfigly/credentials.json with strict 0600 file mode enforcement
    │   └── store_test.go                     # Unit tests for credential persistence and insecure permission rejection
    ├── client/
    │   ├── http_client.go                    # Typed HTTP client injecting Authorization: Bearer icfg_pat_..., handling ETag & RFC 9457 errors
    │   └── http_client_test.go               # httptest unit tests for bundle fetch, 304 Not Modified, and heartbeat dispatch
    ├── runner/
    │   ├── injector.go                       # Merges RuntimeBundle into clean environment variable slice (KEY=VALUE) in memory
    │   ├── supervisor.go                     # Spawns child process via os/exec, forwards SIGINT/SIGTERM, runs background heartbeat goroutine
    │   └── supervisor_test.go                # Tests child process env injection, exit code propagation, and graceful deregistration
    ├── ui/
    │   └── printer.go                        # ANSI terminal table, diff highlighter, and JSON output formatter (--output json|table)
    └── cmd/
        ├── root.go                           # Root command (iconfigly) with global flags (--api-url, --project, --env, --output)
        ├── login.go                          # iconfigly login & iconfigly whoami
        ├── context.go                        # iconfigly service context <service-slug> --env <env-slug>
        ├── pull.go                           # iconfigly config pull <service-slug> --env <env-slug> (stdout only by default)
        ├── diff.go                           # iconfigly config diff <service-slug> --from-env uat --to-env prod
        ├── run.go                            # iconfigly run --service <slug> --env <slug> -- <command> [args...]
        └── access.go                         # iconfigly access request & iconfigly access credentials <request-id>
```

### 4.3 `iconfigly-sdk-js` Complete File Tree (Newly Activated Repository)

```
iconfigly-sdk-js/
├── .gitignore
├── package.json                              # Package @iconfigly/sdk (TypeScript, zero runtime dependencies, ESM + CJS build)
├── tsconfig.json
├── src/
│   ├── index.ts                              # Public barrel export (IconfiglyClient, IconfiglyOptions, RuntimeBundle, DriftStatus)
│   ├── types.ts                              # TypeScript interfaces matching /api/v1/runtime/bundle and /api/v1/telemetry/heartbeat
│   ├── client.ts                             # Core IconfiglyClient: load(), get(), getNumber(), getBoolean(), getResource(), close()
│   ├── poller.ts                             # Jittered background ETag poller emitting "configUpdated" and "secretRotated" events
│   └── heartbeat.ts                          # Periodic heartbeat reporter with process SIGTERM/SIGINT auto-deregistration
└── test/
    └── client.test.ts                        # Node.js built-in test runner (node:test) verifying ETag 304, typed getters & heartbeats
```

### 4.4 `iconfigly-sdk-go` Complete File Tree (Newly Activated Repository)

```
iconfigly-sdk-go/
├── .gitignore
├── go.mod                                    # Module github.com/PathumSandeepa/iconfigly-sdk-go (Go 1.27.2, zero external deps!)
├── client.go                                 # Client struct, Config options, Load(ctx), Get(key), GetInt(key), GetBool(key), Close(ctx)
├── bundle.go                                 # Thread-safe atomic.Pointer[RuntimeBundle] snapshot holder and ETag conditional fetcher
├── heartbeat.go                              # Background goroutine sending jittered heartbeats and deregistering on Close(ctx)
└── client_test.go                            # Table-driven unit tests with httptest.Server verifying concurrency safety & ETag caching
```

### 4.5 `iconfigly-sdk-java` Complete File Tree (Newly Activated Repository)

```
iconfigly-sdk-java/
├── .gitignore
├── pom.xml                                   # Parent Maven POM (Java 21, Jackson, JUnit 5, Spring Boot 3.4 dependencies)
├── iconfigly-client/
│   ├── pom.xml                               # Pure Java 21 client module (uses java.net.http.HttpClient)
│   └── src/
│       ├── main/java/dev/iconfigly/client/
│       │   ├── IconfiglyClient.java          # Thread-safe client with AtomicReference<RuntimeBundle>, ETag polling & Closeable
│       │   ├── IconfiglyOptions.java         # Builder pattern configuration (apiUrl, token, project, service, environment)
│       │   ├── RuntimeBundle.java            # Immutable Java record for configs, resources, secrets, and version vector
│       │   └── HeartbeatScheduler.java       # Daemon ScheduledExecutorService sending jittered heartbeats + JVM ShutdownHook
│       └── test/java/dev/iconfigly/client/
│           └── IconfiglyClientTest.java      # JUnit 5 tests using JDK HttpServer mock
└── iconfigly-spring-boot-starter/
    ├── pom.xml                               # Spring Boot AutoConfiguration module
    └── src/
        └── main/
            ├── java/dev/iconfigly/spring/
            │   ├── IconfiglyEnvironmentPostProcessor.java # Injects IconfiglyPropertySource into Spring Environment at startup
            │   ├── IconfiglyPropertySource.java           # Maps iconfigly keys (DB_POOL_MAX -> db.pool.max) for @Value & @ConfigurationProperties
            │   └── IconfiglyAutoConfiguration.java        # Registers IconfiglyClient bean and binds ApplicationClosedEvent to deregister
            └── resources/META-INF/
                └── spring/
                    └── org.springframework.boot.autoconfigure.AutoConfiguration.imports
```

### 4.6 `iconfigly-web` File Additions & Updates (`src/`)

```
iconfigly-web/
└── src/
    ├── app/
    │   └── (dashboard)/
    │       ├── dashboard/
    │       │   └── page.tsx                  # [UPDATED] Adds Fleet Health & Active Configuration Drift Alert widget
    │       └── projects/
    │           └── [projectId]/
    │               ├── services/
    │               │   └── [serviceSlug]/
    │               │       └── page.tsx      # [UPDATED] Adds "Live Fleet & Drift" tab and "Connect CLI / SDK" quick-start button
    │               └── changes/
    │                   └── [changeId]/
    │                       └── page.tsx      # [UPDATED] Adds live Rollout Progress Card (e.g. "6 / 8 instances updated to v15")
    ├── features/
    │   └── telemetry/
    │       ├── RolloutProgressBar.tsx        # [NEW] Visual progress bar showing Updated, Drifted, and Stale instance counts per service
    │       ├── FleetInstanceTable.tsx        # [NEW] Live table of running instances (Instance ID, Client SDK, Config Ver, Drift Badge, Last Seen)
    │       ├── SdkQuickStartDrawer.tsx       # [NEW] Interactive drawer generating copy-ready CLI, Node.js, Go, and Spring Boot snippets
    │       └── useTelemetry.ts               # [NEW] TanStack Query hooks with 5-second auto-refresh during active rollouts
    └── lib/
        └── types.ts                          # [UPDATED] Adds InstanceHeartbeat, ServiceRollout, FleetSummary, and RuntimeBundle types
```

---

## 5. Sub-Phase 4.0: Relational Data Model & Database Migrations (`000018`–`000019`)

### 5.1 Phase 4 Entity-Relationship Additions

Phase 4 adds **2 new tables (`instance_heartbeats` and `service_rollouts`)** across migration pairs `000018` and `000019`.

```
erDiagram
    services ||--o{ instance_heartbeats : "reports_runtime_state"
    environments ||--o{ instance_heartbeats : "runs_in"
    change_requests ||--o{ service_rollouts : "tracks_convergence"
    services ||--o{ service_rollouts : "converges_to_version"
    environments ||--o{ service_rollouts : "in_environment"
```

### 5.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

#### Migration `000018_create_instance_heartbeats`

* **Table `instance_heartbeats`:** Represents the live runtime state reported by every running microservice container, VM, or `iconfigly run` developer process.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `instance_id`: `TEXT NOT NULL` (Unique identifier per process/pod, e.g., `pod-payment-7f9b2` or `cli-laptop-a18c`)
  * `hostname`: `TEXT NOT NULL DEFAULT ''`
  * `client_type`: `TEXT NOT NULL CHECK (client_type IN ('CLI', 'SDK_JS', 'SDK_GO', 'SDK_JAVA', 'K8S_OPERATOR'))`
  * `client_version`: `TEXT NOT NULL DEFAULT '1.0.0'`
  * `deployment_version`: `TEXT NOT NULL DEFAULT ''` (Application git SHA or semantic version, e.g., `2.8.4`)
  * `active_config_version`: `INT NOT NULL DEFAULT 0` (Highest `config_items.current_version_number` loaded by the instance)
  * `active_resource_versions`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Map of `resource_slug -> version` currently used by the instance)
  * `active_secret_versions`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Map of `ref_key -> version_hint` currently loaded by the instance)
  * `bundle_checksum`: `TEXT NOT NULL DEFAULT ''` (SHA-256 ETag of the loaded runtime bundle)
  * `drift_status`: `TEXT NOT NULL DEFAULT 'IN_SYNC' CHECK (drift_status IN ('IN_SYNC', 'DRIFTED', 'STALE', 'DEREGISTERED'))`
  * `drift_reasons`: `JSONB NOT NULL DEFAULT '[]'::jsonb` (Structured array explaining any mismatch, e.g., `[{"dimension": "SECRET_REF", "key": "DB_PASSWORD", "expected": 2, "actual": 1}]`)
  * `started_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `last_seen_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `deregistered_at`: `TIMESTAMPTZ NULL`
  * *Constraints & Indexes:*
    * `UNIQUE (environment_id, service_id, instance_id)` (Enables atomic `INSERT ... ON CONFLICT (environment_id, service_id, instance_id) DO UPDATE` upserts on every heartbeat)
    * `idx_heartbeats_service_env_active` on `(service_id, environment_id, drift_status) WHERE drift_status <> 'DEREGISTERED'`
    * `idx_heartbeats_stale_sweep` on `(last_seen_at) WHERE drift_status IN ('IN_SYNC', 'DRIFTED')`

#### Migration `000019_create_service_rollouts`

* **Table `service_rollouts`:** Tracks how quickly the running instances of each impacted microservice converge to the new state after a Change Request is applied.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `change_request_id`: `UUID NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE`
  * `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `expected_config_version`: `INT NOT NULL DEFAULT 0`
  * `expected_resource_versions`: `JSONB NOT NULL DEFAULT '{}'::jsonb`
  * `expected_secret_versions`: `JSONB NOT NULL DEFAULT '{}'::jsonb`
  * `total_instances`: `INT NOT NULL DEFAULT 0`
  * `updated_instances`: `INT NOT NULL DEFAULT 0`
  * `drifted_instances`: `INT NOT NULL DEFAULT 0`
  * `stale_instances`: `INT NOT NULL DEFAULT 0`
  * `status`: `TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'STALLED', 'SUPERSEDED'))`
  * `started_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `completed_at`: `TIMESTAMPTZ NULL`
  * `stalled_alerted_at`: `TIMESTAMPTZ NULL`
  * `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:*
    * `UNIQUE (change_request_id, service_id)`
    * `idx_service_rollouts_in_progress` on `(service_id, environment_id) WHERE status = 'IN_PROGRESS'`

---

## 6. Sub-Phase 4.1: Unified Runtime Bundle Assembler & Conditional ETag Caching (`internal/runtime`)

### 6.1 Goal & Engineering Rationale

When a microservice starts up (via `iconfigly-cli`, `iconfigly-sdk-js`, `iconfigly-sdk-go`, or `iconfigly-sdk-java`), it needs a single, cohesive snapshot of its environment configuration. `internal/runtime` assembles this **Runtime Bundle** and computes a deterministic cryptographic `ETag` digest:

$$
\text{ETag} = \text{SHA256}\Big(\text{ServiceID} \parallel \text{EnvID} \parallel \text{MaxConfigVer} \parallel \text{SortedResourceVersions} \parallel \text{SortedSecretVersions}\Big)
$$

Because the `ETag` depends strictly on the integer version numbers stored in PostgreSQL, `iconfigly-api` can compute the current `ETag` in $< 2\text{ms}$ **without calling OpenBao** when a polling SDK sends `If-None-Match: "sha256:..."`. If the `ETag` matches, the handler immediately returns `304 Not Modified`, eliminating 99% of network payload and OpenBao traffic during steady-state polling!

### 6.2 How Resource Metadata & Secret References Map to Flat Environment Variables

In addition to returning structured JSON for the SDKs, `RuntimeBundle` pre-computes a normalized `FlatEnv map[string]string` (wrapped in `redact.SecretString` where applicable) so `iconfigly run` and `IconfiglyPropertySource` can inject keys directly:

1. **Service Configuration Items (`config_items`):** Injected directly using their `config_key` (e.g., `LOG_LEVEL=info`, `PAYMENT_RETRY_COUNT=3`).
2. **Bound Infrastructure Resource Metadata (`service_resource_bindings` + `resources`):** Normalized using the convention `<RESOURCE_SLUG_UPPER_SNAKE>_<METADATA_KEY>` (e.g., resource `payments-db` with `{"host": "postgres", "port": 5432, "database_name": "iconfigly"}` produces `PAYMENTS_DB_HOST=postgres`, `PAYMENTS_DB_PORT=5432`, `PAYMENTS_DB_DATABASE_NAME=iconfigly`).
3. **Resolved Secret References (`secret_refs`):** When `resolve_secrets=true` and the caller holds `secretref.resolve` permission, each attached `KV_V2` secret reference is resolved from OpenBao at its pinned `version_hint` and injected under its `ref_key` (e.g., `DB_PASSWORD`, `REDIS_AUTH_TOKEN`).

### 6.3 File & Function Breakdown (`internal/runtime/`)

| File Path | Structs / Functions | Detailed Execution Flow & Security Rules |
| :--- | :--- | :--- |
| `internal/runtime/domain.go` | Struct: `VersionVector` (`ConfigVersion int`, `ResourceVersions map[string]int`, `SecretVersions map[string]int`)<br>Struct: `RuntimeBundle` (`ProjectSlug`, `ServiceSlug`, `EnvironmentSlug`, `ETag string`, `VersionVector VersionVector`, `Configs map[string]string`, `Resources map[string]map[string]any`, `Secrets map[string]redact.SecretString`, `FlatEnv map[string]redact.SecretString`, `GeneratedAt time.Time`)<br>Method: `ComputeETag() string` | Defines the canonical runtime snapshot. `Secrets` and `FlatEnv` use `redact.SecretString` from Phase 3 so that if a `RuntimeBundle` struct is ever passed to `slog` or `fmt`, secret values remain `"[REDACTED]"`. |
| `internal/runtime/service.go` | `AssembleBundle(ctx, actor, query BundleQuery) (*RuntimeBundle, bool, error)` | 1. Resolves `(projectSlug, serviceSlug, envSlug)` to UUIDs.<br>2. Enforces `Authorizer.Require(ctx, actor, "config.read", ScopeService)`.<br>3. Queries current `VersionVector` (max `config_items.current_version_number`, bound `resources.version`, and attached `secret_refs.version_hint`) and computes `expectedETag`.<br>4. If `query.IfNoneMatch != ""` and `query.IfNoneMatch == expectedETag`, returns `(nil, true, nil)` (`notModified = true`) immediately!<br>5. Fetches active `config_items` and bound `resources`.<br>6. If `query.ResolveSecrets == true`, verifies `Authorizer.Require(ctx, actor, "secretref.resolve", ...)` for each `secret_ref`, resolves values via `ProviderRegistry` (OpenBao), and records a single consolidated `runtime.bundle_resolved` audit log entry. |
| `internal/runtime/handler.go` | `HandleGetRuntimeBundle(w, r)` | Handles `GET /api/v1/runtime/bundle`. Reads `If-None-Match` header; if `notModified == true`, sets `ETag` header and writes `304 Not Modified` with an empty body. Otherwise sets `ETag` and `Cache-Control: private, no-store` headers and serializes the bundle JSON. |

---

## 7. Sub-Phase 4.2: Telemetry, Rollout Progress & Drift Detection Bounded Context (`internal/telemetry`)

### 7.1 Instance Drift State Machine & Multi-Dimensional Evaluation

Every running instance tracked in `instance_heartbeats` transitions through a deterministic 4-state lifecycle:

```
stateDiagram-v2
    [*] --> IN_SYNC : Heartbeat Received\n(Reported VersionVector == Expected VersionVector)
    [*] --> DRIFTED : Heartbeat Received\n(Reported VersionVector != Expected VersionVector)

    IN_SYNC --> DRIFTED : Change Request Applied in Control Plane\nOR Heartbeat Reports Outdated Version
    DRIFTED --> IN_SYNC : Instance Reloads Bundle / Restarts\nHeartbeat Reports Latest VersionVector

    IN_SYNC --> STALE : DriftWorker Detects\nlast_seen_at < NOW() - 90s
    DRIFTED --> STALE : DriftWorker Detects\nlast_seen_at < NOW() - 90s

    STALE --> IN_SYNC : Instance Recovers & Sends Current Heartbeat
    STALE --> DRIFTED : Instance Recovers with Outdated Version

    IN_SYNC --> DEREGISTERED : Graceful Shutdown\n(POST /telemetry/deregister)
    DRIFTED --> DEREGISTERED : Graceful Shutdown\n(POST /telemetry/deregister)
```

### 7.2 Rollout Progress Calculation Formula

When a Change Request `C` is applied in environment `E`, `change.Service` invokes `telemetry.Service.InitializeRolloutsForChange`. For every directly affected service $S_i$ in the Change Request's `ImpactReport`:

1. Any prior `IN_PROGRESS` rollout for $(S_i, E)$ is marked `SUPERSEDED`.
2. A new `service_rollouts` row is created capturing the target `VersionVector` at the moment of apply.
3. On every subsequent heartbeat from an instance of $(S_i, E)$, `telemetry.Service` counts all active instances ($\text{status} \in \{\text{IN\_SYNC}, \text{DRIFTED}\}$) and computes:

$$
\text{RolloutPercentage} = \begin{cases} 
100\% & \text{if } N_{\text{active}} = 0 \\
\left\lfloor \frac{N_{\text{updated}}}{N_{\text{active}}} \times 100 \right\rfloor & \text{if } N_{\text{active}} > 0
\end{cases}
$$

When $N_{\text{active}} > 0$ and $N_{\text{updated}} == N_{\text{active}}$ (meaning $N_{\text{drifted}} == 0$), the `service_rollouts.status` automatically transitions from `IN_PROGRESS` $\rightarrow$ `COMPLETED`, setting `completed_at = NOW()` and emitting a `rollout.completed` event to `outbox_events`!

### 7.3 File & Function Breakdown (`internal/telemetry/`)

| File Path | Structs / Functions | Detailed Execution Flow & Business Rules |
| :--- | :--- | :--- |
| `internal/telemetry/evaluator.go` | Func: `EvaluateDrift(expected, actual VersionVector) (DriftStatus, []DriftReason)` | Pure, zero-I/O domain function:<br>• Checks `actual.ConfigVersion != expected.ConfigVersion` $\rightarrow$ appends `DriftReason{Dimension: "SERVICE_CONFIG", Key: "config_version", Expected: expected.ConfigVersion, Actual: actual.ConfigVersion}`.<br>• Iterates over `expected.ResourceVersions` and `expected.SecretVersions`; for any version mismatch, appends a corresponding `DriftReason`.<br>• Returns `IN_SYNC` if `len(reasons) == 0`, else `DRIFTED`. |
| `internal/telemetry/service.go` | `RecordHeartbeat(ctx, actor, cmd HeartbeatCmd) (*HeartbeatResponse, error)`<br>`DeregisterInstance(ctx, actor, cmd DeregisterCmd) error`<br>`InitializeRolloutsForChange(txCtx, changeReq *change.ChangeRequest) error`<br>`GetServiceFleetSummary(ctx, actor, projectID, serviceSlug, envSlug) (*FleetSummary, error)`<br>`GetChangeRolloutProgress(ctx, actor, projectID, changeID) ([]*ServiceRolloutView, error)` | **`RecordHeartbeat`:** Requires `telemetry.write` (granted to `DEVELOPER`, `SERVICE_LEAD`, `ENV_ADMIN`, `ORG_ADMIN`, and service PATs). Fetches the current expected `VersionVector` and `ETag` for `(service, env)`, calls `EvaluateDrift`, upserts `instance_heartbeats`, updates any active `service_rollouts` counters, and returns `{drift_status, drift_reasons, latest_etag, reload_required: (drift_status == DRIFTED)}` so the SDK knows immediately if it should re-fetch the bundle! |
| `internal/telemetry/handler.go` | `HandleHeartbeat`, `HandleDeregister`, `HandleGetServiceFleet`, `HandleGetChangeRollouts` | Exposes `/api/v1/telemetry/heartbeat`, `/api/v1/telemetry/deregister`, `/api/v1/projects/{projectID}/services/{serviceSlug}/fleet`, and `/api/v1/projects/{projectID}/change-requests/{changeID}/rollouts`. |

---

## 8. Sub-Phase 4.3: Background Drift & Stale-Instance Sweeper Worker (`internal/worker/drift_worker.go`)

### 8.1 Goal & Engineering Rationale

What happens if a microservice container crashes (`SIGKILL` / OOMKilled) without calling `/telemetry/deregister`, or what if 1 out of 4 instances gets stuck on an old configuration version for 10 minutes after a Change Request is applied? `DriftWorker` runs every 30 seconds alongside `OutboxWorker` and `ExpiryWorker` to maintain fleet accuracy and dispatch proactive drift alerts.

### 8.2 Exact Sweeper Tasks (`internal/worker/drift_worker.go`)

| Sweeper Operation | SQL / Domain Logic Executed Every 30 Seconds | Outbox Notification & Audit Effect |
| :--- | :--- | :--- |
| **1. Stale Instance Detection** | Finds all `instance_heartbeats` where `drift_status IN ('IN_SYNC', 'DRIFTED')` and `last_seen_at <= NOW() - HeartbeatStaleSeconds` (default `90s`). Transitions `drift_status = 'STALE'` and refreshes parent `service_rollouts` counters. | Logs structured warning in `slog`; removes crashed containers from blocking active rollout completion calculations. |
| **2. Stalled Rollout Detection & Alerting** | Finds all `service_rollouts` where `status = 'IN_PROGRESS'`, `started_at <= NOW() - RolloutStallMinutes` (default `10m`), and `drifted_instances > 0`. Transitions `status = 'STALLED'` and sets `stalled_alerted_at = NOW()`. | Inside `txManager.WithTx`: writes `telemetry.rollout_stalled` to `audit_logs` and enqueues `telemetry.drift_detected` (`WARNING` severity in non-prod, `CRITICAL` in `PROD`) into `outbox_events` so the service's Owner Team and the Change Request author are notified via In-App, Email (Mailpit), and Webhook! |
| **3. Deregistered Instance Pruning** | Deletes historical `instance_heartbeats` rows where `drift_status IN ('DEREGISTERED', 'STALE')` and `last_seen_at <= NOW() - INTERVAL '7 days'`. | Keeps the `instance_heartbeats` table lean and fast without manual database maintenance. |

---

## 9. Sub-Phase 4.4: Cross-Platform Developer CLI Architecture (`iconfigly-cli`)

### 9.1 Why `iconfigly-cli` Transforms Developer Experience

Instead of copying `.env` files over Slack or pasting production database passwords into local terminal windows, engineers interact with `iconfigly` directly from their command line using `iconfigly` (or its shorthand alias `icfg`).

### 9.2 Complete CLI Command & Flag Specification

| Command Syntax | Flags | Exact Execution Behavior & Output |
| :--- | :--- | :--- |
| `iconfigly login` | `--url <http://localhost:3000>`<br>`--token <icfg_pat_...>` | Prompts for (or reads `--token`) Personal Access Token, verifies it against `GET /api/v1/auth/me`, and saves `{api_url, token, user_email, org_slug}` to `~/.config/iconfigly/credentials.json` with `0600` (`rw-------`) permissions. |
| `iconfigly whoami` | `--output table\|json` | Calls `GET /api/v1/auth/me` and prints the authenticated user, organization, active team memberships, and token expiration timestamp. |
| `iconfigly service context <service-slug>` | `--project <slug>`<br>`--env <dev\|qa\|uat\|prod>`<br>`--output table\|json` | Calls `GET /api/v1/projects/{proj}/services/{svc}/context?env={env}` and renders a rich terminal summary: Owner Team, Bound Resources (`POSTGRES`, `REDIS`, `KAFKA`), Active Config Version (`v15`), Fleet Status (`3/3 IN_SYNC`), and Caller's Effective Role. |
| `iconfigly config pull <service-slug>` | `--project <slug>`<br>`--env <slug>`<br>`--format env\|json`<br>`--resolve-secrets` | Calls `GET /api/v1/runtime/bundle` and prints the configuration to `stdout` (never writes a file unless explicitly piped by the user, printing a security warning to `stderr` if `--resolve-secrets` is used without a TTY). |
| `iconfigly config diff <service-slug>` | `--project <slug>`<br>`--from-env <uat>`<br>`--to-env <prod>` | Calls `GET /api/v1/projects/{proj}/configs/compare` and prints a color-coded terminal diff (`+ ADDED` in green, `~ MODIFIED` in yellow, `- REMOVED` in red) between the two environments. |
| `iconfigly run -- <cmd> [args...]` | `--project <slug>`<br>`--service <slug>`<br>`--env <slug>`<br>`--watch` (optional hot-restart) | **The Flagship CLI Command:**<br>1. Fetches the complete `RuntimeBundle` (with `resolve_secrets=true`) into memory.<br>2. Constructs an in-memory environment slice combining `os.Environ()` with `bundle.FlatEnv`.<br>3. Starts the child command (`<cmd> [args...]`) with `Stdin`, `Stdout`, and `Stderr` attached.<br>4. Starts a background goroutine sending heartbeats (`client_type = "CLI"`) every 30s ($\pm$ jitter). If `--watch` is enabled and a heartbeat response indicates `reload_required == true`, gracefully restarts the child process with the new bundle!<br>5. On `SIGINT`/`SIGTERM` or child exit, calls `POST /api/v1/telemetry/deregister` and exits with the child process's exact exit code. |
| `iconfigly access request` | `--project <slug>`<br>`--env <prod>`<br>`--resource <payments-db>`<br>`--role <VIEWER>`<br>`--duration <60>`<br>`--reason "..."` | Submits a time-boxed Temporary Access Request (`POST /access-requests`) directly from the terminal and prints the Request ID and approval status. |
| `iconfigly access credentials <req-id>` | `--project <slug>`<br>`--psql` (optional) | Calls `POST /access-requests/{id}/credentials` to fetch the ephemeral OpenBao database username/password lease and either prints the connection details or (when `--psql` is passed) launches an interactive `psql` session with `PGPASSWORD` injected in memory! |

---

## 10. Sub-Phase 4.5: Node.js & TypeScript SDK Architecture (`iconfigly-sdk-js`)

### 10.1 Design Principles for `iconfigly-sdk-js`

* **Zero External Runtime Dependencies:** Uses Node.js 20–26 built-in `fetch`, `crypto`, `events.EventEmitter`, and `timers`.
* **Fail-Safe Startup & Non-Blocking Polling:** `await client.load()` fetches the initial `RuntimeBundle` at service startup (failing fast if required credentials are unauthorized). Once initialized, `get(key)` reads synchronously from the in-memory snapshot in $O(1)$ time ($< 1\text{ }\mu\text{s}$), while background `ETag` polling and heartbeats run asynchronously on `.unref()` timers so they never prevent the Node.js event loop from exiting cleanly.

### 10.2 File & Class Breakdown (`iconfigly-sdk-js/src/`)

| File Path | Exported Classes / Methods | Detailed Responsibilities |
| :--- | :--- | :--- |
| `src/types.ts` | Interfaces: `IconfiglyOptions`, `RuntimeBundle`, `VersionVector`, `HeartbeatPayload`, `HeartbeatResponse`, `DriftReason` | Strictly typed TypeScript definitions for all API payloads and events (`configUpdated`, `driftDetected`, `error`). |
| `src/client.ts` | Class: `IconfiglyClient extends EventEmitter`<br>Methods:<br>• `load(): Promise<RuntimeBundle>`<br>• `get(key: string, defaultVal?: string): string`<br>• `getNumber(key: string, defaultVal?: number): number`<br>• `getBoolean(key: string, defaultVal?: boolean): boolean`<br>• `getJSON<T>(key: string): T`<br>• `getResource(slug: string): Record<string, unknown>`<br>• `getSecret(refKey: string): string`<br>• `close(): Promise<void>` | Manages the active `RuntimeBundle` in a private `#bundle` field (preventing accidental `console.log(client)` from dumping secrets!). Starts `BundlePoller` and `HeartbeatReporter` upon `load()`, and registers `process.once('SIGTERM')` / `SIGINT` hooks to invoke `close()` and deregister the instance cleanly. |
| `src/poller.ts` & `src/heartbeat.ts` | Classes: `BundlePoller`, `HeartbeatReporter`<br>Func: `computeJitteredDelay(baseMs: number): number` | `HeartbeatReporter` sends `POST /api/v1/telemetry/heartbeat` with `client_type: 'SDK_JS'`, `instance_id`, and `active_config_version`. If the server replies `reload_required: true` (or `latest_etag !== currentETag`), it immediately triggers `BundlePoller.refresh()` using `If-None-Match` and emits `'configUpdated'` with the changed keys! |

---

## 11. Sub-Phase 4.6: Idiomatic Go SDK Architecture (`iconfigly-sdk-go`)

### 11.1 Design Principles for `iconfigly-sdk-go`

* **100% Standard Library (`zero` external dependencies in `go.mod`):** Uses `net/http`, `sync/atomic`, `context`, `encoding/json`, and `math/rand/v2`. Any Go microservice can import `github.com/PathumSandeepa/iconfigly-sdk-go` without adding a single transitive dependency to its `go.sum`.
* **Lock-Free Atomic Reads:** Stores the current `*RuntimeBundle` inside an `atomic.Pointer[RuntimeBundle]`. High-throughput HTTP handlers calling `cfg.GetString("PAYMENT_TIMEOUT_MS")` read from the atomic pointer with zero mutex lock contention.

### 11.2 File & Function Breakdown (`iconfigly-sdk-go/`)

| File Path | Structs / Methods | Detailed Responsibilities |
| :--- | :--- | :--- |
| `client.go` | Struct: `Options` (`APIURL`, `Token`, `Project`, `Service`, `Environment`, `InstanceID`, `DeploymentVersion`, `ResolveSecrets bool`, `PollInterval time.Duration`, `OnUpdate func(old, new *RuntimeBundle)`)<br>Struct: `Client`<br>Func: `NewClient(ctx context.Context, opts Options) (*Client, error)`<br>Methods: `GetString(key)`, `GetInt(key, fallback)`, `GetBool(key, fallback)`, `GetSecret(key)`, `GetResourceMetadata(slug)`, `Close(ctx context.Context) error` | `NewClient` validates `Options`, performs the initial synchronous `fetchBundle(ctx)` call, stores the bundle in `atomic.Pointer[RuntimeBundle]`, sends the initial heartbeat, and spawns the background `runLoop` goroutine. `Close(ctx)` cancels the background goroutine and sends `POST /api/v1/telemetry/deregister`. |
| `bundle.go` & `heartbeat.go` | Methods: `fetchBundle(ctx, currentETag string) (*RuntimeBundle, bool, error)`<br>`sendHeartbeat(ctx) (*HeartbeatResponse, error)`<br>`runLoop(ctx context.Context)` | Implements the jittered `time.Timer` loop. On each tick, sends a heartbeat; if `resp.ReloadRequired` is true or the poll interval has elapsed, calls `fetchBundle` with `If-None-Match`. On `200 OK`, atomically swaps the `atomic.Pointer` (`c.bundle.Store(newBundle)`) and invokes the optional `OnUpdate` callback. |

---

## 12. Sub-Phase 4.7: Java 21 & Spring Boot 3 Starter SDK Architecture (`iconfigly-sdk-java`)

### 12.1 Multi-Module Architecture for Enterprise Java Microservices

Because Java is heavily used in banking and fintech backends (like our `payment-service`, `invoice-service`, and `reconciliation-service` examples), `iconfigly-sdk-java` is structured as a clean two-module Maven project targeting **Java 21**:

1. **`iconfigly-client`:** Pure Java 21 client using `java.net.http.HttpClient`, `AtomicReference<RuntimeBundle>`, and virtual-thread/daemon `ScheduledExecutorService` timers. Can be used in any plain Java, Quarkus, Micronaut, or Kotlin application.
2. **`iconfigly-spring-boot-starter`:** Plug-and-play Spring Boot 3 integration. By simply adding `iconfigly.enabled=true`, `iconfigly.api-url`, `iconfigly.token`, `iconfigly.project`, `iconfigly.service`, and `iconfigly.environment` to `application.yml`, the starter automatically loads the `RuntimeBundle` during Spring Boot bootstrap and maps keys into Spring's `PropertySource`!

### 12.2 How Spring Property Name Normalization Works (`IconfiglyPropertySource`)

In Spring Boot, developers write `@Value("${payment.retry.count:3}")` or bind `@ConfigurationProperties(prefix = "payments.db")`, whereas `iconfigly` stores canonical uppercase keys like `PAYMENT_RETRY_COUNT` and `PAYMENTS_DB_HOST`. `IconfiglyPropertySource.getProperty(String name)` resolves properties seamlessly in both directions:

1. Checks for an exact match in `bundle.flatEnv().get(name)`.
2. If not found, converts Spring's dot/kebab-case property name (`payment.retry-count`) to uppercase snake_case (`PAYMENT_RETRY_COUNT`) and looks it up in `bundle.flatEnv()`, allowing idiomatic `@Value` and `@ConfigurationProperties` classes to bind with zero custom code!

---

## 13. Sub-Phase 4.8: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 4)

### 13.1 Complete Phase 4 UI Screen & Component Specifications

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/projects/[projectId]/changes/[changeId]` | `app/(dashboard)/projects/[projectId]/changes/[changeId]/page.tsx` | **Live Rollout & Fleet Convergence Panel (`RolloutProgressBar`):**<br>Once a Change Request is `APPLIED`, displays a real-time rollout card polling every 5 seconds:<br>1. **Overall Convergence Header:** Status badge (`IN_PROGRESS`, `COMPLETED`, `STALLED`) and progress bar (`6 / 8 instances updated (75%)`).<br>2. **Per-Service Breakdown:** For each impacted service (`payment-service`, `refund-service`, `invoice-service`), shows `Updated (IN_SYNC)`, `Pending / Drifted (DRIFTED)`, and `Offline (STALE)` counts.<br>3. **Drifted Instance Inspector:** Expandable row showing exactly which instance (`pod-invoice-3`) is still running an older version (`config_version 14 != expected 15`). |
| `/projects/[projectId]/services/[serviceSlug]` | `app/(dashboard)/projects/[projectId]/services/[serviceSlug]/page.tsx` | **Service Context — Fleet Telemetry & SDK Quick-Start Additions:**<br>1. **`Fleet & Drift` Tab (`FleetInstanceTable`):** Displays all active instances reporting heartbeats in the selected environment (`DEV`, `QA`, `UAT`, `PROD`), including `Instance ID`, `Host`, `Client SDK Badge` (`CLI`, `SDK_JS`, `SDK_GO`, `SDK_JAVA`), `Deployment Version` (`2.8.4`), `Config Version` (`v15`), `Drift Status Badge` (`IN_SYNC` green, `DRIFTED` amber, `STALE` gray), and `Last Seen` relative time (`8s ago`).<br>2. **`Connect CLI / SDK` Button (`SdkQuickStartDrawer`):** Opens a slide-over drawer with 4 tabs (`CLI`, `Node.js / TS`, `Go`, `Java / Spring Boot`) containing ready-to-copy commands and code snippets pre-populated with the exact `projectSlug`, `serviceSlug`, and `environmentSlug`! |
| `/dashboard` | `app/(dashboard)/dashboard/page.tsx` | **Organization Fleet Health Summary:**<br>Adds a **Fleet & Drift Status** metric card showing total reporting service instances across the organization and highlighting any services currently experiencing `DRIFTED` or `STALLED` rollouts. |

---

## 14. Sub-Phase 4.9: Comprehensive Testing Strategy & Phase 4 Verification Checklist

### 14.1 Complete Phase 4 REST API Endpoint Catalog (Additions to Phases 1–3)

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/runtime/bundle` | `config.read` (+ `secretref.resolve` if `?resolve_secrets=true`) | Assembles and returns the complete `RuntimeBundle` for `?project=...&service=...&env=...`. Supports `If-None-Match` header, returning `304 Not Modified` when the bundle `ETag` matches. |
| `POST` | `/api/v1/telemetry/heartbeat` | `telemetry.write` | Ingests an instance heartbeat (`instance_id`, `client_type`, `active_config_version`, `active_resource_versions`, `active_secret_versions`), computes `drift_status`, updates `service_rollouts`, and returns `{drift_status, drift_reasons, latest_etag, reload_required}`. |
| `POST` | `/api/v1/telemetry/deregister` | `telemetry.write` | Marks an instance as `DEREGISTERED` during graceful shutdown (`SIGINT`/`SIGTERM`) and updates rollout counters. |
| `GET` | `/api/v1/projects/{projectID}/services/{serviceSlug}/fleet` | `catalog.read` | Returns the `FleetSummary` (counts of `IN_SYNC`, `DRIFTED`, `STALE` instances + full list of instances and drift reasons) for `?env={envSlug}`. |
| `GET` | `/api/v1/projects/{projectID}/change-requests/{changeID}/rollouts` | `catalog.read` | Returns the per-service rollout convergence progress (`service_rollouts`) for an applied Change Request. |

### 14.2 Phase 4 Testing Matrix

| Test Layer | Target Repository & Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. Runtime Bundle & ETag Unit Tests** | `iconfigly-api/internal/runtime/service_test.go` | Verifies deterministic `ETag` calculation, confirms `If-None-Match` short-circuits before calling OpenBao and returns `304 Not Modified`, verifies `FlatEnv` naming convention, and proves `resolve_secrets=true` returns `403 Forbidden` if the caller lacks `secretref.resolve`. |
| **2. Drift Evaluator & Rollout Math Tests** | `iconfigly-api/internal/telemetry/evaluator_test.go` | Table-driven tests covering `IN_SYNC` vs `DRIFTED` across config versions, bound resource versions, and secret versions; tests rollout percentage edge cases ($0$ instances, partial rollout, $100\%$ completion transition). |
| **3. CLI Supervisor & Credential Store Tests** | `iconfigly-cli/internal/runner/supervisor_test.go`, `config/store_test.go` | Proves `iconfigly run` injects variables into a child process's memory without creating any file on disk, verifies `0600` credential file permission checks, and verifies `SIGINT` forwarding + `/telemetry/deregister` execution. |
| **4. Polyglot SDK Contract Tests** | `iconfigly-sdk-js/test/`, `iconfigly-sdk-go/client_test.go`, `iconfigly-sdk-java/.../IconfiglyClientTest.java` | Tests initial bundle load, `ETag` `304 Not Modified` caching, hot-reload on `reload_required: true`, typed getters, Spring Boot `IconfiglyPropertySource` key normalization (`db.pool.max` $\rightarrow$ `DB_POOL_MAX`), and graceful deregistration on close. |
| **5. End-to-End Browser & CLI Tests (Playwright)** | `iconfigly-web/e2e/phase4-rollout-and-drift.spec.ts` | Simulates 3 microservice instances sending heartbeats, applies a Change Request in the UI, verifies the Rollout Progress Bar transitions from `0/3` $\rightarrow$ `2/3 (Drifted)` $\rightarrow$ `3/3 (Completed)`, and inspects the Fleet table. |

### 14.3 End-to-End Phase 4 Demo Scenario & Definition of Done Checklist

To mark Phase 4 100% complete, the following end-to-end workflow must execute cleanly on top of Phases 1, 2, and 3:

* [ ] **Step 1 (Migrations `000018`–`000019`):** Running the `migrate` tool profile applies `000018_create_instance_heartbeats` and `000019_create_service_rollouts` cleanly.
* [ ] **Step 2 (CLI Login & Context Inspection):** Inside the CLI container, run `iconfigly login --url http://api:8080 --token <pat>` followed by `iconfigly service context payment-service --project core-banking --env uat`. Verify the terminal displays the formatted table of bound resources (`payments-db`, `payment-cache`, `payment-events`), active config version, and access permissions.
* [ ] **Step 3 (`iconfigly run` Zero-Disk Injection & Live Heartbeat):** Run `iconfigly run --project core-banking --service payment-service --env uat -- sh -c 'env | grep PAYMENT && sleep 20'`. Verify that `PAYMENT_RETRY_COUNT`, `PAYMENTS_DB_HOST`, and the resolved OpenBao `DB_PASSWORD` are printed from the child process's memory, zero `.env` files exist on disk, and the `payment-service` **`Fleet & Drift`** tab in the web UI immediately shows 1 active `CLI` instance with status **`IN_SYNC`**.
* [ ] **Step 4 (SDK Fleet Simulation & ETag Caching):** Start two simulated service instances using `iconfigly-sdk-js` and `iconfigly-sdk-go` connected to `payment-service` in `UAT`. Verify both instances appear in the UI Fleet table (`2/2 IN_SYNC`) and that subsequent 30s polls receive `HTTP 304 Not Modified` in the API logs.
* [ ] **Step 5 (Live Rollout Tracking & Drift Resolution):** Submit, approve, and apply a Change Request updating `PAYMENT_RETRY_COUNT` in `UAT` (`v2` $\rightarrow$ `v3`). On the Change Request Detail screen, observe the **Rollout Progress Bar** start at `0 / 2 instances updated (DRIFTED)` and automatically transition to `2 / 2 instances updated (COMPLETED)` as the SDK instances pick up the new `ETag` and report `active_config_version = 3`!
# iconfigly — Phase 3 Engineering Blueprint: External Secret Engine Integration (OpenBao), Dynamic Credential Leases, Break-Glass Governance & Zero-Leakage Guardrails

> **Document Scope:** Phase 3 Complete Engineering Plan (Sub-Phase 3.0 to Sub-Phase 3.9)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Ports & Adapters (Hexagonal) + Ephemeral Lease Governance
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; building production Go security workflows and external secret engine integrations from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 3 Executive Summary & Scope](#1-phase-3-executive-summary--scope)
2. [Phase 3 Architectural Decisions & Rationale (ADRs)](#2-phase-3-architectural-decisions--rationale-adrs)
3. [Phase 3 DDD Bounded Contexts & Cryptographic Sequence Flows](#3-phase-3-ddd-bounded-contexts--cryptographic-sequence-flows)
4. [Complete Phase 3 Folder & File Evolution](#4-complete-phase-3-folder--file-evolution)
5. [Sub-Phase 3.0: Containerized OpenBao Infrastructure & Automated Bootstrap (`iconfigly-infra`)](#5-sub-phase-30-containerized-openbao-infrastructure--automated-bootstrap-iconfigly-infra)
6. [Sub-Phase 3.1: Relational Data Model & Database Migrations (`000016`–`000017`)](#6-sub-phase-31-relational-data-model--database-migrations-000016000017)
7. [Sub-Phase 3.2: Zero-Leakage Secret Guardrails & Log Redaction (`internal/shared/redact`)](#7-sub-phase-32-zero-leakage-secret-guardrails--log-redaction-internalsharedredact)
8. [Sub-Phase 3.3: OpenBao Hexagonal Adapter & Multi-Provider Registry (`internal/secretprovider`)](#8-sub-phase-33-openbao-hexagonal-adapter--multi-provider-registry-internalsecretprovider)
9. [Sub-Phase 3.4: Live Secret Resolution & Cryptographic Rotation (`internal/secretref` & `internal/change`)](#9-sub-phase-34-live-secret-resolution--cryptographic-rotation-internalsecretref--internalchange)
10. [Sub-Phase 3.5: Dynamic Database Credential Leases & Automated Revocation (`internal/access` & `internal/worker`)](#10-sub-phase-35-dynamic-database-credential-leases--automated-revocation-internalaccess--internalworker)
11. [Sub-Phase 3.6: Emergency Break-Glass Workflow & Post-Incident Governance (`internal/access` & `internal/notification`)](#11-sub-phase-36-emergency-break-glass-workflow--post-incident-governance-internalaccess--internalnotification)
12. [Sub-Phase 3.7: Server Wiring & Health Readiness Expansion (`cmd/server`, `cmd/worker`, `internal/health`, `internal/server`)](#12-sub-phase-37-server-wiring--health-readiness-expansion-cmdserver-cmdworker-internalhealth-internalserver)
13. [Sub-Phase 3.8: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 3)](#13-sub-phase-38-nextjs-web-dashboard-architecture--ui-iconfigly-web-phase-3)
14. [Sub-Phase 3.9: Comprehensive Testing Strategy & Phase 3 Verification Checklist](#14-sub-phase-39-comprehensive-testing-strategy--phase-3-verification-checklist)

---

## 1. Phase 3 Executive Summary & Scope

### 1.1 Phase 3 Objective

Phase 3 elevates **iconfigly** from simulated secret references to a real, cryptographic **Control Plane + External Secret Engine Architecture** powered by **OpenBao** (the Linux Foundation's open-source, HashiCorp Vault-compatible secret manager). Without changing the domain contracts established in Phase 2, Phase 3 plugs a production `OpenBaoProvider` adapter into the `secretprovider.SecretProvider` port interface. By the end of Phase 3, applying a `SECRET_ROTATION` Change Request rotates real KV v2 secrets inside OpenBao, approving a Temporary Access Request for a database resource dynamically provisions an ephemeral PostgreSQL username and password (`v-token-...`) that automatically drops itself from the database when the lease expires or is revoked early, and on-call engineers can invoke an audited **Emergency Break-Glass** workflow during critical production incidents.

### 1.2 Why Phase 3 Separates the Control Plane from the Secret Engine

A common architectural anti-pattern in developer tools is storing plaintext or homemade encrypted database passwords directly inside the application's primary relational database. Phase 3 demonstrates enterprise security maturity by enforcing a strict separation of concerns:

1. **`iconfigly-api` + `PostgreSQL 18` (The Governance Control Plane):** Knows *which* microservices depend on `payments-db`, *who* is allowed to request or approve changes, *what* the blast radius is, and *which* `openbao://...` URI pointer or `openbao_lease_id` belongs to a resource or user. It **never** stores raw database passwords or API keys on disk.
2. **`OpenBao` (The Cryptographic Secret Engine):** Holds the encrypted KV v2 secrets (`/v1/secret/data/...`) and communicates directly with target infrastructure via its **Database Dynamic Secrets Engine** (`/v1/database/creds/...`) to create and revoke short-lived SQL users on demand.

### 1.3 Repository Activation in Phase 3

| Repository | Phase 3 Status | Role in Phase 3 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds `openbao` (`openbao/openbao:2.1.0`) and `openbao-init` (automated engine mount & dynamic DB role bootstrapper) to `compose.yaml`. |
| **`iconfigly-api`** | **Active** | Adds migrations `000016`–`000017`, `internal/shared/redact`, `OpenBaoProvider` adapter, `ProviderRegistry`, dynamic lease lifecycle management, and Emergency Break-Glass governance. |
| **`iconfigly-web`** | **Active** | Adds Ephemeral Database Credential Viewer, Secret Rotation & Version Inspector, Break-Glass Emergency Access Modal, Post-Incident Review Queue, and OpenBao Health Status panel. |
| **`iconfigly-docs`** | **Active** | Phase 3 engineering blueprint and updated API specifications. |
| **`iconfigly-cli`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-js`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-go`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-java`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-operator`** | Dormant (Phase 5) | Empty repository placeholder. |

### 1.4 Scope Boundaries for Phase 3

| In Scope for Phase 3 | Out of Scope for Phase 3 (Deferred to Later Phases) |
| :--- | :--- |
| Containerized `openbao` (`port 8200`) and automated `openbao-init` setup container configuring KV v2 (`secret/`) and PostgreSQL dynamic credentials (`database/`) | Developer CLI (`iconfigly run`) and language SDKs (`js`, `go`, `java`) (Phase 4) |
| Production `OpenBaoProvider` HTTP client implementing `SecretProvider` (`ValidateRef`, `ResolveSecret`, `RotateSecret`, `IssueDynamicLease`, `RevokeLease`, `Ping`) | Instance heartbeat telemetry (`POST /api/v1/telemetry/heartbeat`) and live rollout progress bars (Phase 4) |
| Multi-provider `ProviderRegistry` routing `OPENBAO` URIs to `OpenBaoProvider` and `MOCK` URIs to `MockProvider` | Kubernetes `kind` cluster, Helm charts, and `iconfigly-operator` syncing Kubernetes `Secret` objects (Phase 5) |
| Real cryptographic secret rotation in OpenBao KV v2 triggered atomically when a `SECRET_ROTATION` Change Request is applied | Cloud-managed KMS auto-unseal (AWS KMS / GCP Cloud KMS) and multi-region Vault replication (Phase 7) |
| Dynamic short-lived database credential generation (`secret_leases` table + OpenBao `/v1/database/creds/...`) tied to Temporary Access Requests | |
| Automated lease revocation in OpenBao (`/v1/sys/leases/revoke`) via `ExpiryWorker` and 1-click Admin early revocation with retry safety | |
| Emergency Break-Glass access workflow (`is_break_glass = true`, mandatory `incident_ticket_id`, instant `CRITICAL` alerts, and post-incident review sign-off) | |
| Zero-leakage `RedactedString` value wrapper and structured log/audit redaction filter (`internal/shared/redact`) | |

---

## 2. Phase 3 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-023** | **External Secret Engine** | **OpenBao (`openbao/openbao:2.1.0`) with Vault HTTP API v1 Compatibility** | OpenBao is Linux Foundation-backed, 100% open-source (MPL-2.0), and API-compatible with HashiCorp Vault's `/v1/secret/data/*` (KV v2) and `/v1/database/creds/*` (Database Dynamic Secrets) endpoints. | **Building a custom secret vault in PostgreSQL:** Violates the core principle that a control plane database backup should never contain raw infrastructure passwords. |
| **ADR-024** | **Zero-Touch Local Secret Bootstrap** | **One-Shot `openbao-init` Container in Docker Compose** | Automatically enables the `secret/` KV v2 mount, enables the `database/` engine, configures a sandbox PostgreSQL connection, creates read-only and read-write dynamic SQL role templates, and seeds initial `DEV`/`UAT`/`PROD` secrets on `docker compose up -d`. | **Requiring developers to run 15 manual `bao` CLI commands after every container restart:** Error-prone and breaks the 1-command onboarding experience. |
| **ADR-025** | **OpenBao Client Implementation** | **Zero-Dependency Standard Library `net/http` Client (`internal/secretprovider/openbao.go`)** | OpenBao's REST API is clean JSON over HTTP (`X-Vault-Token` header). Using Go's standard `net/http` with strict `context.Context` timeouts and connection pooling keeps `go.mod` lean and avoids pulling in 80+ transitive dependencies from the legacy Vault SDK. | **Importing the massive `hashicorp/vault/api` Go SDK:** Adds heavy transitive dependency bloat and version conflicts for only 5 REST endpoints. |
| **ADR-026** | **Provider Routing Strategy** | **`ProviderRegistry` Composite Adapter (`MOCK` + `OPENBAO`)** | Routes calls based on `secret_refs.provider_type`. Keeps all Phase 2 unit tests running in-memory with `MockProvider` while production and integration flows execute against `OpenBaoProvider`. | **Replacing `MockProvider` globally:** Would force every fast unit test in `change` and `secretref` to spin up an OpenBao container. |
| **ADR-027** | **Dynamic Credential Delivery** | **On-Demand Ephemeral Credential Fetch (`POST /access-requests/{id}/credentials`)** | When a temporary database access request is `ACTIVE`, the requester fetches their dynamic OpenBao username/password on demand over HTTPS. The password is returned directly from OpenBao to the authenticated caller and is **never** stored in the `secret_leases` table (only the `openbao_lease_id` and `ephemeral_username` are stored for auditing and revocation). | **Storing the generated dynamic password in `access_requests` or `secret_leases`:** Would leave valid temporary passwords sitting in PostgreSQL rows during the lease window. |
| **ADR-028** | **Lease Revocation Reliability** | **Two-Phase Revocation State (`REVOCATION_FAILED` Retry Queue in `ExpiryWorker`)** | If OpenBao is momentarily unreachable when an `access_request` expires, `ExpiryWorker` immediately revokes the platform `role_binding` (blocking control-plane access at $t = 0$) and marks the `secret_leases` row for retry until `OpenBaoProvider.RevokeLease` succeeds. | **Fire-and-forget `RevokeLease` call:** A transient network blip could leave an orphaned database credential active in OpenBao until its hard TTL expires. |
| **ADR-029** | **Emergency Access (Break-Glass)** | **Bounded Self-Service Break-Glass ($\le 60\text{m}$) + Mandatory Incident Ticket + Post-Incident Sign-Off** | During a 3:00 AM production outage, waiting for two peer approvals can violate recovery SLAs. Break-glass grants immediate, strictly time-capped (`60m` max) access while firing a `CRITICAL` security alert and requiring a formal post-mortem review (`PENDING_REVIEW` $\rightarrow$ `REVIEWED`) by an `ORG_ADMIN` or `ENV_ADMIN`. | **Sharing a static emergency `root` password among on-call engineers:** Untraceable, impossible to rotate mid-incident, and provides zero audit accountability. |
| **ADR-030** | **Secret Leakage Prevention** | **`redact.SecretString` Value Type + Recursive Metadata Sanitizer** | `SecretString` overrides `String()`, `GoString()`, `MarshalJSON()`, and `LogValue()` to always output `"[REDACTED]"`, exposing the raw value only via an explicit `.Expose()` method inside the final HTTP response DTO serializer. | **Passing raw `string` values for secrets across layers:** High risk of a developer accidentally passing a struct containing a secret to `logger.Info` or `audit.Record`. |

---

## 3. Phase 3 DDD Bounded Contexts & Cryptographic Sequence Flows

### 3.1 Phase 3 Bounded Context & Port/Adapter Map

```
flowchart TD
    subgraph Transport["HTTP Transport & Background Workers"]
        Srv["internal/server & internal/health\n(Phase 1-3 Routes + OpenBao Readiness Probe)"]
        Wrk["internal/worker\n(OutboxWorker + Lease & Access ExpiryWorker)"]
    end

    subgraph GovernanceAndChanges["Change-Safety & Access Governance Contexts"]
        Chg["internal/change\n(Applies SECRET_ROTATION via SecretRef Service)"]
        Acc["internal/access (EXPANDED)\n(Temp Access Leases, Break-Glass & Post-Incident Review)"]
        SecRef["internal/secretref (EXPANDED)\n(KV v2 Resolution, Rotation & Dynamic DB Role Config)"]
    end

    subgraph HexagonalSecretLayer["Secret Provider Port & Adapters (internal/secretprovider)"]
        Reg["ProviderRegistry\n(Routes by ProviderType: OPENBAO vs MOCK)"]
        Bao["OpenBaoProvider Adapter (NEW)\n(KV v2 Engine + Database Dynamic Secrets + Lease Revocation)"]
        Mock["MockProvider Adapter (Phase 2)\n(In-Memory Deterministic Simulator)"]
    end

    subgraph SecurityAndAudit["Zero-Leakage & Accountability Foundation"]
        Red["internal/shared/redact (NEW)\n(SecretString & Audit/Log Map Sanitizer)"]
        Aud["internal/audit\n(Hash-Chained Immutable Audit Trail)"]
        Notif["internal/notification\n(Transactional Outbox + Critical Break-Glass Alerts)"]
    end

    subgraph ExternalContainers["Containerized Infrastructure"]
        PG[("PostgreSQL 18\n(Control Plane DB & Sandbox App DB)")]
        BaoSrv["OpenBao Server (Port 8200)\n(/v1/secret/data/* & /v1/database/creds/*)"]
    end

    Srv --> GovernanceAndChanges
    Wrk --> Acc
    Wrk --> Notif
    Chg --> SecRef
    Acc --> SecRef
    Acc --> Reg
    SecRef --> Reg
    Reg --> Bao
    Reg --> Mock
    Bao -->|"HTTP REST API\n(X-Vault-Token)"| BaoSrv
    BaoSrv -->|"CREATE / DROP ROLE\n(Dynamic SQL Users)"| PG
    GovernanceAndChanges --> Red
    GovernanceAndChanges --> Aud
    GovernanceAndChanges --> Notif
```

### 3.2 Sequence Flow 1: Cryptographic Secret Rotation on Change Request Apply

```
sequenceDiagram
    actor Lead as DevOps / Service Lead
    participant ChgSvc as change.Service
    participant SecSvc as secretref.Service
    participant BaoProv as secretprovider.OpenBaoProvider
    participant Bao as OpenBao (KV v2 Engine)
    participant DB as PostgreSQL 18 (TxManager)
    participant Worker as worker.OutboxWorker

    Lead->>ChgSvc: POST /change-requests/{id}/apply (TargetType = SECRET_ROTATION)
    ChgSvc->>SecSvc: ExecuteRotation(txCtx, actor, secretRefID, changeID)
    SecSvc->>BaoProv: RotateSecret(ctx, "openbao://secret/uat/payments-db#password", metadata)
    BaoProv->>BaoProv: Generate 32-byte cryptographically random credential (redact.SecretString)
    BaoProv->>Bao: POST /v1/secret/data/uat/payments-db (Writes new KV v2 version)
    Bao-->>BaoProv: 200 OK {"data": {"version": 2}}
    BaoProv-->>SecSvc: newVersion = 2 (Raw credential never returned to DB layer)
    SecSvc->>DB: UPDATE secret_refs SET version_hint = 2, last_rotated_at = NOW()
    ChgSvc->>DB: UPDATE resources SET version = version + 1
    ChgSvc->>DB: UPDATE change_requests SET status = 'APPLIED'
    ChgSvc->>DB: INSERT INTO audit_logs (action="secret_ref.rotated", version=2)
    ChgSvc->>DB: INSERT INTO outbox_events (type="change.applied", impact_snapshot)
    ChgSvc-->>Lead: 200 OK (Status = APPLIED, Secret Version = 2)
    Worker->>DB: Claim outbox_events -> Notify Payments, Finance & Storefront Teams
```

### 3.3 Sequence Flow 2: Dynamic Database Credential Lease & Instant Revocation

```
sequenceDiagram
    actor Dev as Developer (Charlie)
    actor Approver as Env Admin (Alice)
    participant AccSvc as access.Service
    participant BaoProv as secretprovider.OpenBaoProvider
    participant Bao as OpenBao (Database Engine)
    participant PG as PostgreSQL 18
    participant Worker as worker.ExpiryWorker

    Dev->>AccSvc: 1. POST /access-requests (Resource: payments-db in PROD, Role: VIEWER, 60m)
    Approver->>AccSvc: 2. POST /access-requests/{id}/review (Decision: APPROVED)
    AccSvc->>BaoProv: IssueDynamicLease(ctx, "openbao://database/creds/payments-db-readonly", ttl=60m)
    BaoProv->>Bao: GET /v1/database/creds/payments-db-readonly
    Bao->>PG: CREATE ROLE "v-token-readonly-a8f2" WITH LOGIN PASSWORD '...' VALID UNTIL '...'
    Bao-->>BaoProv: LeaseID="database/creds/.../9x2b", Username="v-token-readonly-a8f2", Password=SecretString
    AccSvc->>PG: WithTx: INSERT role_bindings + INSERT secret_leases (status='ACTIVE', openbao_lease_id) + UPDATE access_requests (status='ACTIVE') + audit_logs
    AccSvc-->>Approver: 200 OK (Lease Active, Expires in 60m)

    Dev->>AccSvc: 3. POST /access-requests/{id}/credentials (Fetch ephemeral DB login)
    AccSvc->>PG: Verify caller == RequesterUserID AND status == 'ACTIVE' AND expires_at > NOW()
    AccSvc->>PG: INSERT INTO audit_logs (action="access.dynamic_credentials_viewed")
    AccSvc-->>Dev: Ephemeral Username & Password (Redacted from all logs)

    Note over Worker,Bao: 4. Lease Expires (or Admin Clicks "Revoke Immediately")
    Worker->>AccSvc: ExpireOverdueLeases(ctx, now)
    AccSvc->>PG: Delete role_binding + Set access_requests.status = 'EXPIRED'
    AccSvc->>BaoProv: RevokeLease(ctx, "database/creds/.../9x2b")
    BaoProv->>Bao: PUT /v1/sys/leases/revoke (lease_id)
    Bao->>PG: REVOKE ALL & DROP ROLE "v-token-readonly-a8f2"
    Bao-->>BaoProv: 204 No Content
    AccSvc->>PG: UPDATE secret_leases SET status = 'EXPIRED', revoked_at = NOW() + audit_logs
```

---

## 4. Complete Phase 3 Folder & File Evolution

### 4.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── .env                                      # [UPDATED] Adds OPENBAO_DEV_ROOT_TOKEN and ICONFIGLY_OPENBAO_ADDR
├── .env.example                              # [UPDATED] Documents OpenBao environment variables
├── compose.yaml                              # [UPDATED] Adds openbao and openbao-init services
└── openbao/
    └── bootstrap.sh                          # [NEW] Idempotent init script configuring KV v2, Database Engine, and dynamic SQL roles
```

### 4.2 `iconfigly-api` File Additions & Updates (Phase 3 Expansion)

Files marked `[NEW]` are created in Phase 3; files marked `[UPDATED]` evolve existing Phase 1–2 files cleanly without breaking prior contracts.

```
iconfigly-api/
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds Phase 3 endpoints (dynamic credentials, break-glass, post-incident review, provider status)
├── migrations/
│   ├── 000001..000015                        # Unchanged Phase 1 & Phase 2 migrations
│   ├── 000016_expand_secret_refs_and_leases.up.sql
│   ├── 000016_expand_secret_refs_and_leases.down.sql
│   ├── 000017_add_break_glass_and_incident_reviews.up.sql
│   └── 000017_add_break_glass_and_incident_reviews.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # [UPDATED] Adds OpenBaoAddr, OpenBaoToken, OpenBaoTimeoutMs, BreakGlassMaxMinutes
    │   └── config_test.go                    # [UPDATED] Tests OpenBao configuration loading and defaults
    ├── health/
    │   ├── handler.go                        # [UPDATED] Expands ReadyHandler to report SecretProvider (OpenBao) health status alongside PostgreSQL
    │   └── handler_test.go                   # [UPDATED] Tests readiness probe with healthy and degraded OpenBao state
    ├── server/
    │   ├── server.go                         # [UPDATED] Wires OpenBaoProvider, ProviderRegistry, and Phase 3 HTTP routes
    │   └── server_test.go                    # [UPDATED] Verifies Phase 3 route registration
    ├── shared/
    │   └── redact/
    │       ├── secret_string.go              # [NEW] SecretString value wrapper preventing accidental fmt/slog/json serialization
    │       ├── sanitizer.go                  # [NEW] Recursive map/slice key redactor for audit metadata and structured logs
    │       └── redact_test.go                # [NEW] Unit tests proving SecretString never leaks in fmt.Sprintf, json.Marshal, or slog
    ├── secretprovider/
    │   ├── provider.go                       # [UPDATED] Adds Ping(ctx) and EngineType metadata to SecretProvider interface
    │   ├── mock.go                           # [UPDATED] Implements Ping(ctx) and redact.SecretString return values
    │   ├── openbao.go                        # [NEW] Production OpenBao HTTP client (KV v2 read/write/rotate, Database dynamic creds, lease revoke)
    │   ├── registry.go                       # [NEW] Multi-provider router dispatching OPENBAO -> OpenBaoProvider and MOCK -> MockProvider
    │   ├── mock_test.go                      # Unchanged Phase 2
    │   └── openbao_test.go                   # [NEW] Unit & httptest server tests for OpenBao KV v2, dynamic leases, and error translation
    ├── secretref/
    │   ├── domain.go                         # [UPDATED] Adds EngineType (KV_V2, DATABASE_DYNAMIC), DynamicRoleName, and MaxLeaseTTLSeconds
    │   ├── repository.go                     # [UPDATED] Adds SecretLease persistence & lookup methods
    │   ├── postgres_repo.go                  # [UPDATED] Implements SQL queries for expanded secret_refs and secret_leases tables
    │   ├── service.go                        # [UPDATED] Uses ProviderRegistry, enforces redact.SanitizeMap on audit payloads, adds TestSecretRefConnectivity
    │   ├── handler.go                        # [UPDATED] Adds POST /secret-refs/{id}/verify and GET /secret-leases endpoints
    │   └── service_test.go                   # [UPDATED] Tests OpenBao routing and zero-leakage audit assertions
    ├── access/
    │   ├── domain.go                         # [UPDATED] Adds BreakGlass fields, PostIncidentStatus enum, and SecretLease summary to AccessRequest
    │   ├── authorizer.go                     # [UPDATED] Adds access.break_glass and access.post_incident_review permission verbs
    │   ├── repository.go                     # [UPDATED] Adds queries for pending post-incident reviews and active OpenBao leases
    │   ├── postgres_repo.go                  # [UPDATED] Persists break-glass fields and coordinates secret_leases status transitions
    │   ├── service.go                        # [UPDATED] Adds IssueDynamicCredentialsForAccess, TriggerBreakGlassAccess, SubmitPostIncidentReview, RetryFailedLeaseRevocations
    │   ├── handler.go                        # [UPDATED] Adds /break-glass, /{reqID}/credentials, and /{reqID}/post-incident-review handlers
    │   └── authorizer_test.go                # [UPDATED] Tests break-glass eligibility and post-incident reviewer separation of duties
    └── worker/
        ├── expiry_worker.go                  # [UPDATED] Revokes active OpenBao leases on expiry and retries any REVOCATION_FAILED leases
        └── worker_test.go                    # [UPDATED] Tests end-to-end OpenBao lease revocation and retry resilience
```

### 4.3 `iconfigly-web` File Additions & Updates (`src/`)

```
iconfigly-web/
└── src/
    ├── app/
    │   └── (dashboard)/
    │       ├── dashboard/
    │       │   └── page.tsx                  # [UPDATED] Adds OpenBao Engine Status badge and Pending Post-Incident Reviews alert banner
    │       ├── projects/
    │       │   └── [projectId]/
    │       │       ├── resources/
    │       │       │   └── [resourceId]/
    │       │       │       └── page.tsx      # [UPDATED] Adds Dynamic Database Lease configuration & "Verify in OpenBao" action
    │       │       └── access/
    │       │           └── requests/
    │       │               └── page.tsx      # [UPDATED] Adds "Emergency Break-Glass" button, Ephemeral Credential Drawer, and Post-Incident Review tab
    │       └── settings/
    │           └── integrations/
    │               └── page.tsx              # [NEW] OpenBao Secret Engine & SMTP/Webhook Connectivity Status and Health Inspector
    ├── features/
    │   ├── secretrefs/
    │   │   ├── SecretRefListCard.tsx         # [UPDATED] Shows Engine badge (KV_V2 vs DATABASE_DYNAMIC) and OpenBao connectivity check
    │   │   └── EphemeralCredentialModal.tsx  # [NEW] Copy-once modal displaying temporary OpenBao username/password, psql connection snippet, and live TTL timer
    │   └── access/
    │       ├── BreakGlassModal.tsx           # [NEW] High-friction emergency access modal requiring Incident Ticket ID and confirmation
    │       └── PostIncidentReviewDrawer.tsx  # [NEW] Security/Admin sign-off drawer inspecting audit logs performed during a Break-Glass session
    └── lib/
        └── types.ts                          # [UPDATED] Adds SecretLease, EphemeralCredentials, BreakGlassRequest, and PostIncidentReview interfaces
```

---

## 5. Sub-Phase 3.0: Containerized OpenBao Infrastructure & Automated Bootstrap (`iconfigly-infra`)

### 5.1 Goal & Engineering Rationale

To develop and test real secret management and dynamic database credentials locally at $\$0$ cost, we add **OpenBao** (`openbao/openbao:2.1.0`) to `iconfigly-infra/compose.yaml` alongside a lightweight, idempotent `openbao-init` container. Whenever you run `docker compose up -d`, `openbao-init` waits for both `postgres` and `openbao` to become healthy and automatically configures:

1. **KV Version 2 Secrets Engine (`secret/`):** Seeds realistic initial credentials for `DEV`, `QA`, `UAT`, and `PROD` (e.g., `secret/data/payments/uat/payments-db` with `version = 1`).
2. **Database Dynamic Secrets Engine (`database/`):** Connects OpenBao to `iconfigly-postgres` and registers two dynamic SQL role templates:
   * `payments-db-readonly`: Dynamically executes `CREATE ROLE "{{name}}" WITH LOGIN PASSWORD '{{password}}' VALID UNTIL '{{expiration}}'; GRANT pg_read_all_data TO "{{name}}";` when a `VIEWER` temporary access lease is issued, and automatically drops the role upon revocation!
   * `payments-db-readwrite`: Dynamically grants read/write privileges when a `DEVELOPER` temporary access lease is issued.

### 5.2 Exact File Specifications in `iconfigly-infra`

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-infra/compose.yaml` | **Update** | 1. Adds `openbao` service (`image: openbao/openbao:2.1.0`, `container_name: iconfigly-openbao`), binding `127.0.0.1:8200:8200`, setting `BAO_DEV_ROOT_TOKEN_ID=${OPENBAO_DEV_TOKEN:-iconfigly-dev-root-token}` and `BAO_DEV_LISTEN_ADDRESS=0.0.0.0:8200`, with a healthcheck polling `bao status`.<br>2. Adds `openbao-init` service (`image: openbao/openbao:2.1.0`, `container_name: iconfigly-openbao-init`), mounting `./openbao/bootstrap.sh:/bootstrap.sh:ro` and executing `/bin/sh /bootstrap.sh` once `openbao` and `postgres` are healthy.<br>3. Injects `ICONFIGLY_OPENBAO_ADDR=http://openbao:8200` and `ICONFIGLY_OPENBAO_TOKEN=${OPENBAO_DEV_TOKEN:-iconfigly-dev-root-token}` into the `api` service environment. |
| `iconfigly-infra/openbao/bootstrap.sh` | **Create** | Idempotent shell script using the `bao` CLI against `http://openbao:8200`:<br>• Verifies `secret/` KV v2 mount is enabled.<br>• Seeds initial KV v2 secret paths (`secret/uat/payments-db`, `secret/prod/payments-db`, `secret/uat/payment-cache`).<br>• Enables the `database/` secrets engine (`bao secrets enable database || true`).<br>• Configures `database/config/payments-db` pointing to `postgres:5432/iconfigly` with revocation statements (`REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM "{{name}}"; DROP ROLE IF EXISTS "{{name}}";`).<br>• Creates `database/roles/payments-db-readonly` and `database/roles/payments-db-readwrite`. |
| `iconfigly-infra/.env.example` & `.env` | **Update** | Appends `OPENBAO_DEV_TOKEN=iconfigly-dev-root-token`, `ICONFIGLY_OPENBAO_ADDR=http://openbao:8200`, and `ICONFIGLY_OPENBAO_TOKEN=iconfigly-dev-root-token`. |

---

## 6. Sub-Phase 3.1: Relational Data Model & Database Migrations (`000016`–`000017`)

### 6.1 Phase 3 Entity-Relationship Additions

Phase 3 adds **1 new table (`secret_leases`)** and expands **`secret_refs`** and **`access_requests`** across two migration pairs (`000016` and `000017`).

```
erDiagram
    resources ||--o{ secret_refs : "configures_kv_or_dynamic_db"
    secret_refs ||--o{ secret_leases : "issues_ephemeral_creds"
    access_requests ||--o| secret_leases : "binds_dynamic_lease"
    users ||--o{ secret_leases : "receives_lease"
    users ||--o{ access_requests : "reviews_break_glass"
```

### 6.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

#### Migration `000016_expand_secret_refs_and_leases`

* **Alter Table `secret_refs`:**
  * Adds `engine_type`: `TEXT NOT NULL DEFAULT 'KV_V2' CHECK (engine_type IN ('KV_V2', 'DATABASE_DYNAMIC'))`
  * Adds `dynamic_role_name`: `TEXT NOT NULL DEFAULT ''` (e.g., `payments-db-readonly` when `engine_type = 'DATABASE_DYNAMIC'`)
  * Adds `max_lease_ttl_seconds`: `INT NOT NULL DEFAULT 86400 CHECK (max_lease_ttl_seconds >= 300 AND max_lease_ttl_seconds <= 86400)`

* **Create Table `secret_leases`:** Tracks the lifecycle and revocation state of every dynamic credential lease issued by OpenBao. **Never stores the generated password.**
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `access_request_id`: `UUID NULL REFERENCES access_requests(id) ON DELETE SET NULL`
  * `secret_ref_id`: `UUID NOT NULL REFERENCES secret_refs(id) ON DELETE RESTRICT`
  * `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `provider_type`: `TEXT NOT NULL CHECK (provider_type IN ('MOCK', 'OPENBAO'))`
  * `openbao_lease_id`: `TEXT NOT NULL UNIQUE` (The full lease identifier returned by OpenBao, e.g., `database/creds/payments-db-readonly/7f9a2c...`)
  * `ephemeral_username`: `TEXT NOT NULL` (The temporary database username created by OpenBao, e.g., `v-token-payments-r-x82k`)
  * `lease_ttl_seconds`: `INT NOT NULL`
  * `status`: `TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'REVOKED', 'REVOCATION_FAILED'))`
  * `revocation_attempts`: `INT NOT NULL DEFAULT 0`
  * `last_error`: `TEXT NOT NULL DEFAULT ''`
  * `issued_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `expires_at`: `TIMESTAMPTZ NOT NULL`
  * `revoked_at`: `TIMESTAMPTZ NULL`
  * *Indexes:* `idx_secret_leases_active_expiry` on `(expires_at) WHERE status IN ('ACTIVE', 'REVOCATION_FAILED')`, `idx_secret_leases_access_req` on `(access_request_id)`.

#### Migration `000017_add_break_glass_and_incident_reviews`

* **Alter Table `access_requests`:**
  * Adds `is_break_glass`: `BOOLEAN NOT NULL DEFAULT FALSE`
  * Adds `incident_ticket_id`: `TEXT NOT NULL DEFAULT ''` (Mandatory when `is_break_glass = TRUE`, e.g., `INC-2026-0419`)
  * Adds `post_incident_status`: `TEXT NOT NULL DEFAULT 'NOT_REQUIRED' CHECK (post_incident_status IN ('NOT_REQUIRED', 'PENDING_REVIEW', 'REVIEWED', 'FLAGGED'))`
  * Adds `post_incident_notes`: `TEXT NOT NULL DEFAULT ''`
  * Adds `post_incident_reviewed_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  * Adds `post_incident_reviewed_at`: `TIMESTAMPTZ NULL`
  * *Constraints & Indexes:* `CHECK (NOT is_break_glass OR length(trim(incident_ticket_id)) >= 4)`, `idx_access_requests_pending_post_mortem` on `(project_id, created_at DESC) WHERE post_incident_status = 'PENDING_REVIEW'`.

---

## 7. Sub-Phase 3.2: Zero-Leakage Secret Guardrails & Log Redaction (`internal/shared/redact`)

### 7.1 Goal & Engineering Rationale

Once real secrets flow from OpenBao through `iconfigly-api` to an authorized caller, we must guarantee at the **Go type-system level** that a resolved secret value or dynamic database password can never be written to stdout logs (`log/slog`), returned in an error string, or persisted in `audit_logs.metadata`.

### 7.2 File & Function Specifications (`internal/shared/redact/`)

| File Path | Types / Functions | Exact Behavior & Security Invariants |
| :--- | :--- | :--- |
| `internal/shared/redact/secret_string.go` | Type: `SecretString` (unexported struct wrapping `val string`)<br>Func: `NewSecretString(raw string) SecretString`<br>Method: `String() string`<br>Method: `GoString() string`<br>Method: `MarshalJSON() ([]byte, error)`<br>Method: `LogValue() slog.Value`<br>Method: `Expose() string`<br>Method: `IsEmpty() bool` | **`String()`, `GoString()`, `MarshalJSON()`, `LogValue()`:** Always return `"[REDACTED]"` (or `slog.StringValue("[REDACTED]")`). If any developer passes a struct containing a `SecretString` to `fmt.Printf("%+v", obj)`, `logger.Info("resolved", "res", obj)`, or `json.Marshal(obj)`, the secret value is automatically replaced with `"[REDACTED]"`.<br>**`Expose()`:** The only method that returns the underlying string. Used exclusively in the explicit HTTP response serializer for `ResolveSecretRef` and `IssueDynamicCredentialsForAccess`. |
| `internal/shared/redact/sanitizer.go` | Func: `SanitizeMap(input map[string]any) map[string]any`<br>Func: `IsSensitiveKey(key string) bool` | Recursively clones a `map[string]any` (such as an audit metadata payload or webhook context) and masks any value whose key matches case-insensitive patterns (`password`, `secret`, `token`, `private_key`, `credential`, `authorization`) or whose value is a `SecretString` with `"[REDACTED]"`. Invoked automatically inside `audit.Service.Record`. |
| `internal/shared/redact/redact_test.go` | `TestSecretStringNeverLeaksInFmtSlogOrJSON`<br>`TestSanitizeMapMasksNestedSensitiveKeys` | Verifies that `fmt.Sprintf("%v %+v %#v", s, s, s)`, `json.Marshal(s)`, and `slog.NewJSONHandler` output `"REDACTED"` and never contain the raw test secret. |

---

## 8. Sub-Phase 3.3: OpenBao Hexagonal Adapter & Multi-Provider Registry (`internal/secretprovider`)

### 8.1 OpenBao URI Scheme & Engine Mapping

`OpenBaoProvider` parses canonical `openbao://` URIs into two supported OpenBao engine operations:

1. **KV v2 Static & Rotatable Secrets (`openbao://<mount>/<path>#<field>`):**
   * Example URI: `openbao://secret/uat/payments-db#password`
   * Maps to OpenBao HTTP API:
     * **Read (`ResolveSecret`):** `GET /v1/secret/data/uat/payments-db?version={versionHint}` $\rightarrow$ extracts `.data.data["password"]` and `.data.metadata.version`.
     * **Rotate (`RotateSecret`):** Generates a 32-byte cryptographically random alphanumeric/symbol password (or reads the existing map at `/v1/secret/data/uat/payments-db`, replaces the `#field` key with the newly generated credential, and `POST`s the updated map back to `/v1/secret/data/uat/payments-db`), returning the new integer `.data.version` from OpenBao.
2. **Database Dynamic Credential Leases (`openbao://database/creds/<role_name>`):**
   * Example URI: `openbao://database/creds/payments-db-readonly`
   * Maps to OpenBao HTTP API:
     * **Issue Lease (`IssueDynamicLease`):** `GET /v1/database/creds/payments-db-readonly` $\rightarrow$ returns `.lease_id`, `.lease_duration`, `.data.username`, and `.data.password` (wrapped in `redact.SecretString`).
     * **Revoke Lease (`RevokeLease`):** `PUT /v1/sys/leases/revoke` with JSON body `{"lease_id": leaseID}` $\rightarrow$ immediately drops the temporary PostgreSQL user and invalidates the lease.

### 8.2 File & Function Breakdown (`internal/secretprovider/`)

| File Path | Structs / Methods | Detailed Execution Flow & Error Translation |
| :--- | :--- | :--- |
| `internal/secretprovider/provider.go` | Interface: `SecretProvider`<br>Struct: `ResolvedSecret` (`Value redact.SecretString`, `Version int`, `LeaseTTLSeconds int`)<br>Struct: `DynamicLease` (`LeaseID string`, `Username string`, `Password redact.SecretString`, `TTLSeconds int`, `ExpiresAt time.Time`) | Expands `SecretProvider` with `Ping(ctx context.Context) error` (for `/ready` health checks) and updates `ResolvedSecret.Value` and `DynamicLease.Password` to use `redact.SecretString`. |
| `internal/secretprovider/openbao.go` | Struct: `OpenBaoProvider`<br>Func: `NewOpenBaoProvider(baseURL, token string, timeout time.Duration) (*OpenBaoProvider, error)`<br>Methods: `Name()`, `Ping(ctx)`, `ValidateRef(ctx, uri)`, `ResolveSecret(ctx, uri, versionHint)`, `RotateSecret(ctx, uri, metadata)`, `IssueDynamicLease(ctx, uri, ttl)`, `RevokeLease(ctx, leaseID)` | Uses a dedicated `*http.Client` with `Timeout: timeout` (default `5s`), setting header `X-Vault-Token: <token>` and `Accept: application/json`.<br>• **`Ping(ctx)`:** Calls `GET /v1/sys/health` and verifies HTTP `200 OK` (initialized and unsealed).<br>• **Error Translation:** Maps OpenBao `404` responses to `apperror.NotFound("Secret path not found in OpenBao")`, `403` to `apperror.Forbidden("OpenBao token lacks permission for path")`, and network timeouts to `apperror.Internal`. Never echoes OpenBao response bodies into error messages. |
| `internal/secretprovider/registry.go` | Struct: `Registry`<br>Func: `NewRegistry(defaultType string, providers ...SecretProvider) *Registry`<br>Method: `ForType(providerType string) (SecretProvider, error)` | Implements both `SecretProvider` and provider lookup by name (`"OPENBAO"` or `"MOCK"`). Allows `secretref.Service` and `access.Service` to dynamically select the right adapter per `secret_ref.provider_type`. |
| `internal/secretprovider/openbao_test.go` | `TestOpenBaoProvider_KV2ResolveAndRotate`<br>`TestOpenBaoProvider_DynamicLeaseIssueAndRevoke`<br>`TestOpenBaoProvider_ErrorTranslation` | Uses `net/http/httptest` for fast unit tests of JSON parsing and header verification, plus container integration tests against `iconfigly-openbao`. |

---

## 9. Sub-Phase 3.4: Live Secret Resolution & Cryptographic Rotation (`internal/secretref` & `internal/change`)

### 9.1 Upgrading Secret References from Mock to Live OpenBao

Because Phase 2 designed `secretref.Service` and `change.Service` around the `SecretProvider` port interface, upgrading to live OpenBao requires zero changes to the Change Request state machine or approval logic. Phase 3 enhances `internal/secretref` with three production capabilities:

1. **Pre-Flight Secret Path Verification (`VerifySecretRef`):**
   * When an engineer registers or inspects a `secret_ref` (`openbao://secret/uat/payments-db#password`), clicking **"Verify in OpenBao"** (`POST /api/v1/projects/{projectID}/secret-refs/{secretRefID}/verify`) calls `OpenBaoProvider` to verify that the path and `#field` exist in OpenBao and returns the current version number stored in OpenBao without exposing the secret value.
2. **Version-Pinned Secret Resolution (`ResolveSecretRef`):**
   * Passes `secretRef.VersionHint` to `OpenBaoProvider.ResolveSecret(ctx, secretRef.SecretURI, secretRef.VersionHint)`, ensuring that microservices resolve the exact version approved in the latest Change Request.
3. **Atomic Rotation & Version Synchronization (`ExecuteRotation`):**
   * When `change.Service.ApplyChangeRequest` applies a `SECRET_ROTATION` Change Request, `secretref.Service.ExecuteRotation` calls `provider.RotateSecret`, receives the authoritative new version number from OpenBao KV v2, updates `secret_refs.version_hint = newVersion` and `last_rotated_at = NOW()`, increments the parent `resources.version`, and writes `secret_ref.rotated` to `audit_logs`.

---

## 10. Sub-Phase 3.5: Dynamic Database Credential Leases & Automated Revocation (`internal/access` & `internal/worker`)

### 10.1 How Ephemeral Database Leases Work End-to-End

In Phase 2, approving a Temporary Access Request created an expiring `role_bindings` row inside `iconfigly`. In Phase 3, when the target resource has a `DATABASE_DYNAMIC` `secret_ref` attached (e.g., `payments-db` in `UAT` or `PROD`), `iconfigly` pairs that RBAC grant with a **real, time-limited PostgreSQL user lease in OpenBao**:

```
stateDiagram-v2
    [*] --> ACTIVE : AccessRequest Approved\nOpenBao Creates SQL Role "v-token-..."
    ACTIVE --> EXPIRED : Lease TTL Reached\nExpiryWorker Calls OpenBao Revoke -> SQL Role Dropped
    ACTIVE --> REVOKED : Admin Clicks "Revoke Early"\nImmediate OpenBao Revoke -> SQL Role Dropped
    ACTIVE --> REVOCATION_FAILED : OpenBao Temporarily Unreachable\nRBAC Binding Deleted Immediately + Queued for Retry
    REVOCATION_FAILED --> REVOKED : ExpiryWorker Retry Succeeds\nOpenBao Drops SQL Role
```

1. **Dynamic Role Selection Based on Requested Role:**
   * If `accessReq.RequestedRole == VIEWER`, `access.Service` selects the resource's read-only dynamic secret ref (`openbao://database/creds/payments-db-readonly`).
   * If `accessReq.RequestedRole == DEVELOPER` or `SERVICE_LEAD`, `access.Service` selects the read-write dynamic secret ref (`openbao://database/creds/payments-db-readwrite`).
2. **On-Demand Ephemeral Credential Generation (`IssueDynamicCredentialsForAccess`):**
   * When the requester clicks **"Generate Ephemeral DB Credentials"** (`POST /api/v1/projects/{projectID}/access-requests/{reqID}/credentials`) on their `ACTIVE` access request:
     * `access.Service` verifies `actor.UserID == accessReq.RequesterUserID`, `accessReq.Status == ACTIVE`, and `remainingTTL = time.Until(accessReq.ExpiresAt) > 0`.
     * Calls `OpenBaoProvider.IssueDynamicLease(ctx, dynamicRef.SecretURI, remainingTTL)`.
     * Persists a `secret_leases` record (`openbao_lease_id`, `ephemeral_username`, `expires_at = accessReq.ExpiresAt`, `status = 'ACTIVE'`), records `access.dynamic_lease_issued` in `audit_logs`, and returns the ephemeral `username`, `password.Expose()`, `host`, `port`, `database_name`, and a ready-to-run `psql` connection command to the user once!
3. **Guaranteed Revocation & Retry Safety (`ExpiryWorker`):**
   * When `accessReq.ExpiresAt <= NOW()` (or when an Admin clicks **"Revoke Immediately"**):
     * First, the `role_bindings` row is deleted and `access_requests.status` is set to `EXPIRED` or `REVOKED` inside PostgreSQL so platform access stops instantaneously.
     * Next, for every `ACTIVE` row in `secret_leases` linked to that `access_request_id`, the service calls `OpenBaoProvider.RevokeLease(ctx, lease.OpenBaoLeaseID)`.
     * If OpenBao returns `204 No Content`, `secret_leases.status` updates to `EXPIRED` (or `REVOKED`) and `revoked_at = NOW()`.
     * If OpenBao is temporarily unreachable, `secret_leases.status` is set to `REVOCATION_FAILED`, `revocation_attempts` is incremented, and `ExpiryWorker` retries revocation on every subsequent 30-second tick until OpenBao confirms the SQL role is dropped.

---

## 11. Sub-Phase 3.6: Emergency Break-Glass Workflow & Post-Incident Governance (`internal/access` & `internal/notification`)

### 11.1 Why Break-Glass Exists & How Governance Is Enforced

In real production incidents (e.g., a payment outage at 03:00 UTC), an on-call engineer may need immediate read access to `payments-db` in `PROD` when no second approver is awake. Phase 3 introduces a **Break-Glass Emergency Access Workflow** that balances rapid incident recovery with strict security accountability:

```
flowchart TD
    Start(["On-Call Engineer Clicks\n'Emergency Break-Glass Access'"])
    Validate["Validate Guardrails:\n1. Actor has 'access.break_glass' permission\n2. Incident Ticket ID provided (e.g. INC-2026-0842)\n3. Justification >= 20 chars\n4. Duration <= 60 minutes\n5. Requested Role == VIEWER (or DEVELOPER per policy)"]
    Grant["WithTx:\n1. INSERT access_requests (status='ACTIVE', is_break_glass=true,\n   post_incident_status='PENDING_REVIEW')\n2. INSERT expiring role_binding (expires_at = NOW() + duration)\n3. INSERT audit_logs (action='access.break_glass_activated')\n4. INSERT outbox_events (type='access.break_glass', severity='CRITICAL')"]
    Alert["OutboxWorker Immediately Dispatches CRITICAL Alert\nto Security Team, Org Admins & Env Admins\n(In-App + Email + Signed Webhook)"]
    Expire["Lease Expires After <= 60m\nExpiryWorker Revokes role_binding & OpenBao Lease"]
    Review["Security / Admin Opens Post-Incident Review Drawer:\nInspects All Audit Actions Taken by User During Window\nMarks post_incident_status = 'REVIEWED' or 'FLAGGED'"]

    Start --> Validate
    Validate --> Grant
    Grant --> Alert
    Alert --> Expire
    Expire --> Review
```

### 11.2 File & Function Additions in `internal/access/`

| File Path | Functions / Methods | Detailed Execution Flow & Security Rules |
| :--- | :--- | :--- |
| `internal/access/domain.go` | Enum: `PostIncidentStatus` (`NOT_REQUIRED`, `PENDING_REVIEW`, `REVIEWED`, `FLAGGED`)<br>Func: `NewBreakGlassAccessRequest(...) (*AccessRequest, error)` | Enforces strict domain invariants on Break-Glass requests:<br>• `DurationMinutes` must satisfy $15 \le \text{DurationMinutes} \le 60$ (hard cap of 1 hour).<br>• `IncidentTicketID` must match `^[A-Z0-9]+-[0-9]+$` (e.g., `INC-1042`, `JIRA-992`, `PD-4410`).<br>• `Reason` must be at least 20 characters.<br>• Automatically sets `IsBreakGlass = true`, `Status = ACTIVE`, and `PostIncidentStatus = PENDING_REVIEW`. |
| `internal/access/service.go` | `TriggerBreakGlassAccess(ctx, actor, projectID, cmd) (*AccessRequest, error)`<br>`SubmitPostIncidentReview(ctx, actor, projectID, reqID, status, notes) (*AccessRequest, error)`<br>`GetBreakGlassAuditWindow(ctx, actor, projectID, reqID) ([]*audit.AuditEntry, error)` | **`TriggerBreakGlassAccess`:** Verifies `actor` has `access.break_glass` permission (granted to `SERVICE_LEAD`, `ENV_ADMIN`, `ORG_ADMIN`, or designated on-call `DEVELOPER` bindings). Rate-limits a single user to at most 2 break-glass activations per 24 hours. Creates the active `AccessRequest` and temporary `role_binding` atomically, logs `access.break_glass_activated` to `audit_logs`, and enqueues `access.break_glass` (`CRITICAL` severity) in `outbox_events`.<br>**`GetBreakGlassAuditWindow`:** Queries `audit_logs` for every action performed by `req.RequesterUserID` between `req.CreatedAt` and `req.ExpiresAt` so the reviewer can see every secret resolved or resource viewed during the emergency session!<br>**`SubmitPostIncidentReview`:** Requires `access.post_incident_review` (`ORG_ADMIN` or `ENV_ADMIN`) AND enforces **Separation of Duties** (`reviewer.UserID != req.RequesterUserID`). Updates `post_incident_status` (`REVIEWED` or `FLAGGED`), records `post_incident_notes`, and writes `access.break_glass_reviewed` to `audit_logs`. |

---

## 12. Sub-Phase 3.7: Server Wiring & Health Readiness Expansion (`cmd/server`, `cmd/worker`, `internal/health`, `internal/server`)

### 12.1 Deep Readiness Check (`GET /ready`)

In Phase 1 and Phase 2, `GET /ready` verified PostgreSQL connectivity. In Phase 3, `internal/health/handler.go` is expanded so `ReadyHandler(db *pgxpool.Pool, secretProv secretprovider.SecretProvider)` checks both `db.Ping(ctx)` and `secretProv.Ping(ctx)` concurrently with a 2-second timeout:

* Returns `200 OK` with JSON `{"status": "ready", "database": "connected", "secret_provider": "openbao:connected"}` when both are healthy.
* Returns `503 Service Unavailable` RFC 9457 Problem JSON if either PostgreSQL or OpenBao is unreachable or sealed.

### 12.2 Configuration & Dependency Injection (`internal/config` & `internal/server`)

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-api/internal/config/config.go` | **Update** | Adds:<br>• `OpenBaoAddr string` (`ICONFIGLY_OPENBAO_ADDR`, default `"http://localhost:8200"`)<br>• `OpenBaoToken redact.SecretString` (`ICONFIGLY_OPENBAO_TOKEN`, wrapped in `redact.SecretString` so dumping `cfg` never logs the OpenBao token!)<br>• `OpenBaoTimeout time.Duration` (`ICONFIGLY_OPENBAO_TIMEOUT_MS`, default `5000ms`)<br>• `BreakGlassMaxMinutes int` (`ICONFIGLY_BREAK_GLASS_MAX_MINUTES`, default `60`) |
| `iconfigly-api/internal/server/server.go` & `cmd/worker/main.go` | **Update** | Instantiates `openBaoProv := secretprovider.NewOpenBaoProvider(cfg.OpenBaoAddr, cfg.OpenBaoToken.Expose(), cfg.OpenBaoTimeout)` alongside `mockProv := secretprovider.NewMockProvider()`, registers both in `providerRegistry := secretprovider.NewRegistry("OPENBAO", openBaoProv, mockProv)`, and injects `providerRegistry` into `secretref.Service`, `access.Service`, and `worker.ExpiryWorker`. |

---

## 13. Sub-Phase 3.8: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 3)

### 13.1 Complete Phase 3 UI Screen & Component Specifications

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/projects/[projectId]/resources/[resourceId]` | `app/(dashboard)/projects/[projectId]/resources/[resourceId]/page.tsx` | **Resource Secret Engine & Dynamic Lease Configuration:**<br>1. **Secret References Table (`SecretRefListCard`):** Displays attached `secret_refs` with engine badges (`KV_V2` vs `DATABASE_DYNAMIC`), OpenBao URI (`openbao://secret/uat/payments-db#password`), current `version_hint` (`v2`), and a **`Verify in OpenBao`** button that confirms live connectivity.<br>2. **Dynamic Lease Policy Badge:** Shows the configured OpenBao database role (`payments-db-readonly`) and maximum lease TTL. |
| `/projects/[projectId]/access/requests` | `app/(dashboard)/projects/[projectId]/access/requests/page.tsx` | **Expanded Temporary Access, Ephemeral Credentials & Break-Glass Hub:**<br>1. **`Get Ephemeral DB Credentials` Button (`EphemeralCredentialModal`):** Visible on `ACTIVE` database access grants to the requester. Clicking requests a dynamic OpenBao lease and opens a security modal showing:<br>  – Temporary Username (`v-token-payments-r-x82k`) & Copy-Once Password<br>  – Ready-to-copy `psql "postgres://v-token...:...@localhost:5432/iconfigly"` command<br>  – Live Lease Expiration Countdown (`Auto-revokes in 44m 18s`).<br>2. **`Emergency Break-Glass` Button (`BreakGlassModal`):** High-visibility red/amber action button opening a guarded modal requiring Incident Ticket ID (`INC-2026-0842`), target resource, duration ($\le 60\text{m}$), and explicit acknowledgment that Security and Admins will be alerted immediately.<br>3. **`Post-Incident Reviews` Tab (`PostIncidentReviewDrawer`):** Lists all Break-Glass sessions with `post_incident_status = PENDING_REVIEW`. Clicking a session opens a drawer displaying the exact chronological list of `audit_logs` performed by the engineer during that Break-Glass window, allowing an Admin (`reviewer != requester`) to mark the session **`Reviewed & Approved`** or **`Flagged for Security Investigation`**. |
| `/settings/integrations` | `app/(dashboard)/settings/integrations/page.tsx` | **External Control Plane Integrations & Health Dashboard:**<br>Displays live connection cards for:<br>1. **OpenBao Secret Engine:** Shows URL (`http://openbao:8200`), seal status (`Unsealed & Healthy`), enabled mounts (`secret/` KV v2, `database/` Dynamic SQL), and a `Test Connection` button.<br>2. **SMTP Email Engine (Mailpit):** Shows SMTP host/port and a `Send Test Email` button.<br>3. **Active Secret Leases Monitor:** Table of all currently active OpenBao dynamic database leases across the organization with an Admin `Force Revoke Lease` button. |

---

## 14. Sub-Phase 3.9: Comprehensive Testing Strategy & Phase 3 Verification Checklist

### 14.1 Complete Phase 3 REST API Endpoint Catalog (Additions to Phases 1 & 2)

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/projects/{projectID}/secret-refs/{secretRefID}/verify` | `catalog.read` | Pings OpenBao to verify the `secret_uri` exists and returns metadata (`exists`, `current_version`, `engine_type`) without returning secret values. |
| `GET` | `/api/v1/projects/{projectID}/secret-leases` | `access.read` | Lists active and historical dynamic OpenBao `secret_leases` in the project. |
| `POST` | `/api/v1/projects/{projectID}/access-requests/{reqID}/credentials` | Authenticated (Must be `requester_user_id` of `ACTIVE` request) | Issues or retrieves an ephemeral OpenBao database username/password lease (`DynamicLease`) for an active database access grant and logs `access.dynamic_lease_issued`. |
| `POST` | `/api/v1/projects/{projectID}/access-requests/break-glass` | `access.break_glass` | Immediately activates a time-capped ($\le 60\text{m}$) emergency access lease with a mandatory `incident_ticket_id`, firing `CRITICAL` outbox notifications and queuing a mandatory post-incident review. |
| `GET` | `/api/v1/projects/{projectID}/access-requests/{reqID}/audit-window` | `access.post_incident_review` | Returns all `audit_logs` entries performed by the requester during the time window of a Break-Glass session. |
| `POST` | `/api/v1/projects/{projectID}/access-requests/{reqID}/post-incident-review` | `access.post_incident_review` | Records the mandatory post-mortem sign-off (`REVIEWED` or `FLAGGED`) by an authorized reviewer (`reviewer != requester`). |
| `GET` | `/api/v1/integrations/status` | `catalog.read` | Returns live connectivity and health status of OpenBao (`kv_v2`, `database`) and SMTP notification adapters. |

### 14.2 Phase 3 Testing Matrix

| Test Layer | Target Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. Zero-Leakage Redaction Unit Tests** | `internal/shared/redact/redact_test.go` | Proves `SecretString` outputs `"[REDACTED]"` across `fmt.Sprint`, `fmt.Sprintf("%#v")`, `json.Marshal`, and `slog` JSON logging; proves `SanitizeMap` scrubs nested `password`/`secret`/`token` keys from audit metadata maps. |
| **2. OpenBao Adapter Unit & Contract Tests** | `internal/secretprovider/openbao_test.go` | Tests KV v2 secret resolution, version-pinned reads, cryptographic rotation (`v1` $\rightarrow$ `v2`), dynamic credential lease parsing (`/v1/database/creds/...`), lease revocation (`/v1/sys/leases/revoke`), and HTTP status error mapping (`403`, `404`, `500`, timeout). |
| **3. Break-Glass & Separation-of-Duties Tests** | `internal/access/authorizer_test.go`, `service_test.go` | Verifies Break-Glass rejects durations $> 60$ minutes, rejects missing/invalid `incident_ticket_id`, enforces per-user rate limits, immediately activates the lease + `CRITICAL` outbox event, and blocks the Break-Glass requester from approving their own post-incident review (`403 SEPARATION_OF_DUTIES`). |
| **4. OpenBao + PostgreSQL Container Integration Tests** | `internal/worker/worker_test.go` | Runs against live `iconfigly-postgres` and `iconfigly-openbao` containers: issues a real dynamic PostgreSQL user via OpenBao, verifies the ephemeral user can connect to PostgreSQL (`pgx.Connect`), triggers `ExpiryWorker` revocation, and verifies `pgx.Connect` with the ephemeral user immediately fails (`28P01` invalid password / role dropped)! |
| **5. End-to-End Browser Tests (Playwright)** | `iconfigly-web/e2e/phase3-openbao-leases.spec.ts` | Automates the full OpenBao rotation, ephemeral database credential generation, and Break-Glass + Post-Incident Review workflow in a headless browser. |

### 14.3 End-to-End Phase 3 Demo Scenario & Definition of Done Checklist

To mark Phase 3 100% complete, the following end-to-end workflow must execute cleanly on top of Phases 1 and 2:

* [ ] **Step 1 (OpenBao Container & Auto-Bootstrap):** Running `docker compose up -d` starts `iconfigly-openbao` (`port 8200`) and `iconfigly-openbao-init`. `GET /ready` and `/settings/integrations` report `"secret_provider": "openbao:connected"` with zero manual setup commands.
* [ ] **Step 2 (Live OpenBao Secret Verification & Rotation):** Register secret reference `openbao://secret/uat/payments-db#password` (`provider_type = OPENBAO`, `engine_type = KV_V2`) on `payments-db` in `UAT`. Click `Verify in OpenBao` (`version = 1`). Submit, approve, and apply a `SECRET_ROTATION` Change Request. Verify that OpenBao KV v2 now holds `version = 2` with a newly generated 32-byte credential, `secret_refs.version_hint` is `2`, and zero plaintext secret values appear anywhere in PostgreSQL tables or Docker container logs.
* [ ] **Step 3 (Dynamic Database Credential Lease):** Register dynamic secret reference `openbao://database/creds/payments-db-readonly` (`provider_type = OPENBAO`, `engine_type = DATABASE_DYNAMIC`) on `payments-db` in `PROD`. As `Charlie`, request `VIEWER` access to `payments-db` in `PROD` for `15 minutes` and approve it as `Alice`.
* [ ] **Step 4 (Connect with Ephemeral SQL User & Verify Instant Revocation):** As `Charlie`, click `Get Ephemeral DB Credentials` and copy the generated `v-token-readonly-...` username and password. Connect to `postgres` using that ephemeral login and confirm `SELECT` queries succeed. Next, as `Alice`, click `Revoke Immediately` on the lease. Verify that `iconfigly` calls OpenBao `/v1/sys/leases/revoke`, drops the PostgreSQL role immediately, and Charlie's SQL login is instantly rejected.
* [ ] **Step 5 (Emergency Break-Glass & Post-Incident Sign-Off):** As an authorized on-call lead (`Bob`), click `Emergency Break-Glass Access` for `payments-db` in `PROD`, enter Incident Ticket `INC-2026-0911`, and submit. Verify access is granted immediately without waiting for approval, a `CRITICAL` alert email arrives in **Mailpit** (`http://localhost:8025`), and the request appears under `Pending Post-Incident Reviews`. Log in as `Alice` (`ORG_ADMIN`), inspect Bob's actions in the `Post-Incident Review Drawer`, and sign off on the review (`status = REVIEWED`).
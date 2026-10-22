# iconfigly — Phase 2 Engineering Blueprint: Change-Safety Core, Blast-Radius Impact Analysis, Approvals, Temporary Access & Transactional Outbox

> **Document Scope:** Phase 2 Complete Engineering Plan (Sub-Phase 2.0 to Sub-Phase 2.10)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Ports & Adapters (Hexagonal) + Transactional Outbox Pattern
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; building production Go and distributed systems workflows from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 2 Executive Summary & Scope](#1-phase-2-executive-summary--scope)
2. [Phase 2 Architectural Decisions & Rationale (ADRs)](#2-phase-2-architectural-decisions--rationale-adrs)
3. [Phase 2 DDD Bounded Contexts & Domain Event Flow](#3-phase-2-ddd-bounded-contexts--domain-event-flow)
4. [Complete Phase 2 Folder & File Evolution](#4-complete-phase-2-folder--file-evolution)
5. [Sub-Phase 2.0: Infrastructure Additions (`Mailpit`) & Shared Kernel Envelope Encryption](#5-sub-phase-20-infrastructure-additions-mailpit--shared-kernel-envelope-encryption)
6. [Sub-Phase 2.1: Relational Data Model & Database Migrations (`000010`–`000015`)](#6-sub-phase-21-relational-data-model--database-migrations-000010000015)
7. [Sub-Phase 2.2: Versioned Configuration Bounded Context (`configitem`)](#7-sub-phase-22-versioned-configuration-bounded-context-configitem)
8. [Sub-Phase 2.3: Secret References & Provider Port/Adapter (`secretref` & `secretprovider`)](#8-sub-phase-23-secret-references--provider-portadapter-secretref--secretprovider)
9. [Sub-Phase 2.4: Blast-Radius Impact Analysis Bounded Context (`impact`)](#9-sub-phase-24-blast-radius-impact-analysis-bounded-context-impact)
10. [Sub-Phase 2.5: Change Request & Multi-Approver Governance Bounded Contexts (`change` & `approval`)](#10-sub-phase-25-change-request--multi-approver-governance-bounded-contexts-change--approval)
11. [Sub-Phase 2.6: Time-Boxed Temporary Access Bounded Context (`access` Expansion)](#11-sub-phase-26-time-boxed-temporary-access-bounded-context-access-expansion)
12. [Sub-Phase 2.7: Transactional Outbox, Background Workers & Notification Engine (`notification` & `worker`)](#12-sub-phase-27-transactional-outbox-background-workers--notification-engine-notification--worker)
13. [Sub-Phase 2.8: Server Wiring & Worker Process Orchestration (`cmd/server`, `cmd/worker`, `internal/server`)](#13-sub-phase-28-server-wiring--worker-process-orchestration-cmdserver-cmdworker-internalserver)
14. [Sub-Phase 2.9: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 2)](#14-sub-phase-29-nextjs-web-dashboard-architecture--ui-iconfigly-web-phase-2)
15. [Sub-Phase 2.10: Comprehensive Testing Strategy & Phase 2 Verification Checklist](#15-sub-phase-210-comprehensive-testing-strategy--phase-2-verification-checklist)

---

## 1. Phase 2 Executive Summary & Scope

### 1.1 Phase 2 Objective

Phase 2 transforms **iconfigly** from a static catalog and RBAC foundation into an active **Change-Safety and Access Governance Control Plane**. By the end of Phase 2, engineering teams can manage immutable versioned configurations with key-level diffing and 1-click rollbacks, register external secret pointers (`secret_refs`), submit governed Change Requests that automatically compute the exact **Blast-Radius Impact** across directly bound and transitively dependent microservices, enforce multi-approver Separation of Duties (`approver != requester`), grant time-boxed expiring access leases (`access_requests`), and reliably notify all impacted engineering teams via an atomic PostgreSQL Transactional Outbox worker (In-App, SMTP Email via Mailpit, and HMAC-SHA256 signed Webhooks).

### 1.2 Why Phase 2 Is the Centerpiece of `iconfigly`

In Phase 1, the platform learned **what exists** (Projects, Environments, Services, Resources, and Dependency Bindings) and **who is authorized** (Teams, Users, and Scoped RBAC). Phase 2 puts that relational graph to work to prevent the three most common operational incidents in microservice architectures:

1. **Unannounced Breaking Infrastructure Changes:** Rotating credentials or changing the host of a shared database (`payments-db` in `UAT`) without realizing four microservices and two downstream teams depend on it.
2. **Untracked Configuration Mutations:** Editing environment variables directly in production with no peer review, no diff comparison, and no instant rollback mechanism.
3. **Forgotten Permanent Production Access:** Granting an engineer permanent `PROD` database or configuration access for a 30-minute debugging session and never revoking it.

### 1.3 Repository Activation in Phase 2

| Repository | Phase 2 Status | Role in Phase 2 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds local `mailpit` SMTP & web email catcher container (`127.0.0.1:8025` / `1025`) and SMTP environment variables. |
| **`iconfigly-api`** | **Active** | Adds migrations `000010`–`000015`, 7 new DDD bounded contexts/packages (`configitem`, `secretref`, `secretprovider`, `impact`, `change`, `approval`, `notification`), background workers (`worker`), and `cmd/worker/main.go`. |
| **`iconfigly-web`** | **Active** | Adds Config Diff & Rollback UI, Change Request Wizard with live Blast-Radius Preview, Approval Inbox, Temporary Access Lease UI, and Notification Center. |
| **`iconfigly-docs`** | **Active** | Phase 2 engineering blueprint and updated API specifications. |
| **`iconfigly-cli`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-js`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-go`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-sdk-java`** | Dormant (Phase 4) | Empty repository placeholder. |
| **`iconfigly-operator`** | Dormant (Phase 5) | Empty repository placeholder. |

### 1.4 Scope Boundaries for Phase 2

| In Scope for Phase 2 | Out of Scope for Phase 2 (Deferred to Later Phases) |
| :--- | :--- |
| Immutable configuration versioning (`config_items`, `config_versions`), version diffs, environment comparisons (`UAT` vs `PROD`), and non-destructive rollbacks | Live OpenBao / HashiCorp Vault container and dynamic database credential generation (Phase 3) |
| Secret Reference pointers (`secret_refs` storing `openbao://...` URIs) and `SecretProvider` Port Interface with deterministic `MockProvider` Adapter | Emergency Break-Glass bypass workflow with security incident ticket enforcement (Phase 3) |
| Blast-Radius Impact Analysis Engine using PostgreSQL Recursive CTEs (`service_resource_bindings` + `service_dependencies`) and Risk Scoring (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) | Instance heartbeat telemetry (`POST /api/v1/telemetry/heartbeat`), live instance rollout progress bars, and drift detection (Phase 4) |
| Governed Change Request State Machine (`DRAFT` $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ `APPROVED` $\rightarrow$ `APPLYING` $\rightarrow$ `APPLIED` $\rightarrow$ `ROLLED_BACK`) with `Idempotency-Key` support | Developer CLI (`iconfigly run`) and language SDKs (`js`, `go`, `java`) (Phase 4) |
| Multi-approver workflow enforcing Separation of Duties (`approver_user_id != requested_by`) and environment approval thresholds (`required_approvals`) | Kubernetes `kind` cluster, Helm charts, and `iconfigly-operator` ConfigMap/Secret syncing (Phase 5) |
| Time-boxed Temporary Access Requests (`access_requests`) creating expiring `role_bindings` (`expires_at`) and automated background revocation | Native OIDC/SSO login, GitHub repo sync, and Slack/Teams rich blocks (Phase 6) |
| PostgreSQL Transactional Outbox (`outbox_events`) + `FOR UPDATE SKIP LOCKED` Worker | |
| In-App Notification Inbox, SMTP Email delivery (`Mailpit`), HMAC-SHA256 signed Webhooks, and customizable `notification_rules` | |
| AES-256-GCM Envelope Encryption (`internal/shared/crypto/envelope.go`) for encrypting webhook secrets at rest | |

---

## 2. Phase 2 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-013** | **Config vs. Secret Separation** | **Distinct `config_items` (Versioned Values) vs. `secret_refs` (URI Pointers)** | Non-secret settings (`LOG_LEVEL`, `POOL_SIZE`) benefit from instant inline diffing in PostgreSQL. Sensitive credentials must never sit in PostgreSQL as plaintext; storing only `openbao://...` URIs eliminates database leak blast radius. | **Storing encrypted passwords inside `config_versions`:** Turns the control plane into a homemade secret vault and risks accidental plaintext exposure in diffs or logs. |
| **ADR-014** | **Secret Engine Decoupling** | **Hexagonal Port & Adapter (`secretprovider.SecretProvider` Interface)** | Defines a strict Go interface (`ValidateRef`, `ResolveSecret`, `RotateSecret`, `IssueDynamicLease`, `RevokeLease`). Phase 2 injects a deterministic `MockProvider` so the entire Change Request and rotation workflow can be built and unit-tested before adding OpenBao in Phase 3. | **Hardcoding Vault HTTP calls in `change.Service`:** Couples business logic to a specific vendor and makes unit testing impossible without a running Vault container. |
| **ADR-015** | **Immutable Rollback Semantics** | **Forward-Only Version Append ($\text{Rollback } v_{15} \rightarrow v_{14} \text{ creates } v_{16}$)** | Preserves a 100% immutable historical ledger. Rolling back to $v_{14}$ creates a new version $v_{16}$ whose payload equals $v_{14}$, linked to the rollback Change Request and audit entry. | **Deleting $v_{15}$ or moving a pointer backward without a new version:** Destroys audit history and confuses downstream consumers that track monotonic version numbers. |
| **ADR-016** | **Impact Graph Traversal** | **PostgreSQL `WITH RECURSIVE` CTE with Cycle Prevention ($\text{Depth} \le 5$)** | Computes both direct service bindings (`service_resource_bindings`) and transitive service-to-service callers (`service_dependencies`) in a single sub-5ms database round-trip, using a `visited` UUID array to prevent infinite loops on cyclic dependencies. | **Fetching edges into Go memory and running BFS via N+1 queries:** High latency and excessive database round-trips on large dependency graphs. |
| **ADR-017** | **Separation of Duties** | **Domain Invariant Prohibiting Self-Approval (`approver_user_id != requested_by`)** | Enforced in both the Domain Layer (`ChangeRequest.CanBeApprovedBy`, `AccessRequest.CanBeApprovedBy`) and Application Layer. Guarantees that in governed environments (`required_approvals >= 1`), a second authorized engineer must review the blast radius. | **Allowing any `ORG_ADMIN` or `SERVICE_LEAD` to approve their own request:** Defeats the compliance and peer-review purpose of change management. |
| **ADR-018** | **Idempotent Mutations** | **`Idempotency-Key` Header Stored on `change_requests`** | Network retries or double-clicks on "Submit Change Request" return the existing `ChangeRequest` if the `idempotency_key` matches, preventing duplicate change requests and duplicate notifications. | **No idempotency tracking:** Leads to duplicate pending change requests and noisy team alerts on flaky connections. |
| **ADR-019** | **Asynchronous Event Delivery** | **PostgreSQL Transactional Outbox (`outbox_events` + `FOR UPDATE SKIP LOCKED`)** | Writing the domain mutation, `audit_logs` row, and `outbox_events` row inside the **exact same `TxManager.WithTx` transaction** guarantees at-least-once event delivery with zero external message broker (no Redis or Kafka required). | **Sending emails/webhooks synchronously inside HTTP handlers:** Slows down API responses and loses notifications if the SMTP server or webhook endpoint times out. |
| **ADR-020** | **Worker Deployment Model** | **Unified Worker Engine (`internal/worker`) Runnable In-Process (`cmd/server`) or Standalone (`cmd/worker`)** | During local development, `cmd/server` starts the background workers as managed goroutines inside the single `api` container. In scaled production, `cmd/worker/main.go` allows running dedicated worker replicas cleanly. | **Requiring a separate worker container in dev Day 1:** Doubles Go compilation and memory usage on the developer's laptop unnecessarily. |
| **ADR-021** | **Stored Credential Protection** | **AES-256-GCM Envelope Encryption (`internal/shared/crypto/envelope.go`)** | Webhook signing secrets (`webhook_secret_encrypted`) must be readable by the worker to compute HMAC-SHA256 signatures (unlike user passwords which use one-way Argon2id). AES-256-GCM with random 12-byte nonces and `ICONFIGLY_MASTER_KEY` protects them at rest. | **Storing webhook signing secrets in plaintext:** Exposes downstream webhook endpoints to forgery if the database is read. |
| **ADR-022** | **Local Email Verification** | **Mailpit (`axllent/mailpit:v1.22`) in Docker Compose** | Provides an instant, zero-configuration SMTP server (`port 1025`) and web inbox UI (`http://localhost:8025`) to inspect HTML/text change notification emails locally at $\$0$ cost. | **External cloud SMTP (SendGrid / AWS SES):** Requires API keys, external internet access, and risks sending test emails to real addresses. |

---

## 3. Phase 2 DDD Bounded Contexts & Domain Event Flow

### 3.1 Phase 2 Bounded Context Map

Phase 2 introduces **six new domain packages** (`configitem`, `secretref`, `impact`, `change`, `approval`, `notification`), **one infrastructure port/adapter package** (`secretprovider`), **one background job orchestrator** (`worker`), and expands the Phase 1 `access` and `shared/crypto` packages.

```
flowchart TD
    subgraph Transport["HTTP Transport & Worker Entrypoints"]
        Srv["internal/server\n(Phase 1 + Phase 2 Route Registration)"]
        Wrk["internal/worker\n(OutboxWorker & ExpiryWorker Goroutines)"]
    end

    subgraph ChangeGovernance["Change-Safety & Governance Bounded Contexts (NEW)"]
        Chg["internal/change\n(ChangeRequest Aggregate & State Machine)"]
        App["internal/approval\n(Approval Decisions & Separation-of-Duties)"]
        Imp["internal/impact\n(Recursive CTE Blast-Radius & Risk Scorer)"]
        Acc["internal/access (EXPANDED)\n(Scoped RBAC + Time-Boxed AccessRequests)"]
    end

    subgraph ConfigAndSecrets["Configuration & Secret Reference Contexts (NEW)"]
        CfgItem["internal/configitem\n(ConfigItem, Immutable ConfigVersions, Diff Engine)"]
        SecRef["internal/secretref\n(SecretRef URI Pointers & Rotation Metadata)"]
        SecProv["internal/secretprovider\n(SecretProvider Port Interface + MockProvider)"]
    end

    subgraph AsyncAndAudit["Accountability & Asynchronous Messaging Contexts"]
        Notif["internal/notification (NEW)\n(Outbox Producer, Rules, In-App, SMTP, HMAC Webhook)"]
        Aud["internal/audit (Phase 1)\n(Hash-Chained Immutable Audit Trail)"]
    end

    subgraph Phase1Catalog["Phase 1 Catalog Foundation"]
        Bind["internal/binding\n(Service-Resource Links & Service Dependencies)"]
        Svc["internal/service\n(Microservice Catalog)"]
        Res["internal/resource\n(Infrastructure Resources)"]
        Env["internal/environment\n(Environment Tiers & Approval Thresholds)"]
    end

    Srv --> ChangeGovernance
    Srv --> ConfigAndSecrets
    Srv --> AsyncAndAudit
    Wrk --> Notif
    Wrk --> Acc
    Chg --> Imp
    Chg --> App
    Chg --> CfgItem
    Chg --> SecRef
    Chg --> Res
    Chg --> Notif
    Chg --> Aud
    SecRef --> SecProv
    Imp --> Bind
    Imp --> Svc
    Imp --> Env

```

### 3.2 End-to-End Sequence: The Centerpiece Change-Safety Workflow

This sequence diagram illustrates how the bounded contexts collaborate during the lifecycle of a governed infrastructure or configuration change:

```
sequenceDiagram
    actor Dev as Requester (DevOps / Dev)
    actor Lead as Approver (Team Lead)
    participant ChgSvc as change.Service
    participant ImpSvc as impact.Analyzer
    participant SecProv as secretprovider.Provider
    participant DB as PostgreSQL 18 (TxManager)
    participant Worker as worker.OutboxWorker
    participant Mail as Mailpit SMTP & Webhooks

    Dev->>ChgSvc: 1. Submit Change Request (Rotate payments-db in UAT)
    ChgSvc->>ImpSvc: ComputeImpact(ctx, TargetResource, payments-db, UAT)
    ImpSvc->>DB: Recursive CTE over bindings & service_dependencies
    DB-->>ImpSvc: 4 Services (payment, refund, invoice, recon), 2 Teams, Risk=HIGH
    ImpSvc-->>ChgSvc: ImpactReport Snapshot
    ChgSvc->>DB: WithTx: INSERT change_requests (PENDING_APPROVAL) + audit_logs + outbox_events ("change.requested")
    ChgSvc-->>Dev: 201 Created (Shows Blast Radius & Required Approvals = 1)

    Lead->>ChgSvc: 2. Approve Change Request (Comment: "Verified maintenance window")
    ChgSvc->>ChgSvc: Enforce Separation of Duties (Lead.UserID != Dev.UserID)
    ChgSvc->>DB: WithTx: INSERT approvals + UPDATE change_requests (APPROVED) + audit_logs + outbox_events ("change.approved")
    ChgSvc-->>Lead: 200 OK (Status = APPROVED)

    Dev->>ChgSvc: 3. Apply Approved Change Request
    ChgSvc->>SecProv: RotateSecret(ctx, "openbao://payments/uat/payments-db")
    SecProv-->>ChgSvc: New Version = 19
    ChgSvc->>DB: WithTx: UPDATE secret_refs/resources (v19) + UPDATE change_requests (APPLIED) + audit_logs + outbox_events ("change.applied")
    ChgSvc-->>Dev: 200 OK (Status = APPLIED, Version = 19)

    loop Every 2 Seconds
        Worker->>DB: SELECT ... FROM outbox_events WHERE status='PENDING' FOR UPDATE SKIP LOCKED
        Worker->>DB: Resolve Affected Team Members (Payments Team, Finance Team) + Matching Notification Rules
        Worker->>DB: INSERT INTO notifications (In-App Inbox)
        Worker->>Mail: Send Formatted Blast-Radius Email & HMAC-SHA256 Signed Webhook
        Worker->>DB: UPDATE outbox_events SET status='DELIVERED'
    end

```

---

## 4. Complete Phase 2 Folder & File Evolution

### 4.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── .env                                      # UPDATED: Adds SMTP variables (ICONFIGLY_SMTP_HOST, ICONFIGLY_SMTP_PORT, ICONFIGLY_SMTP_FROM)
├── .env.example                              # UPDATED: Documents SMTP and worker interval environment variables
├── .gitignore                                # Unchanged from Phase 1
└── compose.yaml                              # UPDATED: Adds mailpit service (ports 8025 & 1025) and injects SMTP env vars into api

```

### 4.2 `iconfigly-api` File Additions & Updates (Phase 2 Expansion)

Files marked `[NEW]` are created in Phase 2; files marked `[UPDATED]` evolve existing Phase 1 files cleanly without breaking Phase 1 contracts.

```
iconfigly-api/
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds Phase 2 schemas & endpoints (configs, secret-refs, changes, access-requests, notifications)
├── cmd/
│   ├── server/
│   │   └── main.go                           # [UPDATED] Instantiates Phase 2 services and starts background worker goroutines when ICONFIGLY_RUN_EMBEDDED_WORKER=true
│   └── worker/
│       └── main.go                           # [NEW] Standalone background worker entrypoint for dedicated production worker containers
├── migrations/
│   ├── 000001..000009                        # Unchanged Phase 1 migrations
│   ├── 000010_create_config_items_and_versions.up.sql
│   ├── 000010_create_config_items_and_versions.down.sql
│   ├── 000011_create_secret_refs.up.sql
│   ├── 000011_create_secret_refs.down.sql
│   ├── 000012_create_change_requests_and_approvals.up.sql
│   ├── 000012_create_change_requests_and_approvals.down.sql
│   ├── 000013_create_access_requests.up.sql
│   ├── 000013_create_access_requests.down.sql
│   ├── 000014_create_notifications_and_rules.up.sql
│   ├── 000014_create_notifications_and_rules.down.sql
│   ├── 000015_create_outbox_events.up.sql
│   └── 000015_create_outbox_events.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # [UPDATED] Adds SMTPHost, SMTPPort, SMTPFrom, RunEmbeddedWorker, WorkerPollIntervalMs
    │   └── config_test.go                    # [UPDATED] Tests new SMTP & worker config defaults
    ├── server/
    │   ├── server.go                         # [UPDATED] Wires Phase 2 repositories, services, and HTTP routes
    │   └── server_test.go                    # [UPDATED] Verifies Phase 2 route registration
    ├── shared/
    │   ├── crypto/
    │   │   ├── password.go                   # Unchanged Phase 1
    │   │   ├── token.go                      # Unchanged Phase 1
    │   │   ├── envelope.go                   # [NEW] AES-256-GCM Seal/Open envelope encryption for stored webhook secrets
    │   │   └── crypto_test.go                # [UPDATED] Adds round-trip tamper-detection tests for AES-256-GCM envelope encryption
    │   └── httputil/
    │       ├── idempotency.go                # [NEW] Extracts and validates optional Idempotency-Key request header
    │       └── httputil_test.go              # [UPDATED] Tests Idempotency-Key validation
    ├── service/
    │   ├── domain.go                         # [UPDATED] Enriches ServiceContextView with ActiveConfigVersion, SecretRefCount, PendingChangesCount
    │   ├── postgres_repo.go                  # [UPDATED] Includes latest config version summary in Single-Pane Service Context query
    │   └── service.go                        # [UPDATED] Populates config & secret ref summaries in GetServiceEnvironmentContext
    ├── access/
    │   ├── domain.go                         # [UPDATED] Adds AccessRequest Aggregate, AccessRequestStatus enum, and Separation-of-Duties rules
    │   ├── authorizer.go                     # [UPDATED] Adds Phase 2 permission verbs (config.read, config.write, secretref.resolve, change.request, change.approve, change.apply, access.request, access.approve)
    │   ├── repository.go                     # [UPDATED] Adds AccessRequest persistence & active expiring lease queries
    │   ├── postgres_repo.go                  # [UPDATED] Implements SQL queries for access_requests and expiring role_bindings
    │   ├── service.go                        # [UPDATED] Adds RequestTemporaryAccess, ApproveTemporaryAccess, RejectTemporaryAccess, RevokeTemporaryAccess, ExpireOverdueAccessRequests
    │   ├── handler.go                        # [UPDATED] Adds /api/v1/projects/{projectID}/access-requests/* handlers
    │   └── authorizer_test.go                # [UPDATED] Tests Phase 2 verbs and self-approval rejection
    ├── configitem/
    │   ├── domain.go                         # [NEW] ConfigItem Aggregate, ConfigVersion Entity, ConfigDiffEntry, EnvironmentComparisonResult
    │   ├── diff.go                           # [NEW] Pure deterministic diff engine comparing two version snapshots or two environments
    │   ├── repository.go                     # [NEW] ConfigRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for config_items and config_versions
    │   ├── service.go                        # [NEW] ListServiceConfigs, GetVersionHistory, CompareVersions, CompareEnvironments, ApplyConfigMutations, RollbackConfigVersion
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/projects/{projectID}/configs/*
    │   └── diff_test.go                      # [NEW] Table-driven unit tests for ADDED, MODIFIED, REMOVED, and UNCHANGED key diffs
    ├── secretprovider/
    │   ├── provider.go                       # [NEW] SecretProvider Port Interface (ValidateRef, ResolveSecret, RotateSecret, IssueDynamicLease, RevokeLease)
    │   ├── mock.go                           # [NEW] Deterministic in-memory MockProvider for Phase 2 development and automated testing
    │   └── mock_test.go                      # [NEW] Unit tests verifying URI format validation, simulated resolution, and rotation increments
    ├── secretref/
    │   ├── domain.go                         # [NEW] SecretRef Aggregate, ProviderType enum (MOCK, OPENBAO), SecretURI Value Object
    │   ├── repository.go                     # [NEW] SecretRefRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for secret_refs
    │   ├── service.go                        # [NEW] CreateSecretRef, ListSecretRefs, ResolveSecretRefValue, RotateSecretRefViaChange
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/projects/{projectID}/secret-refs/*
    │   └── service_test.go                   # [NEW] Unit tests verifying RBAC enforcement on secret resolution and audit logging without secret value leakage
    ├── impact/
    │   ├── domain.go                         # [NEW] ImpactReport Value Object, AffectedServiceNode, AffectedTeamSummary, RiskLevel enum (LOW, MEDIUM, HIGH, CRITICAL)
    │   ├── analyzer.go                       # [NEW] Blast-radius graph analyzer and deterministic RiskScore formula
    │   ├── repository.go                     # [NEW] ImpactGraphRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL WITH RECURSIVE CTE traversal over bindings and service_dependencies
    │   └── analyzer_test.go                  # [NEW] Table-driven unit tests for direct bindings, transitive depth, cycle prevention, and risk scoring
    ├── approval/
    │   ├── domain.go                         # [NEW] ApprovalDecision Entity, DecisionType enum (APPROVED, REJECTED), ApprovalProgress summary
    │   ├── repository.go                     # [NEW] ApprovalRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for approvals table
    │   ├── service.go                        # [NEW] RecordDecision, ListDecisionsForChange, CheckQuorumMet
    │   └── service_test.go                   # [NEW] Unit tests for quorum calculation, duplicate vote prevention, and self-approval denial
    ├── change/
    │   ├── domain.go                         # [NEW] ChangeRequest Aggregate, ChangeStatus enum, ChangeTargetType enum, ProposedChangePayload
    │   ├── statemachine.go                   # [NEW] Explicit state transition table and guard validators
    │   ├── repository.go                     # [NEW] ChangeRequestRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for change_requests
    │   ├── service.go                        # [NEW] PreviewImpact, CreateChangeRequest, SubmitDraft, ApproveOrRejectChange, ApplyChangeRequest, RollbackChangeRequest, CancelChangeRequest
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/projects/{projectID}/change-requests/*
    │   └── statemachine_test.go              # [NEW] Exhaustive table-driven tests for valid and illegal state transitions
    ├── notification/
    │   ├── domain.go                         # [NEW] OutboxEvent, NotificationRule, InAppNotification, EventType enum, ChannelType enum
    │   ├── email.go                          # [NEW] SMTP email composer and sender (compatible with Mailpit and standard SMTP)
    │   ├── webhook.go                        # [NEW] HTTP webhook dispatcher with HMAC-SHA256 payload signing (X-Iconfigly-Signature-256)
    │   ├── repository.go                     # [NEW] NotificationRepository and OutboxRepository interfaces
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation including FOR UPDATE SKIP LOCKED outbox batch claiming
    │   ├── service.go                        # [NEW] EnqueueOutboxEvent, ProcessPendingOutboxBatch, CreateRule, ListRules, ListUserInbox, MarkNotificationRead
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/notifications/* and /api/v1/projects/{projectID}/notification-rules/*
    │   └── webhook_test.go                   # [NEW] Unit tests for HMAC-SHA256 signature generation, retry backoff calculation, and recipient deduplication
    └── worker/
        ├── outbox_worker.go                  # [NEW] Polling loop claiming outbox_events and dispatching notifications with exponential backoff
        ├── expiry_worker.go                  # [NEW] Polling loop expiring overdue access_requests and revoking expired role_bindings
        └── worker_test.go                    # [NEW] Integration tests verifying concurrent worker safety and automatic lease expiration

```

### 4.3 `iconfigly-web` File Additions & Updates (`src/`)

```
iconfigly-web/
└── src/
    ├── app/
    │   └── (dashboard)/
    │       ├── layout.tsx                    # [UPDATED] Adds NotificationBell with live unread badge in TopHeader
    │       ├── dashboard/
    │       │   └── page.tsx                  # [UPDATED] Adds Pending Change Approvals widget and Active Temporary Leases widget
    │       ├── projects/
    │       │   └── [projectId]/
    │       │       ├── services/
    │       │       │   └── [serviceSlug]/
    │       │       │       └── page.tsx      # [UPDATED] Adds Config Snapshot tab, Secret Refs tab, and Change History tab to Service Context view
    │       │       ├── resources/
    │       │       │   └── [resourceId]/
    │       │       │       └── page.tsx      # [UPDATED] Adds Secret References panel, Rotate Credential button (opens Change Wizard), and Blast Radius preview
    │       │       ├── configs/
    │       │       │   └── page.tsx          # [NEW] Service Configuration Manager, Side-by-Side Version Diff Viewer, Environment Comparator (UAT vs PROD), 1-Click Rollback
    │       │       ├── changes/
    │       │       │   ├── page.tsx          # [NEW] Change Requests Queue filterable by Status (PENDING_APPROVAL, APPROVED, APPLIED), Risk Level, and Environment
    │       │       │   ├── new/
    │       │       │   │   └── page.tsx      # [NEW] Interactive Change Request Wizard with live Blast-Radius Impact Analysis preview
    │       │       │   └── [changeId]/
    │       │       │       └── page.tsx      # [NEW] Change Request Detail View: Impact Card, Proposed Diff, Approval Quorum Timeline, Approve/Reject/Apply/Rollback actions
    │       │       └── access/
    │       │           ├── page.tsx          # [UPDATED] Displays active temporary leases with live countdown badges inside "Who Has Access?"
    │       │           └── requests/
    │       │               └── page.tsx      # [NEW] Temporary Access Requests Queue, Request Time-Boxed Access Modal, and Lease Countdown Timer
    │       └── notifications/
    │           ├── page.tsx                  # [NEW] In-App Notification Inbox with read/unread filter and deep links to Change/Access Requests
    │           └── rules/
    │               └── page.tsx              # [NEW] Notification Rules Builder (WHEN event in environment -> NOTIFY teams via In-App, Email, Webhook)
    ├── components/
    │   └── layout/
    │       └── NotificationBell.tsx          # [NEW] Header dropdown displaying unread notifications and quick "Mark all as read"
    ├── features/
    │   ├── configs/                          # [NEW] ConfigKeyTable, ConfigDiffViewer, EnvComparisonMatrix, ConfigVersionTimeline, useConfigs hooks
    │   ├── secretrefs/                       # [NEW] SecretRefListCard, RegisterSecretRefModal, ResolveSecretModal, useSecretRefs hooks
    │   ├── changes/                          # [NEW] ChangeRequestWizard, BlastRadiusImpactCard, ApprovalDecisionPanel, RiskBadge, useChanges hooks
    │   ├── access/                           # [UPDATED] Adds TempAccessRequestModal, AccessRequestTable, LeaseCountdownBadge, useAccessRequests hooks
    │   └── notifications/                    # [NEW] NotificationInboxList, NotificationRuleModal, WebhookTestButton, useNotifications hooks
    └── lib/
        └── types.ts                          # [UPDATED] Adds TypeScript interfaces for ConfigItem, ConfigDiff, SecretRef, ImpactReport, ChangeRequest, AccessRequest, NotificationRule

```

---

## 5. Sub-Phase 2.0: Infrastructure Additions (`Mailpit`) & Shared Kernel Envelope Encryption

### 5.1 Goal & Engineering Rationale

Before implementing asynchronous notifications or storing webhook secrets in PostgreSQL, we upgrade the local container stack with **Mailpit** (so all outbound SMTP emails can be inspected locally at `http://localhost:8025`) and add **AES-256-GCM Envelope Encryption** to the Shared Kernel so webhook signing secrets are encrypted at rest before touching the database.

### 5.2 Container & Configuration Changes (`iconfigly-infra` & `internal/config`)

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-infra/compose.yaml` | **Update** | 1. Adds the `mailpit` service using image `axllent/mailpit:v1.22` (`container_name: iconfigly-mailpit`), binding `127.0.0.1:8025:8025` (Web UI) and `127.0.0.1:1025:1025` (SMTP server).<br>2. Updates the `api` service environment block to pass `ICONFIGLY_SMTP_HOST=mailpit`, `ICONFIGLY_SMTP_PORT=1025`, `ICONFIGLY_SMTP_FROM=noreply@iconfigly.local`, and `ICONFIGLY_RUN_EMBEDDED_WORKER=true`. |
| `iconfigly-infra/.env.example` & `.env` | **Update** | Appends `ICONFIGLY_SMTP_HOST=mailpit`, `ICONFIGLY_SMTP_PORT=1025`, `ICONFIGLY_SMTP_FROM=noreply@iconfigly.local`, and `ICONFIGLY_RUN_EMBEDDED_WORKER=true`. |
| `iconfigly-api/internal/config/config.go` | **Update** | Expands `Config` struct with:<br>• `SMTPHost string` (`ICONFIGLY_SMTP_HOST`, default `"localhost"`)<br>• `SMTPPort int` (`ICONFIGLY_SMTP_PORT`, default `1025`)<br>• `SMTPFrom string` (`ICONFIGLY_SMTP_FROM`, default `"noreply@iconfigly.local"`)<br>• `RunEmbeddedWorker bool` (`ICONFIGLY_RUN_EMBEDDED_WORKER`, default `true`)<br>• `WorkerPollInterval time.Duration` (`ICONFIGLY_WORKER_POLL_MS`, default `2000ms`) |

### 5.3 Shared Kernel Additions (`internal/shared/crypto/envelope.go` & `httputil/idempotency.go`)

| File Path | Structs / Functions | Exact Behavior & Security Invariants |
| :--- | :--- | :--- |
| `internal/shared/crypto/envelope.go` | Struct: `EnvelopeCipher`<br>Func: `NewEnvelopeCipher(masterKeyHex string) (*EnvelopeCipher, error)`<br>Method: `Encrypt(plaintext []byte) ([]byte, error)`<br>Method: `Decrypt(ciphertext []byte) ([]byte, error)` | **`NewEnvelopeCipher`:** Decodes the 64-character hex `masterKeyHex` into a 32-byte AES-256 key and initializes an `aes.NewCipher` + `cipher.NewGCM` AEAD instance.<br>**`Encrypt`:** Generates a cryptographically random 12-byte nonce via `crypto/rand`, seals the plaintext with GCM authentication tag, and returns `nonce || ciphertext` as a single `[]byte` slice suitable for a PostgreSQL `BYTEA` column.<br>**`Decrypt`:** Splits the 12-byte nonce prefix, verifies the GCM authentication tag (returning an error if tampered with), and returns the decrypted plaintext bytes. |
| `internal/shared/httputil/idempotency.go` | Func: `ExtractIdempotencyKey(r *http.Request) (string, error)` | Reads the `Idempotency-Key` HTTP header. If empty, generates a deterministic fallback UUIDv7 or returns empty string depending on endpoint policy. If present, validates that length is between 8 and 128 printable ASCII characters, returning `apperror.Validation` otherwise. |

---

## 6. Sub-Phase 2.1: Relational Data Model & Database Migrations (`000010`–`000015`)

### 6.1 Phase 2 Entity-Relationship Diagram (ERD)

Phase 2 adds **9 new tables** across **6 migration pairs** (`000010` to `000015`), integrating seamlessly with the 14 tables created in Phase 1.

```
erDiagram
    services ||--o{ config_items : "owns_config"
    environments ||--o{ config_items : "scopes_config"
    config_items ||--o{ config_versions : "has_immutable_versions"

    resources ||--o{ secret_refs : "has_secret_pointer"
    services ||--o{ secret_refs : "has_secret_pointer"
    environments ||--o{ secret_refs : "scopes_secret_pointer"

    projects ||--o{ change_requests : "governs"
    environments ||--o{ change_requests : "targets_env"
    users ||--o{ change_requests : "requests_or_applies"
    change_requests ||--o{ approvals : "collects_decisions"
    change_requests ||--o{ config_versions : "produces_version"

    projects ||--o{ access_requests : "tracks_temp_access"
    environments ||--o{ access_requests : "in_env"
    users ||--o{ access_requests : "requests_or_approves"
    role_bindings ||--o| access_requests : "backs_temp_grant"

    organizations ||--o{ notification_rules : "configures_routing"
    users ||--o{ notifications : "receives_in_app"
    organizations ||--o{ outbox_events : "queues_atomic_events"

```

### 6.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

#### Migration `000010_create_config_items_and_versions`

* **Table `config_items`:** Represents a logical configuration key (`LOG_LEVEL`, `PAYMENT_TIMEOUT_MS`, `FEATURE_NEW_CHECKOUT`) belonging to a `(service_id, environment_id)` pair, tracking the active version pointer.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `config_key`: `TEXT NOT NULL` (Validated uppercase/alphanumeric/underscore/dot key, e.g., `DB_POOL_MAX`)
  * `value_type`: `TEXT NOT NULL DEFAULT 'STRING' CHECK (value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON'))`
  * `description`: `TEXT NOT NULL DEFAULT ''`
  * `current_version_number`: `INT NOT NULL DEFAULT 1 CHECK (current_version_number >= 1)`
  * `is_deleted`: `BOOLEAN NOT NULL DEFAULT FALSE` (Soft-delete flag so historical versions remain queryable and rollbacks can restore deleted keys)
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (environment_id, service_id, config_key)`, `idx_config_items_service_env` on `(service_id, environment_id)`.

* **Table `config_versions`:** Immutable, append-only ledger of configuration snapshots per `config_item_id`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `config_item_id`: `UUID NOT NULL REFERENCES config_items(id) ON DELETE CASCADE`
  * `version_number`: `INT NOT NULL CHECK (version_number >= 1)`
  * `config_value`: `TEXT NOT NULL`
  * `change_request_id`: `UUID NULL` (Foreign key added in migration `000012` or loosely linked to `change_requests(id)`)
  * `rollback_from_version`: `INT NULL` (Populated when this version was created via a rollback operation, e.g., rolling back from `15` to `14` creates `version_number = 16` with `rollback_from_version = 14`)
  * `created_by`: `UUID REFERENCES users(id) ON DELETE SET NULL`
  * `reason`: `TEXT NOT NULL DEFAULT ''`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (config_item_id, version_number)`, `idx_config_versions_item_ver` on `(config_item_id, version_number DESC)`.

#### Migration `000011_create_secret_refs`

* **Table `secret_refs`:** Stores URI pointers (`openbao://...`) to external secrets associated with either an infrastructure `Resource` (e.g., `payments-db` credentials) or a `Service` (e.g., a service-specific webhook token). **Never stores raw secret values.**
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `resource_id`: `UUID NULL REFERENCES resources(id) ON DELETE CASCADE`
  * `service_id`: `UUID NULL REFERENCES services(id) ON DELETE CASCADE`
  * `ref_key`: `TEXT NOT NULL` (e.g., `DB_PASSWORD`, `REDIS_AUTH_TOKEN`, `STRIPE_API_KEY`)
  * `provider_type`: `TEXT NOT NULL DEFAULT 'MOCK' CHECK (provider_type IN ('MOCK', 'OPENBAO'))`
  * `secret_uri`: `TEXT NOT NULL` (e.g., `openbao://secret/data/payments/uat/payments-db#password`)
  * `version_hint`: `INT NOT NULL DEFAULT 1 CHECK (version_hint >= 1)` (Monotonic version counter incremented on each credential rotation)
  * `rotation_interval_days`: `INT NULL CHECK (rotation_interval_days IS NULL OR rotation_interval_days > 0)`
  * `last_rotated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `created_by`: `UUID REFERENCES users(id) ON DELETE SET NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `CHECK (resource_id IS NOT NULL OR service_id IS NOT NULL)` (must attach to a resource, a service, or both), `UNIQUE NULLS NOT DISTINCT (environment_id, resource_id, service_id, ref_key)`, `idx_secret_refs_resource_env` on `(resource_id, environment_id)`, `idx_secret_refs_service_env` on `(service_id, environment_id)`.

#### Migration `000012_create_change_requests_and_approvals`

* **Table `change_requests`:** The aggregate root governing any proposed mutation to service configurations, infrastructure resource connection metadata, or secret reference rotations.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `target_type`: `TEXT NOT NULL CHECK (target_type IN ('SERVICE_CONFIG', 'RESOURCE_METADATA', 'SECRET_ROTATION'))`
  * `target_id`: `UUID NOT NULL` (The UUID of the target `service`, `resource`, or `secret_ref`)
  * `title`: `TEXT NOT NULL`
  * `reason`: `TEXT NOT NULL`
  * `status`: `TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'APPLYING', 'APPLIED', 'FAILED', 'ROLLED_BACK', 'CANCELLED'))`
  * `risk_level`: `TEXT NOT NULL DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))`
  * `risk_score`: `INT NOT NULL DEFAULT 0`
  * `proposed_changes`: `JSONB NOT NULL` (Structured before/after mutation specification)
  * `impact_snapshot`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Serialized `ImpactReport` captured at submission time: affected services, affected teams, transitive depth)
  * `required_approvals`: `INT NOT NULL DEFAULT 0 CHECK (required_approvals >= 0)`
  * `requested_by`: `UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT`
  * `applied_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  * `applied_at`: `TIMESTAMPTZ NULL`
  * `rolled_back_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  * `rolled_back_at`: `TIMESTAMPTZ NULL`
  * `rollback_change_request_id`: `UUID NULL REFERENCES change_requests(id) ON DELETE SET NULL`
  * `failure_reason`: `TEXT NOT NULL DEFAULT ''`
  * `idempotency_key`: `TEXT NOT NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (organization_id, idempotency_key)`, `idx_change_requests_proj_status` on `(project_id, status, created_at DESC)`, `idx_change_requests_target` on `(target_type, target_id)`.

* **Table `approvals`:** Records individual reviewer decisions (`APPROVED` or `REJECTED`) against a `change_request_id`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `change_request_id`: `UUID NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE`
  * `approver_user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT`
  * `approver_role`: `TEXT NOT NULL` (Effective role of the approver at decision time, e.g., `SERVICE_LEAD`, `ENV_ADMIN`, `ORG_ADMIN`)
  * `decision`: `TEXT NOT NULL CHECK (decision IN ('APPROVED', 'REJECTED'))`
  * `comment`: `TEXT NOT NULL DEFAULT ''`
  * `decided_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (change_request_id, approver_user_id)` (one decision per user per change request), `idx_approvals_change_id` on `(change_request_id)`.

#### Migration `000013_create_access_requests`

* **Table `access_requests`:** Tracks requests for temporary, time-boxed RBAC elevation (e.g., 2 hours of `VIEWER` or `DEVELOPER` access to `payments-db` in `PROD`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `requester_user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `scope_type`: `TEXT NOT NULL CHECK (scope_type IN ('ENVIRONMENT', 'SERVICE', 'RESOURCE'))`
  * `scope_id`: `UUID NOT NULL`
  * `requested_role`: `TEXT NOT NULL CHECK (requested_role IN ('VIEWER', 'DEVELOPER', 'SERVICE_LEAD'))`
  * `duration_minutes`: `INT NOT NULL CHECK (duration_minutes >= 15 AND duration_minutes <= 1440)` (Min 15 minutes, max 24 hours)
  * `reason`: `TEXT NOT NULL`
  * `status`: `TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED', 'REVOKED'))`
  * `reviewed_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  * `review_comment`: `TEXT NOT NULL DEFAULT ''`
  * `reviewed_at`: `TIMESTAMPTZ NULL`
  * `role_binding_id`: `UUID NULL REFERENCES role_bindings(id) ON DELETE SET NULL` (Populated when approved; points to the temporary `role_bindings` row)
  * `secret_lease_id`: `TEXT NULL` (Reserved for Phase 3 OpenBao dynamic credential lease ID)
  * `expires_at`: `TIMESTAMPTZ NULL`
  * `revoked_at`: `TIMESTAMPTZ NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Indexes:* `idx_access_requests_proj_status` on `(project_id, status, created_at DESC)`, `idx_access_requests_active_expiry` on `(expires_at) WHERE status = 'ACTIVE'` (partial index enabling sub-millisecond polling by `ExpiryWorker`).

#### Migration `000014_create_notifications_and_rules`

* **Table `notification_rules`:** Declarative routing rules (`WHEN event_type IN environment -> NOTIFY teams/channels`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `name`: `TEXT NOT NULL`
  * `event_types`: `TEXT[] NOT NULL` (Array of subscribed events: `change.requested`, `change.approved`, `change.rejected`, `change.applied`, `change.rolled_back`, `access.requested`, `access.granted`, `access.expired`)
  * `environment_id`: `UUID NULL REFERENCES environments(id) ON DELETE CASCADE` (`NULL` matches all environments in the project)
  * `channels`: `TEXT[] NOT NULL` (Subset of `IN_APP`, `EMAIL`, `WEBHOOK`)
  * `target_team_ids`: `UUID[] NOT NULL DEFAULT '{}'`
  * `webhook_url`: `TEXT NOT NULL DEFAULT ''`
  * `webhook_secret_encrypted`: `BYTEA NULL` (AES-256-GCM encrypted signing secret via `EnvelopeCipher`)
  * `is_enabled`: `BOOLEAN NOT NULL DEFAULT TRUE`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Indexes:* `idx_notification_rules_proj_enabled` on `(project_id) WHERE is_enabled = TRUE`.

* **Table `notifications`:** Per-user In-App notification inbox items.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `recipient_user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `event_type`: `TEXT NOT NULL`
  * `severity`: `TEXT NOT NULL DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL'))`
  * `title`: `TEXT NOT NULL`
  * `message`: `TEXT NOT NULL`
  * `link_url`: `TEXT NOT NULL DEFAULT ''` (Deep link in UI, e.g., `/projects/{id}/changes/{changeId}`)
  * `metadata`: `JSONB NOT NULL DEFAULT '{}'::jsonb`
  * `read_at`: `TIMESTAMPTZ NULL`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Indexes:* `idx_notifications_user_unread` on `(recipient_user_id, created_at DESC) WHERE read_at IS NULL`, `idx_notifications_user_all` on `(recipient_user_id, created_at DESC)`.

#### Migration `000015_create_outbox_events`

* **Table `outbox_events`:** Durable, transactional work queue backing asynchronous notifications.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NULL REFERENCES environments(id) ON DELETE SET NULL`
  * `event_type`: `TEXT NOT NULL`
  * `payload`: `JSONB NOT NULL` (Self-contained event context including `change_request_id`, `impact_snapshot`, `actor`, and summary text)
  * `status`: `TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'DELIVERED', 'DEAD_LETTER'))`
  * `attempts`: `INT NOT NULL DEFAULT 0`
  * `max_attempts`: `INT NOT NULL DEFAULT 5`
  * `last_error`: `TEXT NOT NULL DEFAULT ''`
  * `next_attempt_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `processed_at`: `TIMESTAMPTZ NULL`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Indexes:* `idx_outbox_pending_poll` on `(next_attempt_at ASC, created_at ASC) WHERE status = 'PENDING'` (partial index tailored for `FOR UPDATE SKIP LOCKED` worker polling).

---

## 7. Sub-Phase 2.2: Versioned Configuration Bounded Context (`configitem`)

### 7.1 Domain Model & Invariants (`internal/configitem/domain.go`)

* **`ConfigKey` Value Object:**
  * Invariant: Must be 2–128 characters, trimmed, matching `^[A-Z0-9_.-]+$` (case-normalized to uppercase for environment variables or dot-separated keys). Rejects keys containing sensitive substrings (`PASSWORD`, `SECRET`, `PRIVATE_KEY`, `TOKEN`) with a domain validation error instructing the caller to use a `SecretRef` (`openbao://...`) instead!
* **`ConfigItem` Aggregate Root:**
  * Holds `ID`, `OrganizationID`, `ProjectID`, `EnvironmentID`, `ServiceID`, `Key ConfigKey`, `ValueType` (`STRING`, `NUMBER`, `BOOLEAN`, `JSON`), `Description`, `CurrentVersionNumber int`, `CurrentValue string`, `IsDeleted bool`, `UpdatedAt`.
  * **Value Type Invariant:** When `ValueType == NUMBER`, `CurrentValue` must parse via `strconv.ParseFloat`; when `BOOLEAN`, must be `"true"` or `"false"`; when `JSON`, must pass `json.Valid([]byte(val))`.
* **`ConfigVersion` Entity:**
  * Immutable record of `VersionNumber`, `ConfigValue`, `ChangeRequestID`, `RollbackFromVersion *int`, `CreatedBy`, `Reason`, `CreatedAt`.

### 7.2 Deterministic Diff & Environment Comparison Engine (`internal/configitem/diff.go`)

| Function Signature | Input Parameters | Output & Algorithm Specification |
| :--- | :--- | :--- |
| `ComputeKeyHistoryDiff(vOld, vNew *ConfigVersion) ConfigVersionDiff` | Two `ConfigVersion` snapshots of a single `ConfigItem` | Returns `OldVersion`, `NewVersion`, `OldValue`, `NewValue`, and change classification (`MODIFIED` or `UNCHANGED`). |
| `CompareServiceSnapshots(before, after map[string]ConfigEntry) []ConfigDiffEntry` | Two key-value maps representing a service's complete configuration state at two points in time | Iterates over the sorted union of keys:<br>• Key in `after` only $\rightarrow$ `DiffType = ADDED`<br>• Key in `before` only $\rightarrow$ `DiffType = REMOVED`<br>• Key in both with `before.Value != after.Value` $\rightarrow$ `DiffType = MODIFIED`<br>• Key in both with identical value $\rightarrow$ `DiffType = UNCHANGED` |
| `CompareEnvironments(sourceEnvSlug, targetEnvSlug string, sourceItems, targetItems []*ConfigItem) EnvironmentComparisonResult` | All active `ConfigItem`s of a service in two environments (e.g., `uat` vs `prod`) | Produces a side-by-side matrix highlighting:<br>1. `MissingInTarget`: Keys defined in `UAT` that have not been provisioned in `PROD` yet.<br>2. `MissingInSource`: Keys only in `PROD`.<br>3. `ValueDiffs`: Keys present in both environments with differing values (expected for environment-specific URLs vs unexpected drift). |

### 7.3 File & Function Breakdown (`internal/configitem/`)

| File Path | Functions / Methods | Detailed Execution Flow & Business Rules |
| :--- | :--- | :--- |
| `internal/configitem/repository.go` & `postgres_repo.go` | `ListByServiceAndEnv(ctx, serviceID, envID) ([]*ConfigItem, error)`<br>`GetByKey(ctx, serviceID, envID, key) (*ConfigItem, error)`<br>`UpsertItemAndAppendVersion(ctx, item *ConfigItem, ver *ConfigVersion) error`<br>`ListVersionHistory(ctx, configItemID) ([]*ConfigVersion, error)`<br>`GetVersion(ctx, configItemID, versionNumber int) (*ConfigVersion, error)` | Executes SQL via `txManager.Conn(ctx)`. `UpsertItemAndAppendVersion` atomically increments `current_version_number` on `config_items` (or inserts with `version = 1` if new) and inserts the immutable row into `config_versions`. |
| `internal/configitem/service.go` | `ListServiceConfigs(ctx, actor, projectID, serviceID, envID)`<br>`GetKeyVersionHistory(ctx, actor, projectID, configItemID)`<br>`CompareEnvironments(ctx, actor, projectID, serviceID, baseEnvID, compareEnvID)`<br>`ApplyBatchMutations(txCtx, actor, changeReqID, serviceID, envID, mutations []KeyMutation, reason string) error` | **`ListServiceConfigs` & `CompareEnvironments`:** Require `config.read` at the target `(Environment, Service)` scope.<br>**`ApplyBatchMutations`:** Called inside a transaction when a Change Request is applied (or directly in an environment with `required_approvals == 0`). Validates every `ConfigKey` and `ValueType`, appends new `ConfigVersion` rows, and records `config.updated` in `audit_logs`. |
| `internal/configitem/handler.go` | `HandleListConfigs`, `HandleGetVersionHistory`, `HandleCompareEnvironments` | Exposes REST endpoints under `/api/v1/projects/{projectID}/configs`. |

---

## 8. Sub-Phase 2.3: Secret References & Provider Port/Adapter (`secretref` & `secretprovider`)

### 8.1 Hexagonal Port Interface (`internal/secretprovider/provider.go`)

To ensure **iconfigly** never stores raw passwords in PostgreSQL while allowing Phase 2 to run without an external Vault container, we define the `SecretProvider` port interface in `internal/secretprovider/provider.go`:

| Interface Method | Parameters & Return Types | Contract & Responsibility |
| :--- | :--- | :--- |
| `Name() string` | None $\rightarrow$ `string` | Returns the provider identifier (`"MOCK"` or `"OPENBAO"`). |
| `ValidateRef(ctx context.Context, secretURI string) error` | `ctx`, `secretURI string` $\rightarrow$ `error` | Validates that `secretURI` follows the canonical scheme `openbao://<mount>/<environment>/<target>#<field>` (e.g., `openbao://secret/uat/payments-db#password`). |
| `ResolveSecret(ctx context.Context, secretURI string, versionHint int) (*ResolvedSecret, error)` | `ctx`, `secretURI`, `versionHint` $\rightarrow$ `(*ResolvedSecret, error)` | Fetches the ephemeral secret value from the underlying engine for an authorized caller (`Value string`, `Version int`, `LeaseTTLSeconds int`). **Rule:** The returned `ResolvedSecret` is never logged or cached in PostgreSQL. |
| `RotateSecret(ctx context.Context, secretURI string, metadata map[string]string) (newVersion int, err error)` | `ctx`, `secretURI`, `metadata` $\rightarrow$ `(int, error)` | Instructs the secret engine to rotate/generate a new credential at `secretURI` and returns the new version number (`versionHint + 1`). |
| `IssueDynamicLease(ctx context.Context, secretURI string, ttl time.Duration) (*DynamicLease, error)` | `ctx`, `secretURI`, `ttl` $\rightarrow$ `(*DynamicLease, error)` | Issues a time-limited dynamic credential lease (`LeaseID`, `Username`, `Password`, `ExpiresAt`). Simulated in Phase 2 `MockProvider`; backed by OpenBao Database Engine in Phase 3. |
| `RevokeLease(ctx context.Context, leaseID string) error` | `ctx`, `leaseID string` $\rightarrow$ `error` | Immediately invalidates an active dynamic credential lease before its TTL expires. |

### 8.2 Deterministic Mock Adapter (`internal/secretprovider/mock.go`)

* **`MockProvider` Implementation:**
  * Uses a thread-safe `sync.RWMutex` map storing simulated version numbers and deterministic masked test values per `secretURI`.
  * When `RotateSecret` is called during a Change Request apply in Phase 2, `MockProvider` atomically increments the URI's version counter (e.g., `v1` $\rightarrow$ `v2`) and returns the new version number so `secret_refs.version_hint` and `last_rotated_at` update identically to how OpenBao will behave in Phase 3.

### 8.3 Secret Reference Bounded Context (`internal/secretref/`)

| File Path | Functions / Methods | Detailed Execution Flow & Security Rules |
| :--- | :--- | :--- |
| `internal/secretref/domain.go` | Struct: `SecretRef`<br>Value Object: `SecretURI`<br>Func: `NewSecretURI(raw string) (SecretURI, error)` | Validates that `SecretURI` starts with `openbao://`, contains no query strings or raw credentials, and specifies a valid path and `#key` fragment. |
| `internal/secretref/service.go` | `CreateSecretRef(ctx, actor, projectID, cmd) (*SecretRef, error)`<br>`ListSecretRefs(ctx, actor, projectID, filter) ([]*SecretRef, error)`<br>`ResolveSecretRef(ctx, actor, projectID, secretRefID) (*ResolvedSecretDTO, error)`<br>`ExecuteRotation(txCtx, actor, secretRefID, changeReqID) (*SecretRef, error)` | **`CreateSecretRef`:** Requires `catalog.write` at `Environment` scope. Validates the URI via `provider.ValidateRef`, saves the `secret_refs` metadata row, and writes `secret_ref.created` to `audit_logs`.<br>**`ResolveSecretRef`:** Requires the strict **`secretref.resolve`** permission verb on the target `Resource` or `Service` (which automatically checks permanent RBAC bindings AND active temporary `access_requests` leases!). Writes an explicit **`secret_ref.resolved` audit log entry** before returning the resolved value over HTTPS.<br>**`ExecuteRotation`:** Invoked by `change.Service.ApplyChangeRequest`. Calls `provider.RotateSecret`, updates `version_hint` and `last_rotated_at` on `secret_refs`, increments `resources.version` if attached to a resource, and audits `secret_ref.rotated`. |

---

## 9. Sub-Phase 2.4: Blast-Radius Impact Analysis Bounded Context (`impact`)

### 9.1 How the Blast-Radius Algorithm Works (`internal/impact/analyzer.go`)

Whenever an engineer proposes a change to an infrastructure **Resource** (e.g., rotating `payments-db` credentials or changing its host in `UAT`), a **Secret Reference**, or a **Service Configuration**, the `impact.Analyzer` calculates the complete operational blast radius in three deterministic steps:

```
flowchart LR
    Target["Changed Target:\npayments-db (POSTGRES)\nin UAT Environment"]

    subgraph Hop0["Direct Resource Bindings (Distance = 1)"]
        S1["payment-service\n(Owner: Payments Team)"]
        S2["refund-service\n(Owner: Payments Team)"]
        S3["invoice-service\n(Owner: Finance Team)"]
    end

    subgraph HopN["Transitive Service Callers (Distance = 2..5)"]
        S4["checkout-service\n(Calls payment-service via HTTP)\n(Owner: Storefront Team)"]
        S5["reconciliation-service\n(Calls invoice-service via GRPC)\n(Owner: Finance Team)"]
    end

    Target -->|"service_resource_bindings"| S1
    Target -->|"service_resource_bindings"| S2
    Target -->|"service_resource_bindings"| S3
    S1 -->|"service_dependencies\n(callee -> caller)"| S4
    S3 -->|"service_dependencies\n(callee -> caller)"| S5

```

1. **Step 1 — Direct Service Discovery ($d = 1$):**
   * If `target_type == RESOURCE_METADATA` or `SECRET_ROTATION` (attached to a resource), queries `service_resource_bindings` in `environment_id` to find every microservice directly bound to that resource (`access_mode`, `service_id`, `owner_team_id`).
   * If `target_type == SERVICE_CONFIG`, the target service itself is the root node ($d = 1$).
2. **Step 2 — Transitive Upstream Caller Discovery ($2 \le d \le 5$) via Recursive CTE:**
   * Executes a single PostgreSQL `WITH RECURSIVE` query over `service_dependencies` where `callee_service_id` matches the affected services from Step 1, walking upstream to find `caller_service_id` services that depend on them in the same `environment_id`.
   * Tracks `path UUID[]` (`NOT caller_service_id = ANY(path)`) to guarantee termination even if cyclic service dependencies exist, capping traversal at depth $d = 5$.
3. **Step 3 — Affected Team Aggregation & Risk Score Formula:**
   * Groups all directly and transitively affected services by `owner_team_id` to produce `AffectedTeams []AffectedTeamSummary` (team ID, team name, list of impacted service slugs).
   * Computes the deterministic **Risk Score**:

$$
\text{RiskScore} = (N_{\text{direct}} \times 15) + (N_{\text{transitive}} \times 5) + (I_{\text{prod}} \times 50) + (I_{\text{secret\_or\_conn}} \times 15)
$$

   Where:
   * $N_{\text{direct}}$ is the count of directly bound microservices ($d = 1$).
   * $N_{\text{transitive}}$ is the count of transitively dependent microservices ($d \ge 2$).
   * $I_{\text{prod}} \in \{0, 1\}$ is $1$ if `environment.is_production == true`, else $0$.
   * $I_{\text{secret\_or\_conn}} \in \{0, 1\}$ is $1$ if the change rotates a secret or modifies infrastructure connection metadata, else $0$.

   * Maps $\text{RiskScore}$ to `RiskLevel`:
     * $\text{RiskScore} < 20 \rightarrow \text{\textbf{LOW}}$
     * $20 \le \text{RiskScore} < 50 \rightarrow \text{\textbf{MEDIUM}}$
     * $50 \le \text{RiskScore} < 80 \rightarrow \text{\textbf{HIGH}}$
     * $\text{RiskScore} \ge 80 \rightarrow \text{\textbf{CRITICAL}}$

### 9.2 File & Function Breakdown (`internal/impact/`)

| File Path | Structs / Functions | Detailed Responsibilities |
| :--- | :--- | :--- |
| `internal/impact/domain.go` | Enum: `RiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)<br>Struct: `AffectedServiceNode` (`ServiceID`, `Slug`, `Name`, `OwnerTeamID`, `OwnerTeamName`, `Distance int`, `DependencyPath []string`, `AccessMode string`)<br>Struct: `AffectedTeamSummary` (`TeamID`, `TeamSlug`, `TeamName`, `ServiceSlugs []string`)<br>Struct: `ImpactReport` (`TargetType`, `TargetID`, `TargetName`, `EnvironmentID`, `EnvironmentSlug`, `IsProduction bool`, `DirectServices []AffectedServiceNode`, `TransitiveServices []AffectedServiceNode`, `AffectedTeams []AffectedTeamSummary`, `TotalAffectedServices int`, `RiskScore int`, `RiskLevel RiskLevel`, `ComputedAt time.Time`) | Defines the complete, JSON-serializable `ImpactReport` value object. This struct is both returned live to the UI preview endpoint and saved as an immutable `JSONB` snapshot (`impact_snapshot`) on `change_requests`. |
| `internal/impact/repository.go` & `postgres_repo.go` | `FindDirectBoundServices(ctx, envID, resourceID) ([]AffectedServiceNode, error)`<br>`FindTransitiveDependentServices(ctx, envID, seedServiceIDs []uuid.UUID, maxDepth int) ([]AffectedServiceNode, error)` | Executes the PostgreSQL graph queries joining `service_resource_bindings`, `service_dependencies`, `services`, and `teams`. |
| `internal/impact/analyzer.go` | Struct: `Analyzer`<br>Func: `NewAnalyzer(repo Repository, svcRepo service.Repository, resRepo resource.Repository, secRefRepo secretref.Repository, envRepo environment.Repository) *Analyzer`<br>Method: `ComputeImpact(ctx context.Context, input AnalyzeInput) (*ImpactReport, error)` | Orchestrates Steps 1–3 above, deduplicates services that appear in both direct and transitive paths (keeping the shortest distance $d$), aggregates affected teams, and computes `RiskScore` and `RiskLevel`. |

---

## 10. Sub-Phase 2.5: Change Request & Multi-Approver Governance Bounded Contexts (`change` & `approval`)

### 10.1 Change Request State Machine (`internal/change/statemachine.go`)

Every Change Request obeys a strict, deterministic state machine. Illegal transitions return `apperror.Conflict` (`409 Conflict`).

```
stateDiagram-v2
    [*] --> DRAFT : Create as Draft
    [*] --> PENDING_APPROVAL : Submit (RequiredApprovals >= 1)
    [*] --> APPROVED : Submit in Auto-Approve Env (RequiredApprovals == 0)

    DRAFT --> PENDING_APPROVAL : Submit (Computes Impact Snapshot)
    DRAFT --> CANCELLED : Requester Cancels

    PENDING_APPROVAL --> APPROVED : Approval Quorum Met (Approver != Requester)
    PENDING_APPROVAL --> REJECTED : Any Reviewer Rejects
    PENDING_APPROVAL --> CANCELLED : Requester Cancels

    APPROVED --> APPLYING : Authorized User Clicks Apply
    APPLYING --> APPLIED : Target Mutation + Audit + Outbox Commit
    APPLYING --> FAILED : SecretProvider or Validation Error

    APPLIED --> ROLLED_BACK : 1-Click Rollback Executed

```

### 10.2 Separation of Duties & Quorum Rules (`internal/approval/service.go`)

1. **No Self-Approval Invariant:** When `ApproveOrRejectChange(ctx, actor, changeID, decision, comment)` is called, the domain layer checks `if changeReq.RequestedBy == actor.UserID`. If true, it immediately rejects the call with `apperror.CodeSeparationOfDuties` (`403 Forbidden`, RFC 9457 type `https://iconfigly.dev/errors/separation-of-duties`), **even if the caller is a Super Admin** (unless the organization explicitly has only 1 active user in `development` mode).
2. **Quorum Evaluation:**
   * Each environment defines `required_approvals` (e.g., `DEV = 0`, `QA = 0`, `UAT = 1`, `PROD = 2`).
   * Furthermore, if `ImpactReport.RiskLevel == CRITICAL` and `environment.required_approvals < 2`, the policy engine automatically elevates `changeReq.RequiredApprovals` to `2`.
   * When an `APPROVED` decision is recorded in `approvals`, if `COUNT(APPROVED decisions) >= changeReq.RequiredApprovals`, the Change Request status transitions atomically from `PENDING_APPROVAL` $\rightarrow$ `APPROVED`.
   * If any authorized approver submits `decision == REJECTED` (with a mandatory non-empty `comment`), the Change Request status immediately transitions to `REJECTED`.

### 10.3 File & Function Breakdown (`internal/change/` & `internal/approval/`)

| File Path | Functions / Methods | Detailed Execution Flow & Transactional Guarantees |
| :--- | :--- | :--- |
| `internal/change/domain.go` | Struct: `ChangeRequest`<br>Struct: `ProposedChangePayload` (`ConfigMutations []KeyMutation`, `MetadataPatch map[string]any`, `RotateSecretRefID *uuid.UUID`)<br>Methods: `CanTransitionTo(next ChangeStatus) error`, `ValidateApprover(actorID uuid.UUID) error` | Encapsulates all domain invariants for a Change Request, ensuring `ProposedChangePayload` matches the declared `TargetType` (`SERVICE_CONFIG`, `RESOURCE_METADATA`, or `SECRET_ROTATION`). |
| `internal/change/service.go` | `PreviewImpact(ctx, actor, projectID, cmd) (*impact.ImpactReport, error)`<br>`CreateAndSubmit(ctx, actor, projectID, idempotencyKey, cmd) (*ChangeRequest, error)`<br>`RecordApprovalDecision(ctx, actor, projectID, changeID, decision, comment) (*ChangeRequest, error)`<br>`ApplyChangeRequest(ctx, actor, projectID, changeID) (*ChangeRequest, error)`<br>`RollbackChangeRequest(ctx, actor, projectID, changeID, reason) (*ChangeRequest, error)`<br>`CancelChangeRequest(ctx, actor, projectID, changeID) (*ChangeRequest, error)` | **`PreviewImpact`:** Requires `change.request`. Calls `impact.Analyzer.ComputeImpact` without writing to the database so the UI wizard can show live blast radius as the user fills out the form.<br>**`CreateAndSubmit`:** Checks `idempotency_key` first (returns existing record if already submitted). Computes fresh `ImpactReport`, determines `required_approvals` from the environment and risk level, and inside `txManager.WithTx`: inserts `change_requests` (`APPROVED` if `required_approvals == 0`, else `PENDING_APPROVAL`), writes `change.created` to `audit_logs`, and inserts `change.requested` into `outbox_events`.<br>**`ApplyChangeRequest`:** Requires `change.apply` permission at the target scope and `status == APPROVED`. Inside `txManager.WithTx`:<br>• If `SERVICE_CONFIG`: calls `configitem.Service.ApplyBatchMutations`.<br>• If `RESOURCE_METADATA`: calls `resource.Service.ApplyMetadataChange` (incrementing `resources.version`).<br>• If `SECRET_ROTATION`: calls `secretref.Service.ExecuteRotation` (which calls `SecretProvider.RotateSecret`).<br>• Marks `change_requests.status = APPLIED`, records `change.applied` in `audit_logs`, and enqueues `change.applied` (containing the full `impact_snapshot`) into `outbox_events` so all affected teams are notified!<br>**`RollbackChangeRequest`:** Verifies `status == APPLIED`. Restores the previous config version snapshot or resource metadata state as a new forward version, marks the original change request `ROLLED_BACK`, writes `change.rolled_back` to `audit_logs`, and enqueues `change.rolled_back` into `outbox_events`. |
| `internal/change/handler.go` | `HandlePreviewImpact`, `HandleCreateChange`, `HandleListChanges`, `HandleGetChange`, `HandleApproveOrReject`, `HandleApplyChange`, `HandleRollbackChange`, `HandleCancelChange` | Exposes REST routes under `/api/v1/projects/{projectID}/change-requests`. |

---

## 11. Sub-Phase 2.6: Time-Boxed Temporary Access Bounded Context (`access` Expansion)

### 11.1 How Time-Boxed Access Works

Instead of granting developers permanent access to `UAT` or `PROD` resources, Phase 2 extends `internal/access` with a complete **Time-Boxed Lease Lifecycle**:

```
stateDiagram-v2
    [*] --> PENDING : Developer Submits AccessRequest\n(e.g. VIEWER on payments-db in PROD for 120m)
    PENDING --> ACTIVE : Approver Approves (Approver != Requester)\nCreates role_bindings row with expires_at = NOW() + 120m
    PENDING --> REJECTED : Approver Rejects
    ACTIVE --> EXPIRED : ExpiryWorker Detects expires_at <= NOW()\nDeletes expired role_binding & notifies user
    ACTIVE --> REVOKED : Admin Clicks "Revoke Early"\nDeletes role_binding immediately

```

1. **Immediate Effect in `Authorizer.Can`:** Because Phase 1 designed `role_bindings` with an `expires_at TIMESTAMPTZ NULL` column and `Authorizer.Can` already filters `WHERE expires_at IS NULL OR expires_at > NOW()`, the moment an `AccessRequest` is approved and inserts a `role_bindings` row with `expires_at = NOW() + duration`, the developer immediately gains the requested permission across the platform!
2. **Zero-Lag Expiration:** Even before the background `ExpiryWorker` runs its 30-second cleanup sweep, the SQL query in `Authorizer.Can` stops matching the binding at the exact microsecond `NOW() > expires_at`. When `ExpiryWorker` runs, it transitions `access_requests.status` from `ACTIVE` $\rightarrow$ `EXPIRED`, removes the stale `role_bindings` row, records `access.expired` in `audit_logs`, and enqueues an `access.expired` notification in `outbox_events`.

### 11.2 File & Function Additions in `internal/access/`

| File Path | Added Structs / Functions | Detailed Execution Flow & Business Rules |
| :--- | :--- | :--- |
| `internal/access/domain.go` | Struct: `AccessRequest`<br>Enum: `AccessRequestStatus` (`PENDING`, `ACTIVE`, `REJECTED`, `EXPIRED`, `REVOKED`)<br>Method: `ValidateApproval(approverID uuid.UUID, now time.Time) error` | Enforces invariants: `DurationMinutes` must be between `15` and `1440` (15m to 24h), `Reason` must be at least 10 characters, and `approverID != RequesterUserID` (Separation of Duties). |
| `internal/access/service.go` | `RequestTemporaryAccess(ctx, actor, projectID, cmd) (*AccessRequest, error)`<br>`ReviewTemporaryAccess(ctx, actor, projectID, reqID, decision, comment) (*AccessRequest, error)`<br>`RevokeTemporaryAccess(ctx, actor, projectID, reqID, reason) (*AccessRequest, error)`<br>`ListAccessRequests(ctx, actor, projectID, filter) ([]*AccessRequest, error)`<br>`ExpireOverdueLeases(ctx, now time.Time) (int, error)` | **`RequestTemporaryAccess`:** Any authenticated organization member can request temporary access (`access.request`). Saves `AccessRequest` with `status = PENDING`, audits `access.requested`, and enqueues `access.requested` in `outbox_events`.<br>**`ReviewTemporaryAccess`:** Requires `access.approve` at the target scope AND `actor.UserID != req.RequesterUserID`. When approved, inside `txManager.WithTx`: computes `expiresAt = now.Add(duration)`, inserts a temporary `role_bindings` row (`ExpiresAt = &expiresAt`), links `role_binding_id` on `access_requests`, updates status to `ACTIVE`, audits `access.granted`, and enqueues `access.granted` in `outbox_events`.<br>**`ExpireOverdueLeases`:** Called periodically by `worker.ExpiryWorker`. Finds all `ACTIVE` requests where `expires_at <= now`, deletes their linked `role_binding_id`, sets `status = EXPIRED`, writes `access.expired` to `audit_logs` (`actor_type = SYSTEM`), and enqueues `access.expired` in `outbox_events`. |

---

## 12. Sub-Phase 2.7: Transactional Outbox, Background Workers & Notification Engine (`notification` & `worker`)

### 12.1 Recipient Resolution: Combining Blast-Radius Teams + Custom Notification Rules

When `OutboxWorker` processes an event (such as `change.applied` on `payments-db` in `UAT`), how does it decide **who** gets notified and **on which channels**?

1. **Automatic Blast-Radius Team Resolution (Zero Config Required):**
   * The worker inspects `payload.impact_snapshot.affected_teams` inside the `outbox_events` row.
   * Every member of every affected team (e.g., `Payments Team` and `Finance Team`), plus the requester, automatically receives an **In-App Notification** and an **Email Notification** summarizing the change, environment, version transition, and affected services.
2. **Custom `notification_rules` Evaluation:**
   * The worker also queries active `notification_rules` for the project where `event_type = ANY(event_types)` and `(environment_id IS NULL OR environment_id = event.environment_id)`.
   * Any additional `target_team_ids` (such as a `Security Team` rule watching all `PROD` secret rotations) are merged and deduplicated into the recipient set, and any configured `WEBHOOK` channels are triggered.

### 12.2 Reliable Outbox Polling & Retry Backoff (`internal/worker/outbox_worker.go`)

```
flowchart TD
    Tick(["Ticker Fires Every 2s"])
    Claim["WithTx: SELECT id, event_type, payload, attempts\nFROM outbox_events\nWHERE status = 'PENDING' AND next_attempt_at <= NOW()\nORDER BY created_at ASC LIMIT 20\nFOR UPDATE SKIP LOCKED"]
    Empty{"Any Rows\nClaimed?"}
    Process["For Each Event:\n1. Resolve Blast-Radius Teams + Matching NotificationRules\n2. Insert In-App Notifications\n3. Send SMTP Emails (Mailpit)\n4. Dispatch Signed HTTP Webhooks (HMAC-SHA256)"]
    Success{"All Channels\nSucceeded?"}
    MarkDone["UPDATE outbox_events\nSET status = 'DELIVERED', processed_at = NOW()"]
    CheckMax{"attempts + 1 >=\nmax_attempts (5)?"}
    DeadLetter["UPDATE outbox_events\nSET status = 'DEAD_LETTER', last_error = err"]
    Backoff["Compute Exponential Backoff:\nnext_attempt_at = NOW() + (2^attempts * 5s)\nUPDATE outbox_events SET attempts = attempts + 1"]

    Tick --> Claim
    Claim --> Empty
    Empty -->|"No"| Tick
    Empty -->|"Yes"| Process
    Process --> Success
    Success -->|"Yes"| MarkDone
    Success -->|"No"| CheckMax
    CheckMax -->|"Yes"| DeadLetter
    CheckMax -->|"No"| Backoff

```

* **Exponential Backoff Formula:** When an SMTP server or external webhook endpoint returns a transient error (`5xx` or network timeout), `attempts` is incremented and `next_attempt_at` is scheduled using:

$$
\Delta t_{\text{backoff}} = 5\text{ seconds} \times 2^{\text{attempts}} \quad (\text{i.e., } 5\text{s}, 10\text{s}, 20\text{s}, 40\text{s}, 80\text{s})
$$

* **HMAC-SHA256 Webhook Signing (`internal/notification/webhook.go`):**
  * Decrypts `rule.WebhookSecretEncrypted` in memory using `EnvelopeCipher.Decrypt`.
  * Computes $\text{Signature} = \text{HMAC-SHA256}(\text{secret}, \text{timestamp} \parallel \text{"."} \parallel \text{json\_body})$.
  * Sends HTTP `POST` with headers `Content-Type: application/json`, `X-Iconfigly-Event: <event_type>`, `X-Iconfigly-Delivery: <outbox_id>`, `X-Iconfigly-Timestamp: <unix_ts>`, and `X-Iconfigly-Signature-256: sha256=<hex_digest>` with a 5-second request timeout.

---

## 13. Sub-Phase 2.8: Server Wiring & Worker Process Orchestration (`cmd/server`, `cmd/worker`, `internal/server`)

### 13.1 Dual-Mode Worker Execution

To keep local Docker Compose development fast and lightweight while supporting horizontal scaling in production:

| File Path | Action | Responsibility |
| :--- | :--- | :--- |
| `iconfigly-api/cmd/server/main.go` | **Update** | When `cfg.RunEmbeddedWorker == true` (the default in `compose.yaml`), starts `outboxWorker.Start(ctx)` and `expiryWorker.Start(ctx)` as background goroutines tied to the OS signal context (`SIGINT` / `SIGTERM`). When the server shuts down, both the HTTP server and the background workers drain in-flight jobs cleanly before `db.Close()`. |
| `iconfigly-api/cmd/worker/main.go` | **Create** | Standalone binary entrypoint that initializes `config`, `database.NewPostgres`, `EnvelopeCipher`, `MockProvider`, `OutboxWorker`, and `ExpiryWorker`, and blocks on `ctx.Done()`. Used in Phase 5 Kubernetes Helm deployments (`deployment-worker.yaml`) where API and Worker scale independently. |
| `iconfigly-api/internal/server/server.go` | **Update** | Instantiates `EnvelopeCipher`, `secretprovider.NewMockProvider()`, and all Phase 2 repositories, services, and handlers, mounting all Phase 2 routes onto the `http.ServeMux`. |

---

## 14. Sub-Phase 2.9: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 2)

### 14.1 Complete Phase 2 UI Screen & Component Specifications

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/projects/[projectId]/configs` | `app/(dashboard)/projects/[projectId]/configs/page.tsx` | **Configuration Manager & Diff Explorer:**<br>1. **Service & Environment Selector Bar:** Choose microservice and environment (`DEV`, `QA`, `UAT`, `PROD`).<br>2. **Key-Value Table (`ConfigKeyTable`):** Displays `config_key`, `value_type` badge, `current_value`, `v{N}` version badge, last updated timestamp, and `History / Diff` drawer button.<br>3. **Compare Environments Tab (`EnvComparisonMatrix`):** Side-by-side comparison of any two environments (e.g., `UAT` vs `PROD`), highlighting missing keys and value differences.<br>4. **Version Diff & 1-Click Rollback Modal (`ConfigDiffViewer`):** Compares any two historical versions (`v14` vs `v15`) with green/red line highlighting and a `Rollback to this Version` button (which opens or submits a rollback Change Request). |
| `/projects/[projectId]/changes` | `app/(dashboard)/projects/[projectId]/changes/page.tsx` | **Change Requests Queue:** Filterable tabs (`Pending Approval`, `Approved & Ready to Apply`, `Applied History`, `Rejected`). Each row shows Title, Target badge (`SERVICE_CONFIG`, `RESOURCE_METADATA`, `SECRET_ROTATION`), Environment badge, **Risk Level Badge** (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), Affected Services count badge, and Approval Quorum progress (`1 / 2 Approved`). |
| `/projects/[projectId]/changes/new` | `app/(dashboard)/projects/[projectId]/changes/new/page.tsx` | **Interactive Change Request Wizard with Live Blast-Radius Preview:**<br>• **Step 1 (Select Target & Environment):** Choose Environment and Target (Service Configs, Resource Metadata, or Secret Ref Rotation).<br>• **Step 2 (Define Proposed Changes):** Add/modify config keys, update resource connection host/port, or select secret rotation.<br>• **Live Blast-Radius Impact Panel (`BlastRadiusImpactCard`):** Automatically calls `POST /change-requests/preview-impact` and displays:<br>  – **Risk Badge & Score** (e.g., `HIGH RISK — Score 65`)<br>  – **Directly Affected Microservices** (e.g., `payment-service`, `refund-service`, `invoice-service`)<br>  – **Transitively Affected Downstream Callers** (e.g., `checkout-service` via HTTP)<br>  – **Affected Engineering Teams to be Notified** (e.g., `Payments Team`, `Finance Team`)<br>  – **Required Approvals Policy** (e.g., `Requires 1 approval from SERVICE_LEAD or ENV_ADMIN`). |
| `/projects/[projectId]/changes/[changeId]` | `app/(dashboard)/projects/[projectId]/changes/[changeId]/page.tsx` | **Change Request Detail & Governance Screen:**<br>1. **State Progress Header:** Visual stepper (`Submitted` $\rightarrow$ `Pending Approval` $\rightarrow$ `Approved` $\rightarrow$ `Applied`).<br>2. **Blast-Radius Snapshot Card:** Shows affected services and teams.<br>3. **Proposed Diff Card:** Shows before/after key-value diffs or secret rotation version transition (`v18` $\rightarrow$ `v19`).<br>4. **Approval Quorum & Separation-of-Duties Panel:** Lists recorded approvals/rejections. If the logged-in user is the requester, displays a clear informational lock banner: *"You requested this change. Separation of duties requires another authorized approver."*<br>5. **Action Footer:** `Approve`, `Reject`, `Apply Change Now`, or `1-Click Rollback` buttons depending on current state and user permissions. |
| `/projects/[projectId]/access/requests` | `app/(dashboard)/projects/[projectId]/access/requests/page.tsx` | **Temporary Time-Boxed Access Manager:**<br>1. **`Request Temporary Access` Modal:** Select Environment (`PROD`), Target Resource/Service (`payments-db`), Role (`VIEWER` or `DEVELOPER`), Duration preset (`30m`, `1h`, `2h`, `4h`, `8h`), and Business Reason.<br>2. **Active Leases Banner (`LeaseCountdownBadge`):** Shows active time-boxed grants with a live ticking countdown timer (`Expires in 01h 47m 12s`) and an admin `Revoke Immediately` button.<br>3. **Pending Approval Queue:** Allows leads/admins (`approver != requester`) to approve or reject pending access requests in one click. |
| `/notifications` & `/notifications/rules` | `app/(dashboard)/notifications/page.tsx`<br>`app/(dashboard)/notifications/rules/page.tsx` | **Notification Center & Rules Builder:**<br>1. **In-App Inbox (`/notifications`):** Displays chronological alerts (`⚠ Environment Change: payments-db rotated in UAT affecting 4 services`) with unread indicators and 1-click navigation to the Change Request.<br>2. **Notification Rules (`/notifications/rules`):** Create declarative rules (`WHEN: Secret Rotated or Config Changed in PROD -> THEN Notify: Security Team & DevOps Team via Email + Webhook`). |

---

## 15. Sub-Phase 2.10: Comprehensive Testing Strategy & Phase 2 Verification Checklist

### 15.1 Complete Phase 2 REST API Endpoint Catalog (Additions to Phase 1)

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/{projectID}/configs` | `config.read` | Lists active configuration items and current values for `?service_id=...&env_id=...`. |
| `GET` | `/api/v1/projects/{projectID}/configs/{configItemID}/versions` | `config.read` | Lists immutable version history (`v1..vN`) for a configuration key. |
| `GET` | `/api/v1/projects/{projectID}/configs/compare` | `config.read` | Compares all configuration keys of a service between `?base_env_id=...&compare_env_id=...`. |
| `GET` | `/api/v1/projects/{projectID}/secret-refs` | `catalog.read` | Lists secret reference URI pointers (`openbao://...`) and `version_hint` metadata (never returns secret values). |
| `POST` | `/api/v1/projects/{projectID}/secret-refs` | `catalog.write` | Registers a new `secret_ref` URI pointer on a Resource or Service. |
| `POST` | `/api/v1/projects/{projectID}/secret-refs/{secretRefID}/resolve` | `secretref.resolve` | Resolves the ephemeral secret value via `SecretProvider` for an authorized user/service and writes a `secret_ref.resolved` audit log. |
| `POST` | `/api/v1/projects/{projectID}/change-requests/preview-impact` | `change.request` | Computes and returns the live `ImpactReport` (affected services, teams, risk score) without saving to the database. |
| `GET` | `/api/v1/projects/{projectID}/change-requests` | `catalog.read` | Lists Change Requests filterable by `?env_id=`, `?status=`, and `?target_id=`. |
| `POST` | `/api/v1/projects/{projectID}/change-requests` | `change.request` | Submits a new Change Request (supports `Idempotency-Key` header), snapshots `ImpactReport`, and queues `change.requested` notification. |
| `GET` | `/api/v1/projects/{projectID}/change-requests/{changeID}` | `catalog.read` | Returns Change Request details, `ImpactReport` snapshot, proposed diffs, and `approvals` list. |
| `POST` | `/api/v1/projects/{projectID}/change-requests/{changeID}/decisions` | `change.approve` | Submits an `APPROVED` or `REJECTED` decision (enforcing `approver != requester`). |
| `POST` | `/api/v1/projects/{projectID}/change-requests/{changeID}/apply` | `change.apply` | Applies an `APPROVED` Change Request atomically, mutating configs/resources/secrets, auditing, and queuing `change.applied` notifications. |
| `POST` | `/api/v1/projects/{projectID}/change-requests/{changeID}/rollback` | `change.apply` | Rolls back an `APPLIED` Change Request by creating a new forward version restoring the prior state and notifying affected teams. |
| `POST` | `/api/v1/projects/{projectID}/change-requests/{changeID}/cancel` | `change.request` | Allows the requester or admin to cancel a `DRAFT` or `PENDING_APPROVAL` request. |
| `GET` | `/api/v1/projects/{projectID}/access-requests` | `catalog.read` | Lists temporary access requests and active time-boxed leases. |
| `POST` | `/api/v1/projects/{projectID}/access-requests` | `access.request` | Submits a request for temporary time-boxed access (`duration_minutes`, `requested_role`, `scope_type`, `scope_id`). |
| `POST` | `/api/v1/projects/{projectID}/access-requests/{reqID}/review` | `access.approve` | Approves or rejects a temporary access request (`approver != requester`), creating an expiring `role_binding` on approval. |
| `POST` | `/api/v1/projects/{projectID}/access-requests/{reqID}/revoke` | `access.manage` | Immediately revokes an active temporary access lease before its scheduled expiration. |
| `GET` | `/api/v1/projects/{projectID}/notification-rules` | `catalog.read` | Lists configured notification routing rules for the project. |
| `POST` | `/api/v1/projects/{projectID}/notification-rules` | `access.manage` | Creates a notification rule (encrypting any `webhook_secret` via `EnvelopeCipher`). |
| `DELETE` | `/api/v1/projects/{projectID}/notification-rules/{ruleID}` | `access.manage` | Deletes a notification rule. |
| `GET` | `/api/v1/notifications` | Authenticated | Lists the current user's In-App notifications (`?unread_only=true`) and unread count. |
| `PATCH` | `/api/v1/notifications/{notificationID}/read` | Authenticated | Marks an In-App notification as read. |
| `POST` | `/api/v1/notifications/read-all` | Authenticated | Marks all unread In-App notifications for the current user as read. |

### 15.2 Phase 2 Testing Matrix

| Test Layer | Target Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. Envelope Crypto & Config Diff Unit Tests** | `crypto_test.go`, `diff_test.go` | Verifies AES-256-GCM encryption/decryption and authentication tag tamper rejection; tests `ComputeKeyHistoryDiff`, `CompareServiceSnapshots`, and `CompareEnvironments` across `ADDED`, `MODIFIED`, `REMOVED`, and `UNCHANGED` keys; verifies rejection of secret-like key names (`DB_PASSWORD`) in plain `config_items`. |
| **2. Blast-Radius Impact Analyzer Tests** | `internal/impact/analyzer_test.go` | Tests direct service bindings ($d = 1$), multi-hop transitive callers ($d = 2..5$), cycle termination (`A -> B -> A` does not infinite-loop), affected team deduplication, and `RiskScore` $\rightarrow$ `RiskLevel` (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) thresholds. |
| **3. Change State Machine & Separation-of-Duties Tests** | `internal/change/statemachine_test.go`, `internal/approval/service_test.go` | Table-driven tests covering all valid and illegal state transitions; verifies `RequestedBy == ApproverUserID` is strictly rejected with `403 SEPARATION_OF_DUTIES`; verifies `Idempotency-Key` deduplication; verifies quorum auto-transition to `APPROVED`. |
| **4. Outbox & Expiry Worker Integration Tests** | `internal/worker/worker_test.go` | Runs against PostgreSQL 18 to verify `FOR UPDATE SKIP LOCKED` prevents duplicate processing under concurrent workers, tests exponential backoff on simulated webhook failure, and verifies `ExpiryWorker` automatically transitions overdue `access_requests` to `EXPIRED` and removes their `role_bindings`. |
| **5. End-to-End Browser Tests (Playwright)** | `iconfigly-web/e2e/phase2-change-safety.spec.ts` | Automates the full Centerpiece Portfolio Story in a headless browser, including verifying email arrival via Mailpit's REST API (`http://localhost:8025/api/v1/messages`). |

### 15.3 End-to-End Phase 2 Demo Scenario & Definition of Done Checklist

To mark Phase 2 100% complete, the following end-to-end centerpiece workflow must execute cleanly on top of the Phase 1 foundation:

* [ ] **Step 1 (Migrations & Mailpit):** Running `docker compose up -d` starts `mailpit` on port `8025`, and running the `migrate` tool profile applies migrations `000010` through `000015` with zero errors.
* [ ] **Step 2 (Multi-Service Shared Resource Topology):** In Project `Core Banking`, register three additional services (`refund-service` owned by `Payments Team`, `invoice-service` owned by `Finance Team`, and `checkout-service` owned by `Storefront Team`). Bind `payment-service`, `refund-service`, and `invoice-service` to `payments-db` in `UAT`, and add a service dependency `checkout-service` $\rightarrow$ `payment-service` in `UAT`.
* [ ] **Step 3 (Secret Ref & Versioned Configs):** Attach secret reference `openbao://secret/uat/payments-db#password` (`version_hint = 1`) to `payments-db` in `UAT`, and add configuration keys `LOG_LEVEL=info` and `PAYMENT_RETRY_COUNT=3` (`v1`) to `payment-service` in `UAT`.
* [ ] **Step 4 (Live Blast-Radius Impact Analysis):** Log in as `Alice` (DevOps / Requester) and open the Change Request Wizard to rotate the `payments-db` secret reference in `UAT`. Before clicking Submit, the **Blast-Radius Impact Preview** automatically calculates and displays: **3 Directly Affected Services** (`payment-service`, `refund-service`, `invoice-service`), **1 Transitively Affected Service** (`checkout-service`), **3 Affected Teams** (`Payments Team`, `Finance Team`, `Storefront Team`), and `Risk Level: HIGH`.
* [ ] **Step 5 (Separation of Duties & Approval):** Alice submits Change Request `#1` (`status = PENDING_APPROVAL`). When Alice tries to click `Approve` on her own request, the platform blocks her (`403 Separation of Duties`). Log in as `Bob` (`Payments Team Lead`) and approve Change Request `#1` (`status = APPROVED`).
* [ ] **Step 6 (Apply Change & Automated Multi-Channel Notification):** Alice clicks `Apply Change`. The secret reference version increments (`v1` $\rightarrow$ `v2`), `payments-db` version increments, and within 2 seconds `OutboxWorker` delivers In-App notifications to all members of `Payments Team`, `Finance Team`, and `Storefront Team` AND sends formatted blast-radius emails visible in **Mailpit** (`http://localhost:8025`).
* [ ] **Step 7 (Config Diff & 1-Click Rollback):** Update `PAYMENT_RETRY_COUNT` on `payment-service` from `3` (`v1`) to `10` (`v2`). Open the Config Diff Viewer to inspect the side-by-side diff (`3` $\rightarrow$ `10`), click `Rollback to v1`, and verify that `v3` (`rollback_from_version = 1`, value `3`) is created and audited.
* [ ] **Step 8 (Time-Boxed Temporary Access Lease):** Log in as `Charlie` (a developer with no `PROD` access). Verify `PROD` resource access is denied (`403`). Submit a Temporary Access Request for `VIEWER` on `payments-db` in `PROD` for `15 minutes`. Approve it as `Alice`. Verify Charlie can immediately view `payments-db` in `PROD` with a live countdown badge (`Expires in 14m 52s`), and that clicking `Revoke Immediately` (or waiting for expiry) immediately restores the `403 Forbidden` block and logs `access.revoked` / `access.expired` in the immutable audit trail.
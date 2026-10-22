# iconfigly — Phase 6 Engineering Blueprint: Enterprise Identity (OIDC/SSO), GitHub Repository & CI Sync, Argo CD GitOps Correlation & ChatOps Notifications

> **Document Scope:** Phase 6 Complete Engineering Plan (Sub-Phase 6.0 to Sub-Phase 6.7)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Ports & Adapters (Hexagonal) + Federated Identity (OIDC/PKCE) + Event-Driven Webhook Ingestion
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; building enterprise OIDC authentication, webhook signature verification, and DevOps ecosystem integrations in Go from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution with local OIDC provider, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 6 Executive Summary & Scope](#1-phase-6-executive-summary--scope)
2. [OIDC/SSO, Inbound Webhooks & GitOps Primer for Full-Stack Engineers](#2-oidcsso-inbound-webhooks--gitops-primer-for-full-stack-engineers)
3. [Phase 6 Architectural Decisions & Rationale (ADRs)](#3-phase-6-architectural-decisions--rationale-adrs)
4. [Phase 6 DDD Bounded Contexts & Integration Sequence Flows](#4-phase-6-ddd-bounded-contexts--integration-sequence-flows)
5. [Complete Phase 6 Folder & File Evolution Across Repositories](#5-complete-phase-6-folder--file-evolution-across-repositories)
6. [Sub-Phase 6.0: Containerized Local OIDC Provider (`dex`) & Infrastructure Updates (`iconfigly-infra`)](#6-sub-phase-60-containerized-local-oidc-provider-dex--infrastructure-updates-iconfigly-infra)
7. [Sub-Phase 6.1: Relational Data Model & Database Migrations (`000022`–`000024`)](#7-sub-phase-61-relational-data-model--database-migrations-000022000024)
8. [Sub-Phase 6.2: Enterprise OIDC/SSO Authentication, PKCE & JIT Team Mapping (`internal/auth`)](#8-sub-phase-62-enterprise-oidcsso-authentication-pkce--jit-team-mapping-internalauth)
9. [Sub-Phase 6.3: External Integrations Bounded Context & GitHub Repository/CI Sync (`internal/integration`)](#9-sub-phase-63-external-integrations-bounded-context--github-repositoryci-sync-internalintegration)
10. [Sub-Phase 6.4: Argo CD GitOps Sync Status & Unified Delivery Correlation (`internal/integration/argocd.go`)](#10-sub-phase-64-argo-cd-gitops-sync-status--unified-delivery-correlation-internalintegrationargocdgo)
11. [Sub-Phase 6.5: Rich ChatOps Notification Adapters — Slack Block Kit & MS Teams (`internal/notification`)](#11-sub-phase-65-rich-chatops-notification-adapters--slack-block-kit--ms-teams-internalnotification)
12. [Sub-Phase 6.6: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 6)](#12-sub-phase-66-nextjs-web-dashboard-architecture--ui-iconfigly-web-phase-6)
13. [Sub-Phase 6.7: Comprehensive Testing Strategy & Phase 6 Verification Checklist](#13-sub-phase-67-comprehensive-testing-strategy--phase-6-verification-checklist)

---

## 1. Phase 6 Executive Summary & Scope

### 1.1 Phase 6 Objective

By the end of Phase 5, `iconfigly` operates as a complete Change-Safety Control Plane across Docker, CLI, polyglot SDKs, OpenBao, and Kubernetes (`iconfigly-operator`). However, in real-world engineering organizations, `iconfigly` does not exist in a vacuum—it sits alongside an **Enterprise Identity Provider** (Okta, Keycloak, Google Workspace, Microsoft Entra ID), **Source Control & CI** (GitHub Repositories, Pull Requests, GitHub Actions), **GitOps Deployment Controllers** (Argo CD), and **Team Chat** (Slack and Microsoft Teams).

Phase 6 connects `iconfigly` seamlessly into this enterprise DevOps ecosystem through four cohesive capabilities:

1. **Enterprise OIDC / Single Sign-On (SSO) & Just-In-Time (JIT) Team Provisioning:** Allows organizations to configure any OpenID Connect (OIDC) identity provider (`Keycloak`, `Dex`, `Okta`, `Entra ID`, `Google`). When an engineer signs in via SSO, `iconfigly` verifies the cryptographic ID Token, automatically creates or links their user account, and maps their OIDC `groups` claim (e.g., `["idp-payments-leads"]`) directly into `iconfigly` Team Memberships (`Payments Team` $\rightarrow$ `LEAD`)!
2. **GitHub Repository, CI Status & `iconfigly.yaml` Catalog Sync:** Connects microservices in `iconfigly` to their GitHub repositories via REST API and verified inbound HMAC-SHA256 webhooks (`push`, `pull_request`, `workflow_run`). The Single-Pane Service Context screen now displays the latest commit SHA, commit author, open PR count, live GitHub Actions CI status (`PASSING` / `FAILING`), and supports syncing service metadata and resource bindings declaratively from a repo-root `iconfigly.yaml` file.
3. **Argo CD GitOps Application Sync Visibility:** Integrates with Argo CD so each `(service, environment)` view shows both **GitOps Manifest Sync State** (`Synced` / `OutOfSync`, `Healthy` / `Degraded` from Argo CD) alongside **Runtime Configuration & Secret State** (`IN_SYNC` / `DRIFTED` from `iconfigly-operator` and SDK heartbeats).
4. **Rich ChatOps Notifications (Slack Block Kit & Microsoft Teams Adaptive Cards):** Extends the Transactional Outbox notification engine (`OutboxWorker`) with dedicated formatters for **Slack** and **Microsoft Teams**, delivering rich interactive cards with blast-radius summaries, risk badges, and direct deep-link action buttons (`Review & Approve Change`, `View Rollout Progress`).

### 1.2 The Unified "Code $\rightarrow$ CI $\rightarrow$ GitOps $\rightarrow$ Config $\rightarrow$ Runtime" Story

With Phase 6 complete, opening `payment-service` in `UAT` inside `iconfigly-web` gives an engineer or Engineering Manager the complete end-to-end operational picture in one screen:

$$
\text{GitHub Code \& CI (Passing)} \longrightarrow \text{Argo CD GitOps (Synced)} \longrightarrow \text{iconfigly Config \& OpenBao Secrets (v15)} \longrightarrow \text{K8s Pods \& SDK Fleet (3/3 Ready)}
$$

### 1.3 Repository Status in Phase 6

| Repository | Phase 6 Status | Role in Phase 6 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds lightweight `dex` (CNCF OpenID Connect Identity Provider) container to `compose.yaml` pre-seeded with test SSO users and groups for 100% local $\$0$ OIDC testing. |
| **`iconfigly-api`** | **Active** | Adds migrations `000022`–`000024`, OIDC/PKCE authentication & JIT group mapper (`internal/auth`), External Integrations bounded context (`internal/integration` for GitHub, `iconfigly.yaml` parser, and Argo CD), and ChatOps formatters (`internal/notification/chatops.go`). |
| **`iconfigly-web`** | **Active** | Adds `"Continue with SSO"` login flow, SSO & Group Mapping Admin UI, GitHub Commit/CI/PR badges on Service Context, `Sync from iconfigly.yaml` button, Argo CD GitOps status badge, and Slack/Teams Rule Builder. |
| **`iconfigly-cli`** | **Active** | Adds `iconfigly login --sso` (browser-assisted device/callback login) and `iconfigly catalog validate -f iconfigly.yaml` to validate repo descriptors in CI. |
| **`iconfigly-docs`** | **Active** | Phase 6 engineering blueprint, OIDC setup guide, and `iconfigly.yaml` specification. |
| **`iconfigly-sdk-js` / `go` / `java` & `operator`** | **Active (Phases 4–5)** | Unchanged; continue reporting runtime telemetry and K8s reconciliation state. |

### 1.4 Scope Boundaries for Phase 6

| In Scope for Phase 6 | Out of Scope for Phase 6 (Deferred to Later Phases) |
| :--- | :--- |
| Standards-compliant OIDC Authorization Code Flow with PKCE (`S256`), JWKS signature verification, JIT user creation, and IdP Group $\rightarrow$ `iconfigly` Team mapping | Full SCIM 2.0 background directory push provisioning (optional enterprise extension) |
| Local CNCF `dex` OIDC container in `compose.yaml` for zero-cloud-account SSO testing | Prometheus `/metrics` scraping, Grafana dashboards, OpenTelemetry tracing, and `k6` load testing (Phase 7) |
| GitHub integration: outbound REST client + inbound HMAC-SHA256 webhook receiver (`push`, `pull_request`, `workflow_run`) + declarative `iconfigly.yaml` catalog sync | Automated GHCR multi-arch container publishing and GoReleaser public release pipelines (Phase 8) |
| Argo CD integration: application sync/health status polling & webhook ingestion per `(service, environment)` | Freeze-window Policy Engine and guardrailed AI incident/drift summarizer (Phase 9) |
| Rich Slack Block Kit and Microsoft Teams Adaptive Card adapters in `internal/notification` | |

---

## 2. OIDC/SSO, Inbound Webhooks & GitOps Primer for Full-Stack Engineers

### 2.1 How OpenID Connect (OIDC) & PKCE Work (Step-by-Step)

When a company uses Okta, Keycloak, or Google Workspace, employees do not want a separate password for every internal tool. **OpenID Connect (OIDC)** is an identity layer built on top of OAuth 2.0:

1. **Discovery (`.well-known/openid-configuration`):** Every OIDC provider publishes a JSON document at `<issuer_url>/.well-known/openid-configuration` listing its `authorization_endpoint`, `token_endpoint`, and `jwks_uri` (the public cryptographic keys used to verify tokens).
2. **PKCE (Proof Key for Code Exchange) & `state`:** When a user clicks **"Sign in with SSO"**, `iconfigly-api` generates:
   * A random `state` token (prevents Cross-Site Request Forgery).
   * A random `code_verifier` secret and its SHA-256 hash `code_challenge = BASE64URL(SHA256(code_verifier))`.
   * It stores `(state, nonce, code_verifier)` in PostgreSQL (`oidc_auth_states` with a 10-minute expiry) and redirects the browser to the Identity Provider.
3. **Callback & Token Exchange:** After the user logs into the Identity Provider, the browser is redirected back to `GET /api/v1/auth/oidc/{slug}/callback?code=...&state=...`. `iconfigly-api` verifies `state` in PostgreSQL, sends the `code` + `code_verifier` to the Identity Provider's `token_endpoint` over a backend-to-backend HTTP POST, and receives a signed **ID Token (JWT)** containing the user's `sub` (unique subject ID), `email`, `name`, and `groups`.
4. **JIT (Just-In-Time) Provisioning & Session Issuance:** `iconfigly-api` verifies the ID Token's RS256/ES256 signature against the provider's `jwks_uri`, creates or updates the `users` row, syncs their `team_members` roles based on `oidc_group_mappings`, and issues our standard revocable PostgreSQL `iconfigly_session` cookie!

### 2.2 Outbound vs. Inbound Webhooks

* **Outbound Webhooks (Built in Phase 2, Expanded in Phase 6):** `iconfigly` is the *sender*. When a Change Request is requested or applied, `OutboxWorker` sends an HTTP POST to Slack, Microsoft Teams, or a custom URL.
* **Inbound Webhooks (New in Phase 6):** `iconfigly` is the *receiver*. When a developer pushes a commit or a GitHub Actions CI workflow finishes on `payment-service`, GitHub sends an HTTP POST to `POST /api/v1/webhooks/github/{integrationID}` with header `X-Hub-Signature-256: sha256=...`. `iconfigly-api` verifies the HMAC-SHA256 signature using the decrypted webhook secret and updates the service's live commit and CI status in PostgreSQL!

---

## 3. Phase 6 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-049** | **OIDC / SSO Protocol & Session Unification** | **Authorization Code Flow + PKCE (`S256`) Producing Standard PostgreSQL `sessions` Cookie** | Using OIDC purely to authenticate the identity—and then minting the exact same revocable PostgreSQL `sessions` row (`HttpOnly` cookie + `csrf_token`) used by password login—means **zero changes** are required across our 60+ existing API handlers, RBAC authorizer, or Next.js API proxy! | **Passing raw external IdP JWTs directly to all API endpoints:** Makes instant session revocation impossible and couples every middleware to external IdP token lifetimes. |
| **ADR-050** | **Local Zero-Cost OIDC Provider** | **CNCF `dex` (`dexidp/dex:v2.41.1`) Container in `compose.yaml`** | `dex` is a lightweight ($< 30\text{ MB}$ RAM), CNCF-graduated OIDC provider that reads static test users and group claims (`payments-leads`, `devops-admins`) from a single YAML config file. Allows testing the entire OIDC + JIT group mapping flow locally offline at $\$0$ cost. | **Requiring an external Okta/Auth0 developer account:** Requires cloud signup, internet connectivity, and breaks reproducible offline testing. **Full Keycloak container:** Consumes $> 800\text{ MB}$ of JVM RAM for simple local testing. |
| **ADR-051** | **IdP Group-to-Team Synchronization** | **Declarative `oidc_group_mappings` Table Evaluated at Login (`JIT Sync`)** | Maps an external OIDC group string (e.g., `"okta-payments-lead"`) to an `iconfigly` `(team_id, team_role)`. Every time a user logs in via OIDC, their SSO-managed team memberships are reconciled atomically inside the login transaction. | **Manual team assignment after SSO login:** Forces admins to manually add every new employee to teams even though the company's IdP already knows their department/team. |
| **ADR-052** | **External Integration Credential Storage** | **Unified `external_integrations` Table Encrypted with `EnvelopeCipher` (AES-256-GCM)** | GitHub PATs/App tokens, webhook signing secrets, and Argo CD API tokens are encrypted via `internal/shared/crypto/EnvelopeCipher` (`ICONFIGLY_MASTER_KEY`) before being stored in `config_encrypted BYTEA`, ensuring database backups never leak third-party API tokens. | **Storing GitHub or Argo CD tokens in plaintext `JSONB` columns:** Critical security vulnerability if database read access is compromised. |
| **ADR-053** | **GitHub Integration Architecture** | **Hybrid Inbound Webhook (`X-Hub-Signature-256`) + On-Demand REST Sync** | Inbound webhooks provide instant updates when commits or CI runs complete, while an on-demand `POST /services/{slug}/repo-sync` endpoint allows immediate synchronization on `localhost` even without a public webhook tunnel (like ngrok). | **Webhook-only architecture:** Difficult to test on a local laptop behind NAT without setting up external webhook forwarding tunnels. |
| **ADR-054** | **Catalog-as-Code (`iconfigly.yaml`)** | **Optional Repo-Root `iconfigly.yaml` Descriptor with Strict Schema Validation** | Allows engineering teams to keep service descriptions, runbook URLs, and non-secret dependency declarations alongside their source code in Git, while keeping environment approvals and secrets governed in the `iconfigly` control plane. | **Forcing 100% UI-only or 100% Git-only management:** Hybrid support gives platform teams the best of both worlds. |
| **ADR-055** | **ChatOps Notification Architecture** | **Native Slack Block Kit & Microsoft Teams Adaptive Card Builders inside `internal/notification`** | Both Slack Incoming Webhooks and Microsoft Teams Workflows accept rich JSON card payloads over standard HTTPS `POST`. Building deterministic JSON payload formatters directly into `internal/notification/chatops.go` delivers rich interactive alerts via the existing `OutboxWorker` with zero external SDK bloat. | **Plain-text webhook strings for Slack/Teams:** Hard to read during incidents and lacks clickable deep-link buttons to the Change Request. |
| **ADR-056** | **Argo CD GitOps Integration** | **Read-Only Application Status Connector + Inbound Argo CD Webhook Receiver** | Tracks Argo CD `sync.status` (`Synced` / `OutOfSync`), `health.status` (`Healthy` / `Degraded`), and `sync.revision` (Git SHA) per `(service_id, environment_id)`. Helps engineers distinguish between a *code deployment issue* (Argo CD degraded) and a *configuration issue* (`iconfigly` drift). | **Having `iconfigly` overwrite Argo CD Git manifests directly:** Violates GitOps separation of concerns between code deployment and runtime secret/config governance. |

---

## 4. Phase 6 DDD Bounded Contexts & Integration Sequence Flows

### 4.1 Phase 6 Bounded Context & External Ecosystem Map

```
flowchart TD
    subgraph ExternalEcosystem["Enterprise Identity, DevOps & ChatOps Ecosystem"]
        IdP["OIDC Identity Provider\n(Local CNCF Dex / Okta / Keycloak / Entra ID)"]
        GH["GitHub API & Webhooks\n(Commits, PRs, Actions CI, iconfigly.yaml)"]
        Argo["Argo CD Server\n(GitOps App Sync & Health Status)"]
        Chat["Slack & Microsoft Teams\n(Block Kit & Adaptive Card Webhooks)"]
    end

    subgraph ControlPlaneAPI["iconfigly-api (Go Modular Monolith)"]
        AuthOIDC["internal/auth (EXPANDED)\n(OIDC Discovery, PKCE Verifier & JIT Group Mapper)"]
        IntCtx["internal/integration (NEW)\n(GitHub Connector, iconfigly.yaml Parser, Argo CD Sync)"]
        NotifCtx["internal/notification (EXPANDED)\n(Slack Block Kit & MS Teams Adaptive Card Builders)"]
        CatCtx["internal/service + binding + team\n(Catalog & Team Membership Domain)"]
        Crypto["internal/shared/crypto\n(AES-256-GCM EnvelopeCipher)"]
    end

    subgraph Storage["PostgreSQL 18 Persistence"]
        PG[("PostgreSQL 18\n(oidc_providers, external_integrations,\nservice_repo_states, service_gitops_states)")]
    end

    IdP <-->|"1. OIDC Auth Code + PKCE\n& JWKS Verification"| AuthOIDC
    AuthOIDC -->|"JIT User & Team Sync"| CatCtx
    GH -->|"2. Inbound Signed Webhook\n(push / workflow_run)"| IntCtx
    IntCtx <-->|"3. Fetch Commits, CI & iconfigly.yaml"| GH
    IntCtx <-->|"4. Poll / Webhook App Sync State"| Argo
    IntCtx -->|"Upsert Service Metadata"| CatCtx
    IntCtx --> Crypto
    NotifCtx -->|"5. Rich Blast-Radius Cards\n(via OutboxWorker)"| Chat
    AuthOIDC --> PG
    IntCtx --> PG
```

### 4.2 Sequence Flow 1: OIDC Single Sign-On with PKCE & Just-In-Time (JIT) Team Provisioning

```
sequenceDiagram
    actor User as Engineer (Browser)
    participant Web as iconfigly-web
    participant API as iconfigly-api (internal/auth)
    participant Dex as OIDC Provider (Dex / Okta)
    participant DB as PostgreSQL 18

    User->>Web: 1. Click "Continue with Enterprise SSO (Dex)"
    Web->>API: GET /api/v1/auth/oidc/dex-local/authorize
    API->>API: Generate random state, nonce, PKCE code_verifier & S256 code_challenge
    API->>DB: INSERT INTO oidc_auth_states (state, nonce, code_verifier, expires_at = NOW() + 10m)
    API-->>User: 302 Redirect to Dex /auth?client_id=...&state=...&code_challenge=...&code_challenge_method=S256

    User->>Dex: 2. Authenticate at IdP (e.g. diana@acme.local)
    Dex-->>User: 302 Redirect to /api/v1/auth/oidc/dex-local/callback?code=xyz&state=...

    User->>API: 3. GET /api/v1/auth/oidc/dex-local/callback?code=xyz&state=...
    API->>DB: Lookup & Consume oidc_auth_states WHERE state = ... AND expires_at > NOW()
    API->>Dex: POST /token (grant_type=authorization_code, code=xyz, code_verifier=...)
    Dex-->>API: 200 OK (id_token JWT, access_token)
    API->>Dex: Verify JWT signature via cached JWKS + verify iss, aud, exp, nonce

    Note over API,DB: 4. Extract Claims: email="diana@acme.local", groups=["idp-payments-leads", "idp-qa"]
    API->>DB: WithTx: Upsert users + user_identities
    API->>DB: Match oidc_group_mappings -> Upsert team_members (Payments Team = LEAD, QA Team = MEMBER)
    API->>DB: Create Session + Write audit_logs (action="auth.oidc_login")
    API-->>User: Set HttpOnly Cookie (iconfigly_session) + 302 Redirect to /dashboard
```

### 4.3 Sequence Flow 2: GitHub Webhook / Sync & Declarative `iconfigly.yaml` Discovery

```
sequenceDiagram
    actor Dev as Developer (Git Push)
    participant GH as GitHub Repo (payment-service)
    participant IntSvc as integration.Service
    participant SvcDomain as service & binding Services
    participant DB as PostgreSQL 18

    Dev->>GH: 1. git push origin main (Updates code + iconfigly.yaml)
    GH->>IntSvc: 2. POST /api/v1/webhooks/github/{integrationID}\n(Header: X-Hub-Signature-256: sha256=...)
    IntSvc->>DB: Load external_integrations & decrypt webhook_secret via EnvelopeCipher
    IntSvc->>IntSvc: Verify constant-time HMAC-SHA256 signature over raw request body
    IntSvc->>DB: Upsert service_repo_states (last_commit_sha, commit_message, commit_author, ci_status)

    opt Push modified "iconfigly.yaml" (or User clicked "Sync from Repo")
        IntSvc->>GH: 3. GET /repos/{owner}/{repo}/contents/iconfigly.yaml
        GH-->>IntSvc: Raw YAML content
        IntSvc->>IntSvc: Parse & validate CatalogDescriptor schema (description, runbook_url, dependencies)
        IntSvc->>SvcDomain: 4. Reconcile Service Metadata & Declared Dependencies
        SvcDomain->>DB: WithTx: Update services & service_dependencies + Write audit_logs (action="service.synced_from_git")
    end
    IntSvc-->>GH: 202 Accepted
```

---

## 5. Complete Phase 6 Folder & File Evolution Across Repositories

### 5.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── .env                                      # [UPDATED] Adds ICONFIGLY_PUBLIC_URL and DEX_CLIENT_SECRET
├── .env.example                              # [UPDATED] Documents OIDC & local Dex variables
├── compose.yaml                              # [UPDATED] Adds dex service (dexidp/dex:v2.41.1 on port 5556)
└── dex/
    └── config.yaml                           # [NEW] Static OIDC issuer config with pre-seeded SSO users & group claims
```

### 5.2 `iconfigly-api` File Additions & Updates

```
iconfigly-api/
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds OIDC auth routes, /integrations/*, /webhooks/*, and GitOps endpoints
├── migrations/
│   ├── 000001..000021                        # Unchanged Phase 1–5 migrations
│   ├── 000022_create_oidc_providers_and_identities.up.sql
│   ├── 000022_create_oidc_providers_and_identities.down.sql
│   ├── 000023_create_external_integrations_and_repo_sync.up.sql
│   ├── 000023_create_external_integrations_and_repo_sync.down.sql
│   ├── 000024_expand_notification_channels_chatops.up.sql
│   └── 000024_expand_notification_channels_chatops.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # [UPDATED] Adds PublicBaseURL (default "http://localhost:3000") for OIDC redirect URIs & ChatOps deep links
    │   └── config_test.go                    # [UPDATED] Tests PublicBaseURL configuration
    ├── server/
    │   ├── server.go                         # [UPDATED] Wires OIDC routes, integration.Service, and public HMAC webhook receivers
    │   └── server_test.go                    # [UPDATED] Verifies Phase 6 route registration
    ├── access/
    │   ├── authorizer.go                     # [UPDATED] Adds integration.manage permission verb
    │   └── authorizer_test.go                # [UPDATED] Tests integration management permissions
    ├── auth/
    │   ├── domain.go                         # [UPDATED] Adds OIDCProvider, OIDCAuthState, UserIdentity, OIDCGroupMapping structs
    │   ├── oidc.go                           # [NEW] OIDC Discovery, PKCE challenge generator, JWKS RSA/ECDSA verifier, ID Token claims extractor
    │   ├── repository.go                     # [UPDATED] Adds persistence methods for oidc_providers, oidc_auth_states, user_identities, oidc_group_mappings
    │   ├── postgres_repo.go                  # [UPDATED] Implements SQL queries for OIDC tables and JIT team membership reconciliation
    │   ├── service.go                        # [UPDATED] Adds ConfigureOIDCProvider, StartOIDCLogin, CompleteOIDCCallback, ManageGroupMappings
    │   ├── handler.go                        # [UPDATED] Adds GET /auth/oidc/providers, GET /auth/oidc/{slug}/authorize, GET /auth/oidc/{slug}/callback, and admin CRUD
    │   └── oidc_test.go                      # [NEW] Unit tests with mock OIDC httptest server + RSA JWKS keypair testing PKCE & JIT group sync
    ├── integration/
    │   ├── domain.go                         # [NEW] ExternalIntegration, IntegrationType (GITHUB, ARGOCD), ServiceRepoState, ServiceGitOpsState, CatalogDescriptor
    │   ├── descriptor.go                     # [NEW] Parser & strict validator for repo-root iconfigly.yaml Catalog-as-Code files
    │   ├── github.go                         # [NEW] GitHub REST API client (commits, PRs, Actions runs, file fetch) & X-Hub-Signature-256 verifier
    │   ├── argocd.go                         # [NEW] Argo CD Application status client & webhook payload parser (Synced/OutOfSync, Healthy/Degraded)
    │   ├── repository.go                     # [NEW] IntegrationRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for external_integrations, service_repo_states, service_gitops_states
    │   ├── service.go                        # [NEW] CreateIntegration, SyncServiceGitHubState, HandleGitHubWebhook, SyncServiceArgoCDState, HandleArgoCDWebhook
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/integrations/*, /api/v1/webhooks/github/*, /api/v1/webhooks/argocd/*
    │   └── service_test.go                   # [NEW] Table-driven tests for GitHub HMAC verification, iconfigly.yaml parsing, and Argo CD status mapping
    └── notification/
        ├── domain.go                         # [UPDATED] Adds SLACK and MS_TEAMS to ChannelType enum
        ├── chatops.go                        # [NEW] Slack Block Kit and Microsoft Teams Adaptive Card JSON builders & HTTP dispatchers
        ├── service.go                        # [UPDATED] Dispatches SLACK and MS_TEAMS channels during ProcessPendingOutboxBatch
        └── chatops_test.go                   # [NEW] Unit tests verifying Slack Block Kit & MS Teams Adaptive Card structure and deep links
```

### 5.3 `iconfigly-web` File Additions & Updates

```
iconfigly-web/
└── src/
    ├── app/
    │   ├── (auth)/
    │   │   └── login/
    │   │       └── page.tsx                  # [UPDATED] Adds dynamic "Continue with <OIDC Provider>" SSO buttons alongside email/password login
    │   └── (dashboard)/
    │       ├── projects/
    │       │   └── [projectId]/
    │       │       └── services/
    │       │           └── [serviceSlug]/
    │       │               └── page.tsx      # [UPDATED] Adds GitHub Commit/PR/CI Card, "Sync iconfigly.yaml" action, and Argo CD GitOps Sync badge
    │       ├── notifications/
    │       │   └── rules/
    │       │       └── page.tsx              # [UPDATED] Adds Slack & Microsoft Teams channel selectors and "Send Test Card" button
    │       └── settings/
    │           ├── sso/
    │           │   └── page.tsx              # [NEW] OIDC Identity Providers configuration & IdP Group -> Team Mapping matrix
    │           └── integrations/
    │               └── page.tsx              # [UPDATED] Adds GitHub & Argo CD connection cards, webhook URL copy box & connectivity tester
    ├── features/
    │   ├── auth/
    │   │   ├── OidcProviderFormModal.tsx     # [NEW] Configure Issuer URL, Client ID, Client Secret, and Scopes
    │   │   └── GroupMappingTable.tsx         # [NEW] Map external IdP group claim (e.g. "payments-leads") to iconfigly Team & Role
    │   └── integrations/
    │       ├── ServiceGitHubCard.tsx         # [NEW] Displays Latest Commit SHA, Author, Open PRs, CI status badge & "Sync from Git" button
    │       ├── ServiceArgoCdCard.tsx         # [NEW] Displays Argo CD App Name, GitOps Sync Status, Health Status, and Revision SHA
    │       └── useIntegrations.ts            # [NEW] TanStack Query hooks for OIDC providers, GitHub repo state, and Argo CD status
    └── lib/
        └── types.ts                          # [UPDATED] Adds OIDCProvider, OIDCGroupMapping, ServiceRepoState, and ServiceGitOpsState interfaces
```

### 5.4 `iconfigly-cli` File Additions & Updates

```
iconfigly-cli/
└── internal/
    └── cmd/
        ├── login.go                          # [UPDATED] Adds --sso flag opening browser OIDC flow via localhost callback listener
        └── catalog.go                        # [NEW] iconfigly catalog validate -f iconfigly.yaml & iconfigly catalog sync -f iconfigly.yaml
```

---

## 6. Sub-Phase 6.0: Containerized Local OIDC Provider (`dex`) & Infrastructure Updates (`iconfigly-infra`)

### 6.1 Goal & Engineering Rationale

To test OpenID Connect Single Sign-On and Just-In-Time (JIT) Group-to-Team provisioning locally on Windows 11 + WSL2 without registering for any paid Okta or Auth0 cloud tenant, we add **Dex** (`dexidp/dex:v2.41.1`) to `iconfigly-infra/compose.yaml` with a static configuration file (`iconfigly-infra/dex/config.yaml`).

### 6.2 Exact File Specifications in `iconfigly-infra`

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-infra/dex/config.yaml` | **Create** | Configures Dex with:<br>• `issuer: http://localhost:5556/dex`<br>• In-memory/SQLite storage (`type: memory`)<br>• Static OAuth2 client: `id: iconfigly-web`, `secret: iconfigly-dex-secret`, `redirectURIs: ["http://localhost:3000/api/v1/auth/oidc/dex-local/callback"]`<br>• `enablePasswordDB: true` with 2 pre-seeded SSO test users including `groups` claims:<br>  1. `diana@acme.local` (Password: `password`, Groups: `["idp-payments-leads", "idp-qa-members"]`)<br>  2. `evan@acme.local` (Password: `password`, Groups: `["idp-devops-admins"]`) |
| `iconfigly-infra/compose.yaml` | **Update** | Adds the `dex` service (`image: dexidp/dex:v2.41.1`, `container_name: iconfigly-dex`), mounting `./dex/config.yaml:/etc/dex/config.docker.yaml:ro`, binding `127.0.0.1:5556:5556`, so both the Windows host browser (`http://localhost:5556/dex/auth`) and `iconfigly-api` (via internal/host alias) can complete the OIDC code exchange. |

---

## 7. Sub-Phase 6.1: Relational Data Model & Database Migrations (`000022`–`000024`)

### 7.1 Phase 6 Entity-Relationship Additions

Phase 6 adds **6 new tables** across migrations `000022` and `000023` (`oidc_providers`, `oidc_auth_states`, `user_identities`, `oidc_group_mappings`, `external_integrations`, `service_repo_states`, and `service_gitops_states`) and expands `notification_rules` in `000024`.

```
erDiagram
    organizations ||--o{ oidc_providers : "configures_sso"
    oidc_providers ||--o{ oidc_auth_states : "tracks_pkce_flow"
    oidc_providers ||--o{ user_identities : "authenticates"
    users ||--o{ user_identities : "links_external_sub"
    oidc_providers ||--o{ oidc_group_mappings : "maps_groups"
    teams ||--o{ oidc_group_mappings : "receives_jit_members"

    organizations ||--o{ external_integrations : "connects_devops_tools"
    services ||--o| service_repo_states : "tracks_github_ci"
    services ||--o{ service_gitops_states : "tracks_argocd_sync"
    environments ||--o{ service_gitops_states : "in_environment"
```

### 7.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

#### Migration `000022_create_oidc_providers_and_identities`

* **Table `oidc_providers`:** Stores OIDC Identity Provider configurations per organization.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `slug`: `TEXT NOT NULL` (e.g., `dex-local`, `okta-corp`, `keycloak-sso`)
  * `display_name`: `TEXT NOT NULL` (e.g., `Acme Corporate SSO`)
  * `issuer_url`: `TEXT NOT NULL` (e.g., `http://localhost:5556/dex`)
  * `internal_discovery_url`: `TEXT NOT NULL DEFAULT ''` (Optional internal Docker override URL, e.g., `http://dex:5556/dex`, when browser and container network hostnames differ in local dev!)
  * `client_id`: `TEXT NOT NULL`
  * `client_secret_encrypted`: `BYTEA NOT NULL` (Encrypted via `EnvelopeCipher`)
  * `scopes`: `TEXT[] NOT NULL DEFAULT '{openid,profile,email,groups}'`
  * `groups_claim`: `TEXT NOT NULL DEFAULT 'groups'`
  * `jit_provisioning_enabled`: `BOOLEAN NOT NULL DEFAULT TRUE`
  * `is_enabled`: `BOOLEAN NOT NULL DEFAULT TRUE`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (organization_id, slug)`.

* **Table `oidc_auth_states`:** Short-lived PKCE and CSRF state store during in-flight browser redirects.
  * `state`: `TEXT PRIMARY KEY` (32-byte random base64url string)
  * `provider_id`: `UUID NOT NULL REFERENCES oidc_providers(id) ON DELETE CASCADE`
  * `nonce`: `TEXT NOT NULL`
  * `code_verifier`: `TEXT NOT NULL` (PKCE S256 verifier)
  * `redirect_after_login`: `TEXT NOT NULL DEFAULT '/dashboard'`
  * `expires_at`: `TIMESTAMPTZ NOT NULL`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

* **Table `user_identities`:** Links an `iconfigly` `users` record to one or more external OIDC subject identifiers (`sub`).
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `provider_id`: `UUID NOT NULL REFERENCES oidc_providers(id) ON DELETE CASCADE`
  * `provider_subject`: `TEXT NOT NULL` (The immutable OIDC `sub` claim)
  * `provider_email`: `TEXT NOT NULL`
  * `raw_claims`: `JSONB NOT NULL DEFAULT '{}'::jsonb`
  * `last_login_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (provider_id, provider_subject)`, `UNIQUE (provider_id, user_id)`.

* **Table `oidc_group_mappings`:** Declarative rule mapping an external IdP group name to an `iconfigly` Team and Role.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `provider_id`: `UUID NOT NULL REFERENCES oidc_providers(id) ON DELETE CASCADE`
  * `external_group_name`: `TEXT NOT NULL` (e.g., `idp-payments-leads`)
  * `team_id`: `UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE`
  * `team_role`: `TEXT NOT NULL DEFAULT 'MEMBER' CHECK (team_role IN ('LEAD', 'MEMBER'))`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (provider_id, external_group_name, team_id)`.

#### Migration `000023_create_external_integrations_and_repo_sync`

* **Table `external_integrations`:** Stores organization/project-level connections to GitHub and Argo CD.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `integration_type`: `TEXT NOT NULL CHECK (integration_type IN ('GITHUB', 'ARGOCD'))`
  * `name`: `TEXT NOT NULL` (e.g., `Acme GitHub Org`, `UAT Argo CD Controller`)
  * `base_url`: `TEXT NOT NULL` (e.g., `https://api.github.com` or `https://argocd.internal`)
  * `auth_token_encrypted`: `BYTEA NULL` (Encrypted API token / PAT via `EnvelopeCipher`)
  * `webhook_secret_encrypted`: `BYTEA NULL` (Encrypted inbound webhook HMAC secret via `EnvelopeCipher`)
  * `status`: `TEXT NOT NULL DEFAULT 'CONNECTED' CHECK (status IN ('CONNECTED', 'DEGRADED', 'DISCONNECTED'))`
  * `last_synced_at`: `TIMESTAMPTZ NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

* **Table `service_repo_states`:** Caches the latest GitHub repository, commit, PR, and CI status for each microservice.
  * `service_id`: `UUID PRIMARY KEY REFERENCES services(id) ON DELETE CASCADE`
  * `integration_id`: `UUID NULL REFERENCES external_integrations(id) ON DELETE SET NULL`
  * `repo_full_name`: `TEXT NOT NULL` (e.g., `PathumSandeepa/payment-service`)
  * `default_branch`: `TEXT NOT NULL DEFAULT 'main'`
  * `latest_commit_sha`: `TEXT NOT NULL DEFAULT ''`
  * `latest_commit_message`: `TEXT NOT NULL DEFAULT ''`
  * `latest_commit_author`: `TEXT NOT NULL DEFAULT ''`
  * `latest_commit_url`: `TEXT NOT NULL DEFAULT ''`
  * `latest_commit_at`: `TIMESTAMPTZ NULL`
  * `ci_status`: `TEXT NOT NULL DEFAULT 'UNKNOWN' CHECK (ci_status IN ('UNKNOWN', 'PENDING', 'PASSING', 'FAILING'))`
  * `ci_workflow_url`: `TEXT NOT NULL DEFAULT ''`
  * `open_pr_count`: `INT NOT NULL DEFAULT 0`
  * `has_catalog_descriptor`: `BOOLEAN NOT NULL DEFAULT FALSE` (True if `iconfigly.yaml` was discovered in repo root)
  * `last_synced_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

* **Table `service_gitops_states`:** Tracks Argo CD GitOps sync and health state per `(service_id, environment_id)`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `integration_id`: `UUID NULL REFERENCES external_integrations(id) ON DELETE SET NULL`
  * `argocd_app_name`: `TEXT NOT NULL` (e.g., `payment-service-uat`)
  * `sync_status`: `TEXT NOT NULL DEFAULT 'Unknown' CHECK (sync_status IN ('Synced', 'OutOfSync', 'Unknown'))`
  * `health_status`: `TEXT NOT NULL DEFAULT 'Unknown' CHECK (health_status IN ('Healthy', 'Progressing', 'Degraded', 'Suspended', 'Missing', 'Unknown'))`
  * `synced_revision`: `TEXT NOT NULL DEFAULT ''` (Git commit SHA currently deployed by Argo CD)
  * `app_url`: `TEXT NOT NULL DEFAULT ''`
  * `last_reported_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints:* `UNIQUE (service_id, environment_id)`.

#### Migration `000024_expand_notification_channels_chatops`

* Alters `notification_rules` to add `chatops_webhook_url_encrypted BYTEA NULL` and validates channel values across `('IN_APP', 'EMAIL', 'WEBHOOK', 'SLACK', 'MS_TEAMS')`.

---

## 8. Sub-Phase 6.2: Enterprise OIDC/SSO Authentication, PKCE & JIT Team Mapping (`internal/auth`)

### 8.1 Standards-Compliant OIDC & JWKS Engine (`internal/auth/oidc.go`)

| Function / Method | Parameters & Return Types | Detailed Execution Flow & Security Invariants |
| :--- | :--- | :--- |
| `GeneratePKCEPair()` | None $\rightarrow$ `(verifier string, challenge string, err error)` | Generates 32 cryptographically random bytes via `crypto/rand`, encodes as base64url (`verifier`), and computes `challenge = base64.RawURLEncoding.EncodeToString(sha256(verifier))`. |
| `DiscoverProviderEndpoints(ctx, issuerURL, internalOverrideURL)` | `ctx`, `issuerURL`, `internalOverrideURL` $\rightarrow$ `(*OIDCDiscoveryDoc, error)` | Fetches `/.well-known/openid-configuration` (using `internalOverrideURL` if non-empty for container-to-container calls, while validating `issuer` against `issuerURL`). Caches discovery metadata in memory for 15 minutes. |
| `ExchangeAndVerifyIDToken(ctx, provider, code, stateRecord)` | `ctx`, `*OIDCProvider`, `code`, `*OIDCAuthState` $\rightarrow$ `(*VerifiedOIDCClaims, error)` | 1. Sends `POST` to `token_endpoint` with `grant_type=authorization_code`, `code`, `client_id`, decrypted `client_secret`, `redirect_uri`, and `code_verifier`.<br>2. Parses the JWT `id_token` header (`kid`, `alg`), fetches the provider's public RSA/ECDSA keys from `jwks_uri`, and verifies the cryptographic signature.<br>3. Verifies standard OIDC claims: `iss == provider.IssuerURL`, `aud == provider.ClientID`, `exp > time.Now()`, and `nonce == stateRecord.Nonce`.<br>4. Extracts `Subject`, `Email`, `FullName`, and `Groups []string` (reading the claim key configured in `provider.GroupsClaim`). |

### 8.2 Just-In-Time (JIT) User & Group-to-Team Reconciliation (`internal/auth/service.go`)

When `CompleteOIDCCallback` receives `VerifiedOIDCClaims`, it executes a single atomic transaction via `txManager.WithTx`:

1. **Identity & User Resolution:**
   * Queries `user_identities` by `(provider_id, claims.Subject)`.
   * If not found, queries `users` by `(organization_id, claims.Email)`. If a matching active user exists, links the new `user_identities` record to that user.
   * If no user exists and `provider.JITProvisioningEnabled == true`, creates a new `ACTIVE` `users` row (`password_hash = "OIDC_EXTERNAL_AUTH"`) and inserts `user_identities`.
2. **Declarative Group-to-Team Sync:**
   * Queries all `oidc_group_mappings` for `provider_id`.
   * For every mapping where `external_group_name` is present in `claims.Groups`, upserts `team_members` (`team_id`, `user_id`, `team_role`).
   * Because `role_bindings` in `iconfigly` can be granted directly to **Teams** (e.g., `Payments Team` has `SERVICE_LEAD` on `payment-service` and `VIEWER` on `UAT`), the newly logged-in SSO user immediately inherits all RBAC permissions of their mapped teams on their very first login!
3. **Session & Audit:**
   * Creates a standard row in `sessions` and writes `auth.oidc_login` (including matched `groups` and synced `teams`) to `audit_logs`.

---

## 9. Sub-Phase 6.3: External Integrations Bounded Context & GitHub Repository/CI Sync (`internal/integration`)

### 9.1 The Declarative `iconfigly.yaml` Catalog Descriptor (`internal/integration/descriptor.go`)

To support "Catalog-as-Code" (similar to Backstage's `catalog-info.yaml`, but tailored for change safety and resource bindings), repositories can optionally include an `iconfigly.yaml` file in their root directory:

| YAML Path in `iconfigly.yaml` | Type & Validation | How `iconfigly` Reconciles It |
| :--- | :--- | :--- |
| `apiVersion` | Must be `"iconfigly.dev/v1"` | Validated by `ParseAndValidateDescriptor`. |
| `kind` | Must be `"ServiceCatalog"` | Identifies the descriptor type. |
| `metadata.project` | `string` (Slug) | Verifies the target project slug (`core-banking`). |
| `metadata.service` | `string` (Slug) | Matches the target service slug (`payment-service`). |
| `metadata.ownerTeam` | `string` (Team Slug) | Verifies/updates `services.owner_team_id`. |
| `spec.description` & `spec.runbookUrl` | `string` | Updates `services.description` and `services.runbook_url`. |
| `spec.dependencies.services` | Array of `{ service: string, protocol: "HTTP" \| "GRPC" \| "KAFKA" }` | Automatically registers/updates directed `service_dependencies` edges across active environments so the Blast-Radius Impact Analyzer always has an up-to-date call graph! |

### 9.2 GitHub Client & Inbound Webhook Verification (`internal/integration/github.go`)

| Function / Method | Detailed Execution Flow |
| :--- | :--- |
| `VerifyGitHubWebhookSignature(rawBody []byte, signatureHeader string, secret []byte) bool` | Validates that `signatureHeader` starts with `"sha256="`, computes `hmac.New(sha256.New, secret)` over `rawBody`, and compares using `hmac.Equal` (constant-time comparison). |
| `HandleGitHubWebhook(ctx, integrationID, eventType, rawBody)` | Handles three GitHub webhook events:<br>1. **`push`:** Extracts `after` (commit SHA), `head_commit.message`, `head_commit.author.name`, and `head_commit.url`; updates `service_repo_states`. If `iconfigly.yaml` is in `head_commit.modified` or `added`, triggers descriptor reconciliation.<br>2. **`pull_request`:** Increments/decrements `open_pr_count` on `opened`, `closed`, or `reopened`.<br>3. **`workflow_run` / `check_suite`:** Maps `conclusion` (`success` $\rightarrow$ `PASSING`, `failure` $\rightarrow$ `FAILING`, `in_progress` $\rightarrow$ `PENDING`) and updates `ci_status` and `ci_workflow_url`. |
| `SyncServiceRepository(ctx, actor, projectID, serviceSlug)` | On-demand sync callable from the UI (`"Sync Now"` button). Queries the GitHub REST API (`/repos/{owner}/{repo}/commits/HEAD`, `/pulls?state=open`, `/actions/runs?per_page=1`, and `/contents/iconfigly.yaml`) and updates `service_repo_states` immediately. |

---

## 10. Sub-Phase 6.4: Argo CD GitOps Sync Status & Unified Delivery Correlation (`internal/integration/argocd.go`)

### 10.1 Bridging GitOps (`Argo CD`) and Config Governance (`iconfigly`)

In organizations using Argo CD, engineers often ask: *"Is `payment-service` failing in UAT because Argo CD hasn't synced the latest Helm chart, or because a config/secret in `iconfigly` drifted?"*

`internal/integration/argocd.go` provides two ways to update `service_gitops_states`:

1. **Inbound Argo CD Webhook / Notification (`POST /api/v1/webhooks/argocd/{integrationID}`):** Accepts webhook payloads from Argo CD Notifications whenever an Application's `status.sync.status` (`Synced` / `OutOfSync`) or `status.health.status` (`Healthy` / `Progressing` / `Degraded`) changes.
2. **On-Demand / Polled Argo CD API Sync (`SyncArgoCDAppState`):** Calls `GET /api/v1/applications/{appName}` on the configured Argo CD server using the decrypted bearer token and updates `sync_status`, `health_status`, and `synced_revision`.

---

## 11. Sub-Phase 6.5: Rich ChatOps Notification Adapters — Slack Block Kit & MS Teams (`internal/notification`)

### 11.1 ChatOps Payload Builders (`internal/notification/chatops.go`)

When `OutboxWorker` processes an `outbox_events` row and matches a `notification_rules` entry with channel `SLACK` or `MS_TEAMS`, it calls `chatops.go` to construct rich, structured messages:

| Formatter Function | Target Platform | Card Structure & Visual Elements |
| :--- | :--- | :--- |
| `BuildSlackBlockKitPayload(event OutboxEvent, publicBaseURL string) ([]byte, error)` | **Slack Incoming Webhook / App** | Renders a structured Slack `blocks` array:<br>1. **`header` Block:** Emoji + Event Title (e.g., `🚨 High-Risk Change Applied: Rotate payments-db in UAT`).<br>2. **`section` Fields Block:** 2-column grid showing **Environment** (`UAT`), **Risk Level** (`HIGH — Score 65`), **Actor** (`alice@acme.local`), and **Blast Radius** (`4 Services, 3 Teams`).<br>3. **`context` Block:** Lists affected service slugs (`payment-service`, `refund-service`, `invoice-service`, `checkout-service`).<br>4. **`actions` Block:** Interactive link button (`"View Change & Rollout Progress"`) pointing to `${publicBaseURL}/projects/${projectID}/changes/${changeID}`. |
| `BuildMSTeamsAdaptiveCardPayload(event OutboxEvent, publicBaseURL string) ([]byte, error)` | **Microsoft Teams Workflows / Incoming Webhook** | Renders a schema `1.5` Microsoft Teams `AdaptiveCard` attachment containing:<br>1. Colored `Container` header (`attention` red for `CRITICAL`/`HIGH`, `accent` blue for `INFO`).<br>2. `FactSet` array listing Environment, Target Resource/Service, Version Transition (`v18` $\rightarrow$ `v19`), Affected Services, and Affected Teams.<br>3. `Action.OpenUrl` button linking directly to the Change Request or Access Request in `iconfigly-web`. |

---

## 12. Sub-Phase 6.6: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 6)

### 12.1 Complete Phase 6 UI Screen & Component Specifications

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/login` | `app/(auth)/login/page.tsx` | **Enhanced Login Screen with Enterprise SSO:**<br>Queries `GET /api/v1/auth/oidc/providers` on mount. For each enabled OIDC provider (e.g., `Continue with Acme Corporate SSO`), renders a prominent SSO button above the standard email/password form. |
| `/settings/sso` | `app/(dashboard)/settings/sso/page.tsx` | **Enterprise SSO (OIDC) & JIT Group Mapping Console (`OidcProviderFormModal` & `GroupMappingTable`):**<br>1. **OIDC Providers Panel:** Add/edit OIDC providers (Issuer URL, Client ID, Client Secret, Scopes, JIT Provisioning toggle) and copy the exact Callback Redirect URI.<br>2. **Group-to-Team Mapping Table:** Add declarative rules: *"When OIDC claim `groups` contains `idp-payments-leads` $\rightarrow$ Assign to `Payments Team` as `LEAD`."* |
| `/settings/integrations` | `app/(dashboard)/settings/integrations/page.tsx` | **DevOps Integrations Hub (OpenBao + GitHub + Argo CD):**<br>Configure GitHub and Argo CD connections, generate/copy inbound webhook URLs (`/api/v1/webhooks/github/{id}`) and HMAC signing secrets, and click `Test Connectivity`. |
| `/projects/[projectId]/services/[serviceSlug]` | `app/(dashboard)/projects/[projectId]/services/[serviceSlug]/page.tsx` | **Unified Service Context View (`ServiceGitHubCard` & `ServiceArgoCdCard`):**<br>1. **GitHub Source & CI Card:** Shows linked repository (`PathumSandeepa/payment-service`), latest commit badge (`a8f29c1` by Alice), CI badge (`CI: PASSING` green), Open PRs (`2 Open PRs`), `iconfigly.yaml` detected badge, and a **`Sync from Git`** button.<br>2. **Argo CD GitOps Card:** Shows Argo CD Application (`payment-service-uat`), GitOps Sync Badge (`Synced` green / `OutOfSync` amber), Health Badge (`Healthy`), and deployed Git revision SHA. |
| `/notifications/rules` | `app/(dashboard)/notifications/rules/page.tsx` | **ChatOps Notification Rule Builder:**<br>Allows selecting `SLACK` and `MS_TEAMS` channels, entering the encrypted Slack/Teams webhook URL, and clicking **`Send Test Card`** to preview the formatted Block Kit / Adaptive Card message immediately. |

---

## 13. Sub-Phase 6.7: Comprehensive Testing Strategy & Phase 6 Verification Checklist

### 13.1 Complete Phase 6 REST API Endpoint Catalog (Additions to Phases 1–5)

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/auth/oidc/providers` | Public | Lists enabled OIDC providers (`slug`, `display_name`) for the `/login` screen. |
| `GET` | `/api/v1/auth/oidc/{slug}/authorize` | Public | Generates PKCE challenge & state, persists `oidc_auth_states`, and redirects browser to IdP. |
| `GET` | `/api/v1/auth/oidc/{slug}/callback` | Public | Exchanges OIDC auth code + PKCE verifier, validates JWKS signature, runs JIT user/team sync, and issues session cookie. |
| `POST` | `/api/v1/settings/oidc-providers` | `org.manage` | Registers a new OIDC provider (encrypting `client_secret` via `EnvelopeCipher`). |
| `POST` | `/api/v1/settings/oidc-providers/{id}/group-mappings` | `org.manage` | Creates an IdP Group $\rightarrow$ `iconfigly` Team/Role mapping rule. |
| `DELETE` | `/api/v1/settings/oidc-providers/{id}/group-mappings/{mapID}` | `org.manage` | Deletes a group mapping rule. |
| `GET` | `/api/v1/integrations` | `catalog.read` | Lists configured GitHub and Argo CD integrations (with secrets masked). |
| `POST` | `/api/v1/integrations` | `integration.manage` | Creates a GitHub or Argo CD integration (encrypting tokens & webhook secrets). |
| `POST` | `/api/v1/webhooks/github/{integrationID}` | Public (HMAC-SHA256 Verified) | Receives inbound GitHub `push`, `pull_request`, and `workflow_run` webhooks. |
| `POST` | `/api/v1/webhooks/argocd/{integrationID}` | Public (HMAC/Token Verified) | Receives inbound Argo CD application sync/health status webhooks. |
| `POST` | `/api/v1/projects/{projectID}/services/{serviceSlug}/repo-sync` | `catalog.write` | Triggers an immediate on-demand GitHub commit, CI, and `iconfigly.yaml` sync for a service. |
| `POST` | `/api/v1/projects/{projectID}/services/{serviceSlug}/gitops-sync` | `catalog.read` | Queries or updates Argo CD GitOps status for `?env={envSlug}`. |
| `POST` | `/api/v1/projects/{projectID}/notification-rules/{ruleID}/test` | `access.manage` | Dispatches a sample test notification card to verify Slack, MS Teams, or Webhook configuration. |

### 13.2 Phase 6 Testing Matrix

| Test Layer | Target Repository & Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. OIDC, PKCE & JWKS Unit Tests** | `iconfigly-api/internal/auth/oidc_test.go` | Spins up an in-memory mock OIDC `httptest.Server` with a generated 2048-bit RSA JWKS keypair; verifies PKCE `S256` challenge/verifier matching, expired/tampered `state` rejection, invalid JWT signature rejection, and JIT `oidc_group_mappings` reconciliation into `team_members`. |
| **2. GitHub HMAC & `iconfigly.yaml` Parser Tests** | `iconfigly-api/internal/integration/service_test.go` | Tests constant-time `X-Hub-Signature-256` validation (accepting valid HMAC, rejecting tampered body with `401`), parses valid/invalid `iconfigly.yaml` descriptors, and verifies automatic `service_dependencies` graph updates. |
| **3. ChatOps Block Kit & Adaptive Card Tests** | `iconfigly-api/internal/notification/chatops_test.go` | Verifies that `BuildSlackBlockKitPayload` and `BuildMSTeamsAdaptiveCardPayload` produce valid JSON schemas containing the exact blast-radius service counts, risk badge, and deep-link URLs, and verifies delivery via a mock webhook receiver. |
| **4. CLI Catalog Validator Tests** | `iconfigly-cli/internal/cmd/catalog_test.go` | Tests `iconfigly catalog validate -f iconfigly.yaml` exit codes (`0` on valid descriptor, `1` with line/field errors on invalid YAML). |
| **5. End-to-End Browser SSO & Integration Tests** | `iconfigly-web/e2e/phase6-sso-and-integrations.spec.ts` | Automates clicking `"Continue with Dex SSO"` in Playwright, logging in as `diana@acme.local` on container `dex:5556`, and verifying Diana is automatically created and added as a `LEAD` of `Payments Team`. |

### 13.3 End-to-End Phase 6 Demo Scenario & Definition of Done Checklist

To mark Phase 6 100% complete, the following end-to-end enterprise workflow must execute cleanly on your local Windows 11 + WSL2 Docker setup at $\$0$ cost:

* [ ] **Step 1 (Migrations `000022`–`000024` & Local `dex` OIDC Container):** Running `docker compose up -d` starts `iconfigly-dex` on port `5556`, and running `migrate` applies `000022` through `000024` with zero errors.
* [ ] **Step 2 (Configure OIDC Provider & Group Mappings):** Log in as Admin (`Alice`), open `/settings/sso`, register `dex-local` (`issuer: http://localhost:5556/dex`, `client_id: iconfigly-web`), and create a Group Mapping: `idp-payments-leads` $\rightarrow$ `Payments Team` (`LEAD`).
* [ ] **Step 3 (Zero-Touch SSO Login & JIT Team Provisioning):** Open an incognito browser window, visit `/login`, and click **`Continue with Acme Corporate SSO`**. Log into Dex as `diana@acme.local` (`password`). Verify that `iconfigly` completes the PKCE callback, creates Diana's user account automatically, assigns her as `LEAD` of `Payments Team`, and logs `auth.oidc_login` in the immutable audit trail!
* [ ] **Step 4 (GitHub Webhook & `iconfigly.yaml` Sync):** Simulate or send a signed GitHub `push` webhook payload (or run `iconfigly catalog sync -f iconfigly.yaml`) for `payment-service`. Verify that the `payment-service` Context page displays the latest commit SHA, `CI: PASSING` badge, and updates the service's runbook URL and downstream dependencies.
* [ ] **Step 5 (Argo CD GitOps Correlation):** Report or sync an Argo CD application status (`payment-service-uat` $\rightarrow$ `Synced`, `Healthy`, revision `a8f29c1`). Verify the Service Context view displays the unified status bar: **GitHub CI (`PASSING`) $\rightarrow$ Argo CD (`Synced / Healthy`) $\rightarrow$ Runtime Config (`v15 IN_SYNC`)**.
* [ ] **Step 6 (Rich Slack / MS Teams Blast-Radius Card):** Configure a Notification Rule for `UAT` with channel `SLACK` (pointing to a local webhook inspector or Slack channel) and click **`Send Test Card`** (or apply a Change Request). Verify the formatted Slack Block Kit card arrives with the Risk Score, Affected Services list, and clickable deep-link button.
# iconfigly — Phase 9 Engineering Blueprint: Declarative Policy-as-Code Engine, Change-Freeze Windows, Incident Lock-Down Mode & Guardrailed AI Troubleshooting

> **Document Scope:** Phase 9 Complete Engineering Plan (Sub-Phase 9.0 to Sub-Phase 9.7 — Final Phase of the 9-Phase Roadmap)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Declarative Policy-as-Code (OPA/CEL-inspired Deterministic Rules) + Zero-Secret-Exposure AI Guardrails
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; building enterprise compliance policy engines, incident freeze controls, entropy-based secret scanners, and safe AI copilot workflows in Go from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution with deterministic local rule engine + optional local `Ollama` container, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 9 Executive Summary & Scope](#1-phase-9-executive-summary--scope)
2. [Policy-as-Code, Freeze Windows, Incident Lock-Down & Safe AI Primer](#2-policy-as-code-freeze-windows-incident-lock-down--safe-ai-primer)
3. [Phase 9 Architectural Decisions & Rationale (ADRs)](#3-phase-9-architectural-decisions--rationale-adrs)
4. [Phase 9 DDD Bounded Contexts & Governance Sequence Flows](#4-phase-9-ddd-bounded-contexts--governance-sequence-flows)
5. [Complete Phase 9 Folder & File Evolution Across Repositories](#5-complete-phase-9-folder--file-evolution-across-repositories)
6. [Sub-Phase 9.0: Optional Local LLM Container (`ollama`) & Infrastructure Updates (`iconfigly-infra`)](#6-sub-phase-90-optional-local-llm-container-ollama--infrastructure-updates-iconfigly-infra)
7. [Sub-Phase 9.1: Relational Data Model & Database Migrations (`000027`–`000029`)](#7-sub-phase-91-relational-data-model--database-migrations-000027000029)
8. [Sub-Phase 9.2: Declarative Policy-as-Code Engine, Secret-Leak Scanner & Freeze Windows (`internal/policy`)](#8-sub-phase-92-declarative-policy-as-code-engine-secret-leak-scanner--freeze-windows-internalpolicy)
9. [Sub-Phase 9.3: Organization & Environment Incident Lock-Down Mode (`internal/incident`)](#9-sub-phase-93-organization--environment-incident-lock-down-mode-internalincident)
10. [Sub-Phase 9.4: Guardrailed AI Blast-Radius, Drift & Incident Summarizer (`internal/ai`)](#10-sub-phase-94-guardrailed-ai-blast-radius-drift--incident-summarizer-internalai)
11. [Sub-Phase 9.5: CLI Policy Linting & Incident Control Commands (`iconfigly-cli`)](#11-sub-phase-95-cli-policy-linting--incident-control-commands-iconfigly-cli)
12. [Sub-Phase 9.6: Next.js Policy Studio, Freeze Calendar, Incident Banner & AI Copilot UI (`iconfigly-web` Phase 9)](#12-sub-phase-96-nextjs-policy-studio-freeze-calendar-incident-banner--ai-copilot-ui-iconfigly-web-phase-9)
13. [Sub-Phase 9.7: Comprehensive Testing Strategy, REST API Catalog & Complete 9-Phase Master Checklist](#13-sub-phase-97-comprehensive-testing-strategy-rest-api-catalog--complete-9-phase-master-checklist)

---

## 1. Phase 9 Executive Summary & Scope

### 1.1 Phase 9 Objective

By the end of Phase 8 (`v1.0.0`), `iconfigly` is a complete, publicly packaged, and observable Change-Safety and Access Control Plane. Phase 9 (the final phase of the master roadmap, targeting `v1.1.0` Enterprise Governance) introduces four advanced capabilities that distinguish staff-level internal developer platforms in regulated industries (Fintech, Banking, Healthcare, E-Commerce):

1. **Declarative Policy-as-Code & Change-Freeze Windows (`internal/policy`):** In real enterprises, RBAC (*"Who is allowed to approve?"*) is only half of governance; the other half is **Policy** (*"What conditions must a change satisfy to be allowed right now?"*). Phase 9 adds a deterministic Policy Engine that evaluates every Change Request against organization and project policies:
   * **Scheduled Change-Freeze Windows:** Blocks non-emergency changes in `PROD` during Friday afternoons, holiday shopping peaks (Black Friday), or quarter-end financial closes unless accompanied by an explicit Break-Glass override.
   * **Blast-Radius & Runbook Guardrails:** E.g., *"Any change in `PROD` with `RiskLevel == CRITICAL` or affecting $\ge 4$ services must belong to a service that has a valid `runbook_url` and `CI == PASSING`."*
   * **Entropy & Pattern Secret-Leak Scanner:** Scans plain `config_items` values using Shannon entropy and regex signatures to stop developers from accidentally pasting raw AWS keys, JWTs, or database passwords into plain non-secret configuration fields!
2. **Incident Lock-Down Mode (`internal/incident`):** During a major production outage (`SEV1` / `SEV2`), uncoordinated configuration changes by well-meaning developers often worsen the incident. With one click (or CLI command `iconfigly incident lockdown`), an Incident Commander can place `PROD` (or the entire organization) into **Incident Lock-Down Mode**—freezing all normal Change Request applications while allowing only changes explicitly tagged with the active `incident_ticket_id`!
3. **Guardrailed AI Blast-Radius, Drift & Post-Mortem Summarizer (`internal/ai`):** Provides an opt-in, strictly guardrailed AI Copilot that explains complex multi-hop blast radius paths, diagnoses why an instance drifted after a deployment, and drafts post-incident review timelines. Crucially, `internal/ai` is architected with **Zero Secret Access by Design**: it never imports `secretprovider`, strips high-entropy strings via `PromptSanitizer`, audits every prompt hash in `ai_analysis_audits`, and works 100% offline at $\$0$ cost via a built-in **Deterministic Heuristic Summarizer** or a local **Ollama** container.

### 1.2 Repository Status in Phase 9

| Repository | Phase 9 Status | Role in Phase 9 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds optional `ollama` local LLM service under `--profile ai` in `compose.yaml` for zero-cost offline AI testing. |
| **`iconfigly-api`** | **Active** | Adds migrations `000027`–`000029`, `internal/policy` (policy evaluator, freeze window matcher, Shannon entropy secret scanner), `internal/incident` (incident lock-down state machine), and `internal/ai` (prompt sanitizer, heuristic + LLM providers, audit logger). |
| **`iconfigly-web`** | **Active** | Adds the global **Active Incident Lock-Down Banner**, the **Policy Studio & Freeze Window Calendar** (`/settings/policies`), Policy Check Badges on Change Requests, and the **Guardrailed AI Insight Drawer** on Change Requests and Service Drift views. |
| **`iconfigly-cli`** | **Active** | Adds `iconfigly policy check`, `iconfigly incident lockdown`, and `iconfigly incident resolve` commands for on-call SREs and CI pipelines. |
| **`iconfigly-docs`** | **Active** | Phase 9 engineering blueprint, Policy-as-Code reference, and AI security architecture guide. |
| **`iconfigly-sdk-*` & `operator`** | **Active (Phases 4–5)** | Unchanged; respect control-plane lock-down states automatically. |

### 1.3 Scope Boundaries for Phase 9

| In Scope for Phase 9 | Explicit Non-Goals (Never Built) |
| :--- | :--- |
| Deterministic Policy-as-Code engine (`HARD_MANDATORY`, `SOFT_MANDATORY`, `ADVISORY`) evaluated on Change Request preview, submission, and apply | Giving any AI/LLM component read access to `OpenBaoProvider` or resolved secret values (strictly forbidden by architecture) |
| Scheduled and recurring Change-Freeze Windows (`starts_at`, `ends_at`, `cron_schedule`) with Break-Glass override support | Autonomous AI agents that automatically mutate or apply production changes without human approval |
| Shannon entropy + regex Pre-Commit Secret Scanner blocking raw credentials in plain `config_items` | Paid cloud-only AI dependencies (must run 100% free and offline by default) |
| 1-Click `SEV1`/`SEV2` Incident Lock-Down Mode freezing non-incident mutations in target environments | |
| Guardrailed AI Summarizer (`DeterministicHeuristicProvider` + `Ollama` / OpenAI-compatible adapter) with cryptographic prompt auditing | |

---

## 2. Policy-as-Code, Freeze Windows, Incident Lock-Down & Safe AI Primer

### 2.1 RBAC vs. Policy-as-Code (What Is the Difference?)

In Phases 1–3, we built **Scoped RBAC** (`internal/access`). Here is how **RBAC** and **Policy-as-Code** complement each other:

| Dimension | RBAC (`internal/access`) | Policy-as-Code (`internal/policy`) |
| :--- | :--- | :--- |
| **Core Question** | *"Does **Actor X** have permission to perform **Action Y** on **Target Z**?"* | *"Does **Change Payload P** satisfy the organization's safety, compliance, and timing rules right now?"* |
| **Example Rule** | *"Bob is a `SERVICE_LEAD` on `payment-service` and can approve UAT changes."* | *"No changes may be applied to `PROD` on Fridays between 16:00 UTC and Monday 08:00 UTC (Weekend Freeze), and plain config values must never contain high-entropy secret strings."* |
| **Enforcement Levels** | Binary (`ALLOWED` or `403 FORBIDDEN`). | Tiered:<br>• **`ADVISORY`:** Shows a yellow warning badge on the Change Request.<br>• **`SOFT_MANDATORY`:** Blocks normal apply, but an `ORG_ADMIN` or `ENV_ADMIN` can override with a written justification.<br>• **`HARD_MANDATORY`:** Strictly blocks submission/apply with zero overrides allowed (e.g., plaintext secret detected in `config_items`). |

### 2.2 How Shannon Entropy Detects Accidental Secret Leaks in Plain Configs

In Phase 2, we blocked obvious key names like `DB_PASSWORD` from being added to plain `config_items`. But what if a developer creates a plain config key named `STRIPE_ENDPOINT_HEADER` and accidentally pastes a live secret token like `<YOUR_STRIPE_API_KEY>` as the value?

In `internal/policy/scanner.go`, we combine **Regex Pattern Signatures** (matching `sk_live_`, `ghp_`, `eyJ...` JWTs, `-----BEGIN PRIVATE KEY-----`, URL passwords `postgres://user:pass@host`) with **Shannon Information Entropy** $H(X)$, which measures the randomness of characters in a string of length $N$:

$$
H(X) = -\sum_{i=1}^{k} P(x_i) \log_2 P(x_i) \quad \text{where } P(x_i) = \frac{\text{count}(x_i)}{N}
$$

* Normal English words, hostnames, or JSON configs have low entropy ($H(X) \approx 2.5\text{ to }3.8\text{ bits/char}$).
* Cryptographic keys, random API tokens, and base64 secrets have high entropy ($H(X) > 4.3\text{ bits/char}$ for strings of length $N \ge 20$).
* If `scanner.ScanConfigValue(key, value)` detects either a known credential regex or suspiciously high entropy without an explicit non-secret allowlist tag, the `HARD_MANDATORY` `NO_PLAINTEXT_SECRETS` policy blocks the config change and instructs the developer to register an `openbao://...` `SecretRef` instead!

### 2.3 How Guardrailed AI Works Without Ever Risking Secret Exposure

Many companies want AI assistance to summarize complex blast-radius graphs or incident timelines, but security teams rightly block AI tools that might leak credentials. `iconfigly` enforces **Four Hardware-Like AI Security Guardrails**:

1. **Compile-Time Package Isolation:** The Go package `internal/ai` **does not import** `internal/secretprovider` or `internal/secretref`. It has no code path or dependency capable of fetching secrets from OpenBao.
2. **Metadata-Only Context Assembly:** When summarizing a Change Request or Drift event, `internal/ai` receives only structural metadata: service slugs, team names, dependency hops ($d = 1..5$), config key names (or redacted diffs), and integer version numbers (`v14` $\rightarrow$ `v15`).
3. **Mandatory Pre-Flight `PromptSanitizer`:** Before any prompt leaves `internal/ai`, it passes through `PromptSanitizer.Sanitize(input)` which runs both `redact.SanitizeMap` and the Shannon entropy / regex secret scanner. If any token resembles a secret, it is replaced with `"[REDACTED_HIGH_ENTROPY]"` before the prompt is constructed.
4. **Zero-Cost Offline Default (`DeterministicHeuristicProvider`):** Out of the box, `ICONFIGLY_AI_PROVIDER=heuristic` generates structured, human-readable executive summaries, rollout risk checklists, and remediation steps using a fast deterministic Go rule engine ($< 1\text{ms}$, $0\text{ MB}$ extra RAM, $100\%$ offline). If you want generative LLM prose locally, you can start the optional `ollama` container (`ICONFIGLY_AI_PROVIDER=ollama`) at $\$0$ cost.

---

## 3. Phase 9 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-072** | **Policy Evaluation Engine** | **Deterministic Typed Policy Evaluator (`internal/policy`) with JSON-Schema Rule Configs** | Evaluates 6 built-in enterprise policy types (`FREEZE_WINDOW`, `NO_PLAINTEXT_SECRETS`, `MAX_BLAST_RADIUS`, `REQUIRED_RUNBOOK`, `REQUIRE_CI_PASSING`, `NAMING_CONVENTION`) in $< 2\text{ms}$ with clear, actionable violation messages per rule. | **Embedding a full external OPA / Rego runtime binary:** Requires learning a separate domain-specific language (Rego) for simple governance rules that platform admins want to configure via UI checkboxes and forms. |
| **ADR-073** | **Policy Enforcement Tiers** | **Three-Tier Enforcement (`ADVISORY`, `SOFT_MANDATORY`, `HARD_MANDATORY`)** | Matches enterprise Policy-as-Code standards (like HashiCorp Sentinel). Allows teams to roll out new policies in `ADVISORY` (warning) mode first, require admin sign-off for `SOFT_MANDATORY` exceptions, and strictly block secret leaks with `HARD_MANDATORY`. | **Binary pass/fail policies only:** Forces admins to disable policies completely whenever a legitimate edge case or emergency occurs. |
| **ADR-074** | **Change-Freeze Scheduling** | **Explicit Date-Range Windows + UTC Cron Windows (`freeze_windows` Table)** | Supports both one-off event freezes (`2026-11-26` to `2026-11-30` for Black Friday) and recurring weekly freezes (`Every Friday 16:00 UTC to Monday 08:00 UTC`), evaluated deterministically against `time.Now().UTC()`. | **Hardcoding freeze logic in CI pipelines:** Bypasses UI-initiated changes and lacks centralized visibility or Break-Glass override auditing. |
| **ADR-075** | **Incident Lock-Down Mechanism** | **First-Class `incident_lockdowns` Aggregate Checked in `change.Service.ApplyChangeRequest`** | During a `SEV1` outage, freezing an environment (`PROD`) or the entire organization at the control-plane level guarantees that no background automation or unaware engineer mutates configs unless their Change Request explicitly references the active `incident_ticket_id`. | **Manually revoking everyone's RBAC permissions during an outage:** Destructive, slow to restore after the incident, and breaks read access needed for debugging. |
| **ADR-076** | **Plaintext Secret Detection** | **Hybrid Regex Signature + Shannon Entropy ($H(X) > 4.3$) Scanner (`internal/policy/scanner.go`)** | Catches both well-known token prefixes (`ghp_`, `sk_live_`, `AKIA`, `eyJ`) and unknown custom high-entropy passwords/keys pasted into plain `config_items`. | **Checking only key names (`PASSWORD`, `SECRET`):** Fails when a developer pastes a password or API token into a key named `HEADER_VALUE` or `CONNECTION_ARGS`. |
| **ADR-077** | **AI Provider Architecture** | **Hexagonal `InsightProvider` Port with `HeuristicProvider` (Default) + `OllamaProvider` + `OpenAICompatibleProvider`** | Guarantees that every feature works 100% offline with zero GPU/RAM overhead using `HeuristicProvider`, while allowing one-line switching to local `Ollama` (`llama3.2` / `qwen2.5-coder`) or any OpenAI-compatible API. | **Requiring an OpenAI API key for the platform to work:** Violates our $\$0$ cost mandate and air-gapped self-hosting principles. |
| **ADR-078** | **AI Secret Isolation** | **Architectural Non-Import Rule + Pre-Flight `PromptSanitizer` + `ai_analysis_audits` Ledger** | Provably prevents secret exfiltration. Every AI request records the SHA-256 hash of the sanitized prompt, `redaction_verified = true`, actor, and latency in PostgreSQL. | **Passing raw database rows to an LLM prompt:** Unacceptable security risk in an infrastructure control plane. |

---

## 4. Phase 9 DDD Bounded Contexts & Governance Sequence Flows

### 4.1 Phase 9 Bounded Context & Governance Topology

```
flowchart TD
    subgraph UserAndCI["Developer / SRE / CI Pipeline"]
        UI["iconfigly-web\n(Policy Studio, Incident Banner, AI Drawer)"]
        CLI["iconfigly-cli\n(iconfigly policy check / incident lockdown)"]
    end

    subgraph ControlPlaneGovernance["iconfigly-api (Phase 9 Governance & Safe AI Contexts)"]
        Chg["internal/change (UPDATED)\n(Enforces Policy & Incident Lock-Down Gates)"]
        Pol["internal/policy (NEW)\n(Policy Evaluator, Freeze Windows & Entropy Secret Scanner)"]
        Inc["internal/incident (NEW)\n(SEV1/SEV2 Lock-Down State Machine)"]
        AI["internal/ai (NEW)\n(PromptSanitizer + Heuristic / Ollama Insight Engine)"]
        Catalog["Phase 1-6 Contexts\n(Service, Binding, Impact, Telemetry, GitHub CI, Audit)"]
    end

    subgraph AIProviders["Pluggable AI / Insight Adapters ($0 Local)"]
        Heur["Deterministic Heuristic Engine\n(Default: <1ms, Zero RAM, 100% Offline)"]
        Ollama["Local Ollama Container\n(--profile ai: llama3.2:1b / qwen2.5)"]
    end

    subgraph Storage["PostgreSQL 18 Persistence"]
        PG[("PostgreSQL 18\n(governance_policies, freeze_windows,\nincident_lockdowns, ai_analysis_audits)")]
    end

    UI --> Chg & Pol & Inc & AI
    CLI --> Pol & Inc
    Chg -->|"1. Evaluate Policies & Freeze Windows"| Pol
    Chg -->|"2. Check Active Incident Lock-Down"| Inc
    Pol --> Catalog
    AI -->|"3. Read Metadata-Only Graph & Diffs\n(NEVER imports secretprovider!)"| Catalog
    AI -->|"Sanitize & Scan Entropy"| Pol
    AI --> Heur
    AI -.->|"Optional HTTP"| Ollama
    Pol & Inc & AI --> PG
```

### 4.2 Sequence Flow 1: Policy-as-Code, Secret Scanner & Freeze-Window Gate on Change Request

```
sequenceDiagram
    actor Dev as Developer / DevOps
    participant Chg as change.Service
    participant Pol as policy.Service
    participant Scan as policy.SecretScanner
    participant DB as PostgreSQL 18 (TxManager)

    Dev->>Chg: 1. POST /api/v1/projects/{id}/change-requests (Target: payment-service in PROD)
    Chg->>Pol: EvaluateChangeRequest(ctx, projectID, envID, proposedPayload, impactReport)

    Pol->>Scan: ScanProposedConfigMutations(proposedPayload.ConfigMutations)
    Note over Scan: Checks Regex Signatures (JWT, PEM, AWS, URI pass)\n+ Shannon Entropy H(X) > 4.3 bits/char
    Scan-->>Pol: 0 Plaintext Secrets Detected (PASSED)

    Pol->>DB: Query active governance_policies & freeze_windows for (projectID, PROD)
    Pol->>Pol: Check 1: REQUIRED_RUNBOOK -> payment-service has runbook_url (PASSED)
    Pol->>Pol: Check 2: REQUIRE_CI_PASSING -> GitHub CI status == PASSING (PASSED)
    Pol->>Pol: Check 3: FREEZE_WINDOW -> Active "Weekend Prod Freeze" (SOFT_MANDATORY -> WARNING/BLOCKED)

    Pol-->>Chg: PolicyEvaluationReport (Overall: BLOCKED_BY_FREEZE_WINDOW, CanOverride: true)
    Chg->>DB: Save policy_evaluations row linked to change_request

    opt Admin / Incident Commander Submits Policy Override with Justification
        Dev->>Chg: 2. POST /change-requests/{cID}/override-policy (Reason: "Approved hotfix #INC-902")
        Chg->>DB: Verify caller is ORG_ADMIN/ENV_ADMIN -> Mark policy_evaluations = 'OVERRIDDEN' + audit_logs
    end

    Dev->>Chg: 3. POST /change-requests/{cID}/apply
    Chg->>Pol: Verify Final Policy & Incident Lock-Down Gates -> Apply Change!
```

### 4.3 Sequence Flow 2: Guardrailed AI Blast-Radius & Drift Analysis

```
sequenceDiagram
    actor User as Engineer (Browser)
    participant Handler as ai.Handler
    participant AISvc as ai.Service
    participant San as ai.PromptSanitizer
    participant Prov as ai.InsightProvider (Heuristic / Ollama)
    participant DB as PostgreSQL 18

    User->>Handler: POST /api/v1/projects/{id}/ai/summarize-change/{changeID}
    Handler->>AISvc: SummarizeChangeImpactAndRisk(ctx, actor, projectID, changeID)
    AISvc->>DB: Load ChangeRequest + ImpactReport + PolicyEvaluation + ServiceRepoState (Metadata Only)

    AISvc->>San: SanitizeAnalysisContext(rawContextStruct)
    Note over San: 1. Strips any secret_uri fragments\n2. Masks any string with Shannon Entropy H(X) > 4.2\n3. Computes SHA-256 Prompt Digest
    San-->>AISvc: SanitizedPrompt + RedactionVerified=true + PromptHash="sha256:7c4a..."

    AISvc->>Prov: GenerateStructuredInsight(ctx, SanitizedPrompt)
    Prov-->>AISvc: StructuredAIInsight (ExecutiveSummary, BlastRadiusExplanation, PreApplyChecklist, RollbackPlan)

    AISvc->>DB: INSERT INTO ai_analysis_audits (actor, analysis_type, target_id, prompt_hash, redaction_verified=true)
    AISvc->>DB: INSERT INTO audit_logs (action="ai.change_summarized", target_id=changeID)
    AISvc-->>User: 200 OK (StructuredAIInsight + "Zero-Secret Verified" Badge)
```

---

## 5. Complete Phase 9 Folder & File Evolution Across Repositories

### 5.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── .env                                      # [UPDATED] Adds ICONFIGLY_AI_PROVIDER=heuristic and ICONFIGLY_OLLAMA_URL
├── .env.example                              # [UPDATED] Documents Phase 9 AI provider & policy variables
└── compose.yaml                              # [UPDATED] Adds optional ollama service (ollama/ollama:latest on port 11434 under profile: ai)
```

### 5.2 `iconfigly-api` File Additions & Updates

```
iconfigly-api/
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds /policies/*, /freeze-windows/*, /incidents/*, and /ai/* endpoints
├── migrations/
│   ├── 000001..000026                        # Unchanged Phase 1–7 migrations
│   ├── 000027_create_governance_policies_and_freeze_windows.up.sql
│   ├── 000027_create_governance_policies_and_freeze_windows.down.sql
│   ├── 000028_create_incident_lockdowns.up.sql
│   ├── 000028_create_incident_lockdowns.down.sql
│   ├── 000029_create_ai_analysis_audits.up.sql
│   └── 000029_create_ai_analysis_audits.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # [UPDATED] Adds AIProvider ("heuristic" | "ollama" | "openai"), OllamaBaseURL, AIModelName
    │   └── config_test.go                    # [UPDATED] Tests AI configuration defaults
    ├── access/
    │   ├── authorizer.go                     # [UPDATED] Adds policy.manage, policy.override, incident.manage, and ai.analyze verbs
    │   └── authorizer_test.go                # [UPDATED] Tests permission rules for policy overrides and incident lock-downs
    ├── change/
    │   └── service.go                        # [UPDATED] Integrates policy.EvaluateChangeRequest and incident.CheckLockdownGate before Submit & Apply
    ├── policy/
    │   ├── domain.go                         # [NEW] GovernancePolicy, PolicyType, EnforcementLevel, FreezeWindow, PolicyEvaluationReport
    │   ├── scanner.go                        # [NEW] Shannon entropy calculator & regex secret signature detector for plain config_items
    │   ├── evaluator.go                      # [NEW] Pure deterministic evaluator for all 6 policy types and active/cron freeze windows
    │   ├── repository.go                     # [NEW] PolicyRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for governance_policies, freeze_windows, policy_evaluations
    │   ├── service.go                        # [NEW] CreatePolicy, ListPolicies, CreateFreezeWindow, EvaluateChange, OverridePolicyViolation
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/projects/{projectID}/policies/* and /freeze-windows/*
    │   └── evaluator_test.go                 # [NEW] Table-driven tests for Shannon entropy secret detection, freeze windows, and policy overrides
    ├── incident/
    │   ├── domain.go                         # [NEW] IncidentLockdown Aggregate, IncidentSeverity (SEV1, SEV2), LockdownStatus (ACTIVE, RESOLVED)
    │   ├── repository.go                     # [NEW] IncidentRepository interface
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for incident_lockdowns
    │   ├── service.go                        # [NEW] ActivateLockdown, ResolveLockdown, GetActiveLockdowns, CheckMutationAllowed
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/incidents/*
    │   └── service_test.go                   # [NEW] Unit tests verifying PROD mutations are blocked during lock-down unless tagged with incident_ticket_id
    ├── ai/
    │   ├── domain.go                         # [NEW] AnalysisType, SanitizedAnalysisContext, StructuredAIInsight, AIAnalysisAudit
    │   ├── sanitizer.go                      # [NEW] Zero-leakage PromptSanitizer stripping high-entropy tokens and computing SHA-256 prompt hash
    │   ├── provider.go                       # [NEW] InsightProvider interface + HeuristicProvider (default offline) + OllamaProvider
    │   ├── repository.go                     # [NEW] AIRepository interface for ai_analysis_audits
    │   ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for ai_analysis_audits
    │   ├── service.go                        # [NEW] SummarizeChangeImpact, DiagnoseServiceDrift, GenerateIncidentTimeline
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/projects/{projectID}/ai/*
    │   └── sanitizer_test.go                 # [NEW] Security unit tests proving secrets/tokens are 100% stripped before reaching InsightProvider
    └── server/
        ├── server.go                         # [UPDATED] Wires policy.Service, incident.Service, and ai.Service routes
        └── server_test.go                    # [UPDATED] Verifies Phase 9 route registration
```

### 5.3 `iconfigly-web` File Additions & Updates

```
iconfigly-web/
└── src/
    ├── app/
    │   └── (dashboard)/
    │       ├── layout.tsx                    # [UPDATED] Renders global red IncidentLockdownBanner when an active SEV1/SEV2 lock-down exists
    │       ├── projects/
    │       │   └── [projectId]/
    │       │       ├── changes/
    │       │       │   └── [changeId]/
    │       │       │       └── page.tsx      # [UPDATED] Adds PolicyCheckCard (with Override modal) and "Explain Blast Radius with Safe AI" button
    │       │       └── services/
    │       │           └── [serviceSlug]/
    │       │               └── page.tsx      # [UPDATED] Adds "Diagnose Drift with Safe AI" drawer trigger on drifted fleet instances
    │       └── settings/
    │           ├── policies/
    │           │   └── page.tsx              # [NEW] Policy-as-Code Studio & Change-Freeze Window Calendar UI
    │           └── incidents/
    │               └── page.tsx              # [NEW] Incident Lock-Down Command Center & AI Post-Mortem Timeline Generator
    ├── components/
    │   └── layout/
    │       └── IncidentLockdownBanner.tsx    # [NEW] Top emergency banner showing active incident ticket, frozen environments & "Resolve Lock-Down"
    ├── features/
    │   ├── policies/
    │   │   ├── PolicyRuleTable.tsx           # [NEW] Manage governance policies and enforcement levels (ADVISORY, SOFT_MANDATORY, HARD_MANDATORY)
    │   │   ├── FreezeWindowCalendar.tsx      # [NEW] Schedule one-off or recurring change-freeze windows per environment
    │   │   ├── PolicyEvaluationCard.tsx      # [NEW] Displays pass/warning/block results on a Change Request with Admin Override modal
    │   │   └── usePolicies.ts                # [NEW] TanStack Query hooks for policies and freeze windows
    │   ├── incidents/
    │   │   ├── ActivateLockdownModal.tsx     # [NEW] High-friction modal to activate SEV1/SEV2 lock-down on PROD or Organization
    │   │   └── useIncidents.ts               # [NEW] TanStack Query hooks for active and historical incident lock-downs
    │   └── ai/
    │       ├── SafeAiInsightDrawer.tsx       # [NEW] Slide-over drawer showing Executive Summary, Risk Explanation, Checklist & "Zero-Secret Verified" hash
    │       └── useSafeAi.ts                  # [NEW] TanStack Query mutations for change, drift, and incident AI summarization
    └── lib/
        └── types.ts                          # [UPDATED] Adds GovernancePolicy, FreezeWindow, PolicyEvaluationReport, IncidentLockdown, StructuredAIInsight
```

### 5.4 `iconfigly-cli` File Additions & Updates

```
iconfigly-cli/
└── internal/
    └── cmd/
        ├── policy.go                         # [NEW] iconfigly policy check (validates proposed config keys/values against policies & secret scanner in CI)
        └── incident.go                       # [NEW] iconfigly incident status, iconfigly incident lockdown, iconfigly incident resolve
```

---

## 6. Sub-Phase 9.0: Optional Local LLM Container (`ollama`) & Infrastructure Updates (`iconfigly-infra`)

### 6.1 Goal & Engineering Rationale

By default, `iconfigly-api` uses `ICONFIGLY_AI_PROVIDER=heuristic` (`DeterministicHeuristicProvider`), which requires **zero** extra containers, zero GPU/CPU overhead, and works on any laptop immediately. For developers who also want to test generative local LLM completions at $\$0$ cost without sending data to the cloud, we add an optional `ollama` service under `--profile ai` in `iconfigly-infra/compose.yaml`.

### 6.2 Exact File Specifications in `iconfigly-infra`

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-infra/compose.yaml` | **Update** | Adds the `ollama` service (`image: ollama/ollama:latest`, `container_name: iconfigly-ollama`, `profiles: ["ai"]`), binding `127.0.0.1:11434:11434` and mounting persistent volume `ollama_models:/root/.ollama`. |
| `iconfigly-infra/.env.example` & `.env` | **Update** | Adds `ICONFIGLY_AI_PROVIDER=heuristic` (options: `heuristic`, `ollama`, `openai`), `ICONFIGLY_OLLAMA_URL=http://ollama:11434`, and `ICONFIGLY_AI_MODEL=llama3.2:1b`. |

---

## 7. Sub-Phase 9.1: Relational Data Model & Database Migrations (`000027`–`000029`)

### 7.1 Phase 9 Entity-Relationship Additions

Phase 9 adds **5 new tables** across migrations `000027` through `000029` (`governance_policies`, `freeze_windows`, `policy_evaluations`, `incident_lockdowns`, and `ai_analysis_audits`), bringing the complete `iconfigly` relational schema across all 9 phases to **35 tables**.

```
erDiagram
    organizations ||--o{ governance_policies : "defines_rules"
    projects ||--o{ governance_policies : "scopes_rules"
    environments ||--o{ freeze_windows : "schedules_freezes"
    change_requests ||--o| policy_evaluations : "evaluated_by"

    organizations ||--o{ incident_lockdowns : "enforces_lockdown"
    environments ||--o{ incident_lockdowns : "freezes_environment"

    organizations ||--o{ ai_analysis_audits : "audits_ai_prompts"
    users ||--o{ ai_analysis_audits : "triggers_analysis"
```

### 7.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

#### Migration `000027_create_governance_policies_and_freeze_windows`

* **Table `governance_policies`:** Stores declarative Policy-as-Code rules per organization, project, or environment.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NULL REFERENCES projects(id) ON DELETE CASCADE` (`NULL` applies across all projects in the organization)
  * `environment_id`: `UUID NULL REFERENCES environments(id) ON DELETE CASCADE` (`NULL` applies across all environments, or filtered by `apply_to_production_only`)
  * `name`: `TEXT NOT NULL` (e.g., `Block Plaintext Secrets in Configs`, `Require Runbook & Passing CI for Prod High-Risk Changes`)
  * `policy_type`: `TEXT NOT NULL CHECK (policy_type IN ('NO_PLAINTEXT_SECRETS', 'MAX_BLAST_RADIUS', 'REQUIRED_RUNBOOK', 'REQUIRE_CI_PASSING', 'NAMING_CONVENTION', 'SECRET_ROTATION_MAX_AGE'))`
  * `enforcement_level`: `TEXT NOT NULL DEFAULT 'SOFT_MANDATORY' CHECK (enforcement_level IN ('ADVISORY', 'SOFT_MANDATORY', 'HARD_MANDATORY'))`
  * `apply_to_production_only`: `BOOLEAN NOT NULL DEFAULT FALSE`
  * `rule_config`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Typed parameters per policy, e.g., `{"max_affected_services": 5, "max_entropy_bits": 4.3, "key_regex": "^[A-Z][A-Z0-9_]*$"}`)
  * `is_enabled`: `BOOLEAN NOT NULL DEFAULT TRUE`
  * `created_by`: `UUID REFERENCES users(id) ON DELETE SET NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

* **Table `freeze_windows`:** Stores scheduled one-time or recurring change-freeze windows.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `name`: `TEXT NOT NULL` (e.g., `Black Friday Peak Freeze`, `Weekend Production Freeze`)
  * `reason`: `TEXT NOT NULL`
  * `window_type`: `TEXT NOT NULL DEFAULT 'DATE_RANGE' CHECK (window_type IN ('DATE_RANGE', 'WEEKLY_RECURRING'))`
  * `starts_at`: `TIMESTAMPTZ NULL` (Used when `window_type == 'DATE_RANGE'`)
  * `ends_at`: `TIMESTAMPTZ NULL`
  * `recurring_schedule`: `JSONB NOT NULL DEFAULT '{}'::jsonb` (Used when `window_type == 'WEEKLY_RECURRING'`, e.g., `{"start_day": "FRIDAY", "start_hour_utc": 16, "end_day": "MONDAY", "end_hour_utc": 8}`)
  * `enforcement_level`: `TEXT NOT NULL DEFAULT 'SOFT_MANDATORY' CHECK (enforcement_level IN ('SOFT_MANDATORY', 'HARD_MANDATORY'))`
  * `is_enabled`: `BOOLEAN NOT NULL DEFAULT TRUE`
  * `created_by`: `UUID REFERENCES users(id) ON DELETE SET NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

* **Table `policy_evaluations`:** Records the policy check results and any administrative override for each `change_request_id`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `change_request_id`: `UUID NOT NULL UNIQUE REFERENCES change_requests(id) ON DELETE CASCADE`
  * `overall_status`: `TEXT NOT NULL CHECK (overall_status IN ('PASSED', 'WARNING', 'BLOCKED', 'OVERRIDDEN'))`
  * `violations`: `JSONB NOT NULL DEFAULT '[]'::jsonb` (Array of `{policy_id, policy_name, policy_type, enforcement_level, message, remediation}`)
  * `overridden_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  * `override_reason`: `TEXT NOT NULL DEFAULT ''`
  * `overridden_at`: `TIMESTAMPTZ NULL`
  * `evaluated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

#### Migration `000028_create_incident_lockdowns`

* **Table `incident_lockdowns`:** Tracks active and resolved `SEV1`/`SEV2` incident lock-down states.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NULL REFERENCES projects(id) ON DELETE CASCADE` (`NULL` locks down all projects in the organization)
  * `environment_id`: `UUID NULL REFERENCES environments(id) ON DELETE CASCADE` (`NULL` locks down all production environments)
  * `incident_ticket_id`: `TEXT NOT NULL` (e.g., `INC-2026-0891` — changes carrying this ticket ID in their reason/metadata are permitted as emergency hotfixes)
  * `title`: `TEXT NOT NULL` (e.g., `SEV1: Payment Gateway Timeout Spike in PROD`)
  * `severity`: `TEXT NOT NULL DEFAULT 'SEV1' CHECK (severity IN ('SEV1', 'SEV2'))`
  * `status`: `TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'RESOLVED'))`
  * `activated_by`: `UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT`
  * `resolved_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL`
  * `resolution_summary`: `TEXT NOT NULL DEFAULT ''`
  * `started_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `resolved_at`: `TIMESTAMPTZ NULL`
  * *Indexes:* `idx_incident_lockdowns_active` on `(organization_id, status) WHERE status = 'ACTIVE'`.

#### Migration `000029_create_ai_analysis_audits`

* **Table `ai_analysis_audits`:** Immutable cryptographic log of every AI summarization request proving zero secret exposure.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `actor_user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
  * `analysis_type`: `TEXT NOT NULL CHECK (analysis_type IN ('CHANGE_BLAST_RADIUS', 'DRIFT_DIAGNOSIS', 'INCIDENT_TIMELINE'))`
  * `target_id`: `UUID NOT NULL` (UUID of the `change_request`, `service`, or `incident_lockdown`)
  * `provider_name`: `TEXT NOT NULL` (`HEURISTIC`, `OLLAMA`, `OPENAI_COMPATIBLE`)
  * `model_name`: `TEXT NOT NULL`
  * `sanitized_prompt_sha256`: `TEXT NOT NULL` (Hex SHA-256 digest of the sanitized input payload)
  * `redaction_verified`: `BOOLEAN NOT NULL DEFAULT TRUE CHECK (redaction_verified = TRUE)` (Database-enforced invariant: cannot insert an AI audit row unless `redaction_verified` is `TRUE`)
  * `masked_tokens_count`: `INT NOT NULL DEFAULT 0`
  * `insight_output`: `JSONB NOT NULL` (Cached `StructuredAIInsight` JSON)
  * `latency_ms`: `INT NOT NULL DEFAULT 0`
  * `created_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`

---

## 8. Sub-Phase 9.2: Declarative Policy-as-Code Engine, Secret-Leak Scanner & Freeze Windows (`internal/policy`)

### 8.1 Built-In Policy Evaluators (`internal/policy/evaluator.go`)

| Policy Type | What It Inspects | Default Enforcement | Pass / Fail Logic & Remediation Hint |
| :--- | :--- | :--- | :--- |
| **`NO_PLAINTEXT_SECRETS`** | `ProposedChangePayload.ConfigMutations` | **`HARD_MANDATORY`** (Cannot be overridden!) | Runs `scanner.ScanConfigKeyAndValue(key, val)`. Fails if the key name matches secret keywords OR if the value matches a credential regex (`JWT`, `PEM`, `AWS`, `GitHub PAT`, `DB URI password`) OR has Shannon entropy $H(X) > 4.3\text{ bits/char}$ over $\ge 20$ chars. Instructs user to register a `SecretRef` (`openbao://...`). |
| **`FREEZE_WINDOW`** | Active `freeze_windows` matching `(projectID, envID)` at `time.Now().UTC()` | **`SOFT_MANDATORY`** (or `HARD_MANDATORY`) | Checks if current UTC timestamp falls inside `starts_at..ends_at` or matches the `WEEKLY_RECURRING` window. If active, blocks the change with the freeze window's name and expiration time. |
| **`MAX_BLAST_RADIUS`** | `ImpactReport.TotalAffectedServices` & `RiskLevel` | **`SOFT_MANDATORY`** | Compares `TotalAffectedServices` against `rule_config.max_affected_services` (default `5` in `PROD`). Requires explicit lead/admin override when a single change impacts more than $N$ microservices. |
| **`REQUIRED_RUNBOOK`** | `Service.RunbookURL` of affected services | **`SOFT_MANDATORY`** | Verifies that every directly affected service in a `PROD` change has a non-empty `runbook_url` in the Service Catalog so on-call responders know how to recover if the change fails. |
| **`REQUIRE_CI_PASSING`** | `ServiceRepoState.CIStatus` (from Phase 6 GitHub sync) | **`ADVISORY`** or **`SOFT_MANDATORY`** | Warns or blocks applying a change to a service whose latest GitHub Actions CI status on `main` is `FAILING`. |
| **`NAMING_CONVENTION`** | `ConfigKey` format | **`HARD_MANDATORY`** | Verifies all configuration keys match the project's configured regex pattern (e.g., `^[A-Z][A-Z0-9_]{2,63}$`). |

---

## 9. Sub-Phase 9.3: Organization & Environment Incident Lock-Down Mode (`internal/incident`)

### 9.1 How Incident Lock-Down Protects Production During Outages

1. **Activating Lock-Down (`POST /api/v1/incidents/lockdown`):**
   * An `ORG_ADMIN` or `ENV_ADMIN` provides `incident_ticket_id` (e.g., `"INC-2026-0891"`), `title` (`"SEV1: Checkout DB Connection Pool Exhaustion"`), `severity` (`"SEV1"`), and optional target `project_id` / `environment_id`.
   * Inside `txManager.WithTx`, `incident.Service` creates the `ACTIVE` `incident_lockdowns` row, writes `incident.lockdown_activated` to `audit_logs`, and enqueues a `CRITICAL` `incident.lockdown_activated` broadcast to `outbox_events` (notifying Slack, MS Teams, Email, and In-App Inbox).
2. **Enforcement Gate in `change.Service.ApplyChangeRequest`:**
   * Before any Change Request can be applied in an environment covered by an `ACTIVE` `IncidentLockdown`, `incident.Service.CheckMutationAllowed(ctx, changeReq)` checks whether `changeReq.Reason` or `changeReq.Title` contains the active `incident_ticket_id` (`INC-2026-0891`).
   * If the Change Request is **not** tagged with the active incident ticket, `ApplyChangeRequest` rejects the operation with HTTP `423 Locked` (RFC 9457 type `https://iconfigly.dev/errors/incident-lockdown-active`):
     *"Environment PROD is currently in SEV1 Incident Lock-Down (INC-2026-0891). Only emergency hotfix changes referencing INC-2026-0891 may be applied until the lock-down is resolved."*
3. **Resolving Lock-Down (`POST /api/v1/incidents/{id}/resolve`):**
   * Records `resolution_summary`, sets `status = 'RESOLVED'`, writes `incident.lockdown_resolved` to `audit_logs`, and broadcasts the all-clear notification.

---

## 10. Sub-Phase 9.4: Guardrailed AI Blast-Radius, Drift & Incident Summarizer (`internal/ai`)

### 10.1 Structured AI Output Schema (`internal/ai/domain.go`)

Rather than returning an unstructured wall of chat text, `internal/ai` returns a deterministic, typed `StructuredAIInsight` JSON object that renders cleanly in the UI:

| Field in `StructuredAIInsight` | Type | What It Contains |
| :--- | :--- | :--- |
| `Title` | `string` | Concise 1-line summary (e.g., `"High-Risk Shared PostgreSQL Rotation Affecting 4 Services Across 3 Teams"`). |
| `ExecutiveSummary` | `string` | 2–3 sentence plain-English explanation of what is changing, why the risk score is `HIGH (65)`, and how downstream callers (`checkout-service`) are transitively impacted. |
| `KeyRiskFactors` | `[]string` | Bulleted list of concrete topological and operational risks (e.g., `"payments-db is a shared POSTGRES resource bound to 3 direct services in UAT"`, `"invoice-service currently has 1 DRIFTED instance on v13"`). |
| `PreApplyVerificationSteps` | `[]string` | Actionable checklist for the approver/operator before clicking Apply. |
| `RollbackAndRecoveryPlan` | `string` | Exact 1-click UI or `iconfigly-cli` command to roll back if error rates spike after applying. |
| `ZeroSecretAttestation` | `AttestationMetadata` | Contains `RedactionVerified: true`, `SanitizedPromptSHA256: "sha256:..."`, `MaskedTokensCount: 0`, and `Provider: "HEURISTIC"` (or `"OLLAMA"`). |

---

## 11. Sub-Phase 9.5: CLI Policy Linting & Incident Control Commands (`iconfigly-cli`)

### 11.1 New Phase 9 Commands in `iconfigly-cli`

| Command | Flags & Arguments | What It Does |
| :--- | :--- | :--- |
| `iconfigly policy check` | `--project <slug> --service <slug> --env <slug> --file <config.json\|iconfigly.yaml>` | Runs the local and remote Policy-as-Code & Shannon Entropy Secret Scanner against a proposed configuration file in CI/CD (GitHub Actions), exiting with code `1` if any `HARD_MANDATORY` policy or secret leak is detected! |
| `iconfigly incident status` | `--project <slug>` | Displays any active `SEV1`/`SEV2` Incident Lock-Downs, frozen environments, and the required emergency `incident_ticket_id`. |
| `iconfigly incident lockdown` | `--ticket INC-901 --severity SEV1 --env prod --title "..."` | Activates Incident Lock-Down Mode directly from an Incident Commander's terminal in $< 1\text{ second}$. |
| `iconfigly incident resolve` | `<lockdown-id> --summary "Root cause mitigated"` | Lifts an active Incident Lock-Down and notifies all engineering teams. |

---

## 12. Sub-Phase 9.6: Next.js Policy Studio, Freeze Calendar, Incident Banner & AI Copilot UI (`iconfigly-web` Phase 9)

### 12.1 Complete Phase 9 UI Screen & Component Specifications

| Route Path / Component | File Path in `iconfigly-web/src/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| **Global Incident Lock-Down Banner** | `components/layout/IncidentLockdownBanner.tsx` | Displayed at the very top of the dashboard whenever an `ACTIVE` `IncidentLockdown` exists. Shows a high-contrast pulsing red/amber bar: `🚨 ACTIVE SEV1 INCIDENT LOCK-DOWN (INC-2026-0891): PROD mutations are frozen except hotfixes tagged with INC-2026-0891` + a **`Resolve Lock-Down`** button for admins. |
| `/settings/policies` | `app/(dashboard)/settings/policies/page.tsx` | **Policy-as-Code Studio & Change-Freeze Calendar:**<br>1. **Governance Policies Tab (`PolicyRuleTable`):** Toggle built-in policies (`NO_PLAINTEXT_SECRETS`, `MAX_BLAST_RADIUS`, `REQUIRED_RUNBOOK`, `REQUIRE_CI_PASSING`), configure thresholds, and set enforcement level (`ADVISORY`, `SOFT_MANDATORY`, `HARD_MANDATORY`).<br>2. **Change-Freeze Windows Tab (`FreezeWindowCalendar`):** Visual timeline of upcoming and active freeze windows (`Weekend Prod Freeze`, `Quarter-End Close`) with a `+ Schedule Freeze Window` modal. |
| `/settings/incidents` | `app/(dashboard)/settings/incidents/page.tsx` | **Incident Lock-Down Command Center:**<br>Allows activating a `SEV1`/`SEV2` Lock-Down in one click, viewing all emergency changes applied during the incident window, and clicking **`Generate Post-Mortem Timeline (Safe AI)`** to export a Markdown incident timeline from the immutable audit logs. |
| **Change Request Policy & Safe AI Drawer** | `app/(dashboard)/projects/[projectId]/changes/[changeId]/page.tsx` | 1. **Policy Evaluation Card (`PolicyEvaluationCard`):** Shows green `PASSED`, amber `WARNING`, or red `BLOCKED` badges for each policy rule, plus an **`Override Soft-Mandatory Policy`** modal for `ORG_ADMIN` / `ENV_ADMIN`.<br>2. **`Explain Blast Radius & Risk (Safe AI)` Button (`SafeAiInsightDrawer`):** Opens a slide-over drawer rendering the `StructuredAIInsight` with a cryptographic **`Zero-Secret Exposure Verified (SHA-256)`** shield badge. |

---

## 13. Sub-Phase 9.7: Comprehensive Testing Strategy, REST API Catalog & Complete 9-Phase Master Checklist

### 13.1 Complete Phase 9 REST API Endpoint Catalog

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/projects/{projectID}/policies` | `catalog.read` | Lists governance policies applicable to the project. |
| `POST` | `/api/v1/projects/{projectID}/policies` | `policy.manage` | Creates or updates a declarative governance policy rule. |
| `GET` | `/api/v1/projects/{projectID}/freeze-windows` | `catalog.read` | Lists scheduled and recurring change-freeze windows. |
| `POST` | `/api/v1/projects/{projectID}/freeze-windows` | `policy.manage` | Creates a one-time or weekly recurring change-freeze window. |
| `POST` | `/api/v1/projects/{projectID}/change-requests/{changeID}/override-policy` | `policy.override` | Overrides a `SOFT_MANDATORY` policy or freeze-window block with a mandatory audit reason. |
| `GET` | `/api/v1/incidents/lockdowns` | Authenticated | Lists active and historical `SEV1`/`SEV2` incident lock-downs. |
| `POST` | `/api/v1/incidents/lockdowns` | `incident.manage` | Activates an immediate `SEV1`/`SEV2` Incident Lock-Down on an environment or organization. |
| `POST` | `/api/v1/incidents/lockdowns/{lockdownID}/resolve` | `incident.manage` | Resolves an active Incident Lock-Down and restores normal change operations. |
| `POST` | `/api/v1/projects/{projectID}/ai/summarize-change/{changeID}` | `ai.analyze` | Generates a guardrailed `StructuredAIInsight` for a Change Request's blast radius and risk. |
| `POST` | `/api/v1/projects/{projectID}/ai/diagnose-drift/{serviceSlug}` | `ai.analyze` | Diagnoses fleet configuration/replica drift for `?env={envSlug}` using sanitized metadata. |
| `POST` | `/api/v1/incidents/lockdowns/{lockdownID}/ai-timeline` | `ai.analyze` | Generates a structured Markdown post-mortem timeline of all events during an incident window. |

### 13.2 Phase 9 Testing Matrix

| Test Layer | Target Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. Shannon Entropy & Secret Scanner Unit Tests** | `internal/policy/evaluator_test.go` | Tests that normal config values (`"info"`, `"https://api.acme.com/v1"`, `"2500"`) pass, while high-entropy random strings ($H(X) > 4.3$), JWTs, AWS keys, and URLs with embedded passwords (`postgres://u:secret@db:5432`) are blocked by `NO_PLAINTEXT_SECRETS` (`HARD_MANDATORY`). |
| **2. Freeze Window & Policy Override Tests** | `internal/policy/evaluator_test.go` | Tests both fixed `DATE_RANGE` and `WEEKLY_RECURRING` UTC freeze windows; verifies `SOFT_MANDATORY` violations can be overridden by `ORG_ADMIN` with an audit log, while `HARD_MANDATORY` violations reject overrides (`403`). |
| **3. Incident Lock-Down Gate Tests** | `internal/incident/service_test.go` | Verifies that when `PROD` has an `ACTIVE` lock-down (`INC-901`), applying a normal `APPROVED` Change Request returns `423 Locked`, whereas a Change Request referencing `INC-901` in its reason is allowed through. |
| **4. AI Prompt Sanitizer Zero-Leakage Tests** | `internal/ai/sanitizer_test.go` | Feeds synthetic structs containing simulated tokens/passwords into `PromptSanitizer.Sanitize`; proves that 100% of high-entropy strings are replaced with `"[REDACTED_HIGH_ENTROPY]"` before `InsightProvider` is invoked, and verifies `ai_analysis_audits` persistence. |

---

### 13.3 Complete 9-Phase Documentation Suite Index (`iconfigly-docs`)

With Phase 9 complete, your `iconfigly-docs` repository contains the entire architectural blueprint suite from Day 1 foundation to enterprise governance:

| Phase Blueprint File | Core Focus | Migrations | ADRs |
| :--- | :--- | :--- | :--- |
| **`PROJECT_MASTER_PLAN.md`** | Master Overview, Glossary, Go Primer & Cross-Phase Reference | Overview | Overview |
| **`PHASE_01_FOUNDATION.md`** | DDD Foundation, Catalog, Dependency Graph, Scoped RBAC & Hash-Chained Audit | `000001`–`000009` | `ADR-001`–`ADR-012` |
| **`PHASE_02_CHANGE_SAFETY_CORE.md`** | Versioned Configs, Blast-Radius Impact CTE, Approvals, Temp Access & Outbox Worker | `000010`–`000015` | `ADR-013`–`ADR-022` |
| **`PHASE_03_OPENBAO_AND_DYNAMIC_LEASES.md`** | OpenBao KV v2 Rotation, Dynamic SQL Credential Leases, Break-Glass & Redaction | `000016`–`000017` | `ADR-023`–`ADR-030` |
| **`PHASE_04_CLI_SDKS_AND_ROLLOUT_TRACKING.md`** | Runtime Bundle (`ETag`), `iconfigly-cli`, JS/Go/Java SDKs, Rollout & Drift Engine | `000018`–`000019` | `ADR-031`–`ADR-039` |
| **`PHASE_05_KUBERNETES_HELM_AND_OPERATOR.md`** | Multi-Stage Dockerfiles, Local `kind` K8s, Helm Chart & `iconfigly-operator` CRD | `000020`–`000021` | `ADR-040`–`ADR-048` |
| **`PHASE_06_ENTERPRISE_IDENTITY_AND_INTEGRATIONS.md`** | OIDC/SSO + PKCE (`dex`), JIT Group Mapping, GitHub Sync, Argo CD & Slack/Teams | `000022`–`000024` | `ADR-049`–`ADR-056` |
| **`PHASE_07_HARDENING_OBSERVABILITY_AND_SCALE.md`** | Prometheus, OpenTelemetry, Grafana, Rate Limiting, Keyring Rotation, DLQ & `k6` | `000025`–`000026` | `ADR-057`–`ADR-064` |
| **`PHASE_08_LAUNCH_PACKAGING_AND_PORTFOLIO.md`** | 60-Second Demo Seeder, Multi-Arch GHCR, GoReleaser, SBOM/Cosign & Case Study | Demo Seeder | `ADR-065`–`ADR-071` |
| **`PHASE_09_POLICY_ENGINE_AND_SAFE_AI.md`** | Policy-as-Code, Freeze Windows, Entropy Secret Scanner, Incident Lock-Down & Safe AI | `000027`–`000029` | `ADR-072`–`ADR-078` |
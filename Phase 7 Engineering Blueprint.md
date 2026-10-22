# iconfigly — Phase 7 Engineering Blueprint: Production Hardening, Observability (Prometheus, OpenTelemetry & Grafana), Disaster Recovery & `k6` Load Testing

> **Document Scope:** Phase 7 Complete Engineering Plan (Sub-Phase 7.0 to Sub-Phase 7.7)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Three Pillars of Observability (Metrics, Logs, Traces) + Defense-in-Depth Hardening + Automated Disaster Recovery
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; building production-grade Go observability, distributed tracing, rate limiting, key rotation, and `k6` performance benchmarks from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop (100% containerized execution with local Prometheus, Grafana, Tempo, and `k6`, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 7 Executive Summary & Scope](#1-phase-7-executive-summary--scope)
2. [Observability, Rate Limiting & Load Testing Primer for Full-Stack Engineers](#2-observability-rate-limiting--load-testing-primer-for-full-stack-engineers)
3. [Phase 7 Architectural Decisions & Rationale (ADRs)](#3-phase-7-architectural-decisions--rationale-adrs)
4. [Phase 7 DDD Bounded Contexts, Telemetry & Resilience Flows](#4-phase-7-ddd-bounded-contexts-telemetry--resilience-flows)
5. [Complete Phase 7 Folder & File Evolution Across Repositories](#5-complete-phase-7-folder--file-evolution-across-repositories)
6. [Sub-Phase 7.0: Containerized Observability & Load Testing Stack (`iconfigly-infra`)](#6-sub-phase-70-containerized-observability--load-testing-stack-iconfigly-infra)
7. [Sub-Phase 7.1: Relational Data Model, Index Tuning & Retention Migrations (`000025`–`000026`)](#7-sub-phase-71-relational-data-model-index-tuning--retention-migrations-000025000026)
8. [Sub-Phase 7.2: Prometheus Metrics & OpenTelemetry Distributed Tracing (`internal/observability`)](#8-sub-phase-72-prometheus-metrics--opentelemetry-distributed-tracing-internalobservability)
9. [Sub-Phase 7.3: Production Security Hardening, Tiered Rate Limiting & Master Key Rotation (`internal/shared/httputil` & `internal/ops`)](#9-sub-phase-73-production-security-hardening-tiered-rate-limiting--master-key-rotation-internalsharedhttputil--internalops)
10. [Sub-Phase 7.4: Multi-Worker Concurrency, Dead-Letter Replay & Automated Data Retention (`internal/worker` & `internal/ops`)](#10-sub-phase-74-multi-worker-concurrency-dead-letter-replay--automated-data-retention-internalworker--internalops)
11. [Sub-Phase 7.5: Disaster Recovery, Backup/Restore Automation & `k6` Performance Benchmarks (`iconfigly-infra`)](#11-sub-phase-75-disaster-recovery-backuprestore-automation--k6-performance-benchmarks-iconfigly-infra)
12. [Sub-Phase 7.6: Next.js System Health, Queue Telemetry & DLQ Replay UI (`iconfigly-web` Phase 7)](#12-sub-phase-76-nextjs-system-health-queue-telemetry--dlq-replay-ui-iconfigly-web-phase-7)
13. [Sub-Phase 7.7: Comprehensive Testing Strategy & Phase 7 Verification Checklist](#13-sub-phase-77-comprehensive-testing-strategy--phase-7-verification-checklist)

---

## 1. Phase 7 Executive Summary & Scope

### 1.1 Phase 7 Objective

By the end of Phase 6, `iconfigly` is feature-complete across its entire domain: service/resource cataloging, scoped RBAC, blast-radius impact analysis, multi-approver change workflows, OpenBao dynamic database leases, CLI/SDK/Operator runtime convergence, OIDC/SSO, and GitHub/Argo CD/ChatOps integrations.

However, before an engineering organization trusts `iconfigly` as a tier-1 production control plane—and before we package and launch it publicly in Phase 8—it must answer four critical **Production Readiness & Site Reliability Engineering (SRE)** questions:

1. **Observability:** When an API request is slow or a background notification fails, can operators immediately see **Metrics** (Prometheus request latency histograms, outbox queue depth, active drift counts), **Structured Logs** (`slog` correlated by `trace_id`), and **Distributed Traces** (OpenTelemetry spans across HTTP $\rightarrow$ Service $\rightarrow$ PostgreSQL $\rightarrow$ OpenBao) in a pre-built **Grafana** dashboard?
2. **Security & Abuse Hardening:** Is the platform protected against brute-force login floods, runaway SDK polling loops, oversized JSON payloads, and cryptographic master key (`ICONFIGLY_MASTER_KEY`) rotation requirements?
3. **Operational Resilience & Maintenance:** Can admins inspect and replay `DEAD_LETTER` outbox events from the UI, and does the database automatically prune expired sessions, consumed OIDC states, and historical heartbeats without ever mutating the append-only `audit_logs` ledger?
4. **Verified Performance & Disaster Recovery:** Can we prove with repeatable **Grafana `k6` load tests** that `iconfigly-api` sustains $1,000+\text{ req/s}$ on runtime bundle `ETag` checks with $p_{95} < 25\text{ms}$ latency, and can we restore a full PostgreSQL + OpenBao state backup cleanly in under 2 minutes?

### 1.2 Repository Status in Phase 7

| Repository | Phase 7 Status | Role in Phase 7 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds the `observability` Docker Compose profile (`prometheus`, `tempo`, `grafana` with pre-provisioned datasources and dashboards), the `k6` load testing suite (`k6/*.js`), and automated PostgreSQL backup/restore verification scripts (`scripts/backup.sh`, `scripts/restore-verify.sh`). |
| **`iconfigly-api`** | **Active** | Adds migrations `000025`–`000026`, `internal/observability` (Prometheus registry + OpenTelemetry tracer/meter setup), `internal/ops` (system diagnostics, DLQ replay, master key re-encryption, data retention sweeper), and tiered rate-limiting + security header middlewares. |
| **`iconfigly-web`** | **Active** | Adds the `/settings/system-health` SRE Operations Console (Live Outbox & Worker Queue metrics, Dead-Letter Queue inspector with 1-click replay, Retention Job status, and Audit Chain verification trigger). |
| **`iconfigly-cli`** | **Active** | Adds `iconfigly admin status`, `iconfigly admin replay-dlq`, and `iconfigly admin verify-audit` operational commands for platform SREs. |
| **`iconfigly-docs`** | **Active** | Phase 7 engineering blueprint, SRE runbook, and disaster recovery guide. |
| **`iconfigly-sdk-*` & `operator`** | **Active (Phases 4–5)** | Propagate W3C `traceparent` headers on outbound bundle/heartbeat calls for end-to-end distributed tracing. |

### 1.3 Scope Boundaries for Phase 7

| In Scope for Phase 7 | Out of Scope for Phase 7 (Deferred to Phases 8–9) |
| :--- | :--- |
| Prometheus `/metrics` endpoint exposing HTTP RED metrics, `pgxpool` connection stats, Outbox queue gauges, OpenBao latency, and domain counters | Public multi-arch Docker image publishing to GHCR (`linux/amd64`, `linux/arm64`) and GoReleaser CLI binary releases (Phase 8) |
| End-to-end OpenTelemetry (`otel`) tracing across HTTP handlers, PostgreSQL queries, OpenBao HTTP calls, and background workers | Public documentation website deployment and portfolio case study video (Phase 8) |
| Pre-provisioned local Grafana + Prometheus + Tempo stack in `compose.yaml` (`--profile observability`) | Freeze-window Policy-as-Code Engine, Incident Lock-Down Mode, and guardrailed AI Drift/Impact Summarizer (Phase 9) |
| Tiered token-bucket rate limiting (Auth IP limiter, API actor limiter, Runtime SDK limiter), request size limits, and HTTP security headers | |
| Zero-downtime `EnvelopeCipher` keyring (`primary` + `previous` master key) and live database re-encryption job | |
| Dead-Letter Queue (DLQ) inspection & replay API/UI + automated `RetentionWorker` pruning expired ephemeral rows | |
| Automated PostgreSQL backup/restore scripts and `k6` load test suite (`bundle-etagload.js`, `heartbeat-burst.js`, `impact-graph.js`) | |

---

## 2. Observability, Rate Limiting & Load Testing Primer for Full-Stack Engineers

### 2.1 The Three Pillars of Observability (Logs, Metrics, Traces)

In Phases 1–6, we used structured JSON logs (`log/slog`). In Phase 7, we complete the **Three Pillars of Observability** so you can diagnose any production issue in seconds:

| Pillar | What It Records | Tool in `iconfigly` | Example Question It Answers |
| :--- | :--- | :--- | :--- |
| **1. Metrics** | Numeric time-series counters, gauges, and histograms aggregated in memory | **Prometheus** (`/metrics`) + **Grafana** | *"What is our 95th percentile ($p_{95}$) latency on `GET /api/v1/runtime/bundle` over the last 1 hour, and how many `PENDING` jobs are in `outbox_events` right now?"* |
| **2. Distributed Traces** | The exact waterfall timeline ("spans") of a single request as it hops across layers and services | **OpenTelemetry (`otel`)** + **Grafana Tempo** | *"Request `req_0195...` took $180\text{ms}$—did it spend that time waiting on a PostgreSQL recursive CTE ($4\text{ms}$) or waiting on OpenBao `/v1/database/creds` ($172\text{ms}$)?"* |
| **3. Structured Logs** | Detailed JSON event records stamped with `request_id` and `trace_id` | **Go `log/slog`** | *"What exact validation error or SMTP response code occurred inside span `span_8f9a`?"* |

### 2.2 How Token-Bucket Rate Limiting Works (`golang.org/x/time/rate`)

Imagine a bucket that holds at most $B$ tokens (the **Burst** capacity) and refills at a steady rate of $R$ tokens per second:

1. Every incoming HTTP request removes $1$ token from the caller's bucket.
2. If the bucket has at least $1$ token, the request proceeds immediately ($0\text{ms}$ delay).
3. If the bucket is empty ($0$ tokens), the server immediately rejects the request with HTTP `429 Too Many Requests`, a `Retry-After` header, and an RFC 9457 Problem JSON payload—protecting PostgreSQL and Argon2id CPU threads from exhaustion!

### 2.3 Why Keyring Rotation Matters for Envelope Encryption

In Phases 2 and 6, `EnvelopeCipher` encrypted webhook secrets, OIDC client secrets, and GitHub/Argo CD tokens using `ICONFIGLY_MASTER_KEY`. In real security audits (SOC 2 / ISO 27001), companies must rotate their master encryption key annually. By upgrading `EnvelopeCipher` to a **Keyring** supporting both `ICONFIGLY_MASTER_KEY` (current key, prefix `v2:`) and `ICONFIGLY_PREVIOUS_MASTER_KEY` (old key, prefix `v1:`), `iconfigly` can decrypt existing secrets seamlessly while re-encrypting all database rows to the new key with zero downtime!

---

## 3. Phase 7 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-057** | **Metrics Instrumentation** | **Prometheus Client (`prometheus/client_golang`) on Dedicated Internal/Admin `/metrics` Endpoint** | Prometheus is the cloud-native standard (CNCF graduated) supported natively by Kubernetes, Docker, and Grafana. Exposing RED metrics (Rate, Errors, Duration) plus custom domain gauges gives complete visibility with $< 1\%$ CPU overhead. | **Pushing metrics over UDP (StatsD):** Requires a sidecar daemon and loses scrape health visibility. |
| **ADR-058** | **Distributed Tracing Standard** | **OpenTelemetry Go SDK (`go.opentelemetry.io/otel`) Exporting OTLP HTTP to Grafana Tempo** | OpenTelemetry is the vendor-neutral industry standard. Instrumenting our HTTP middleware, `TxManager` SQL execution, `OpenBaoProvider`, and `OutboxWorker` with OTLP spans lets engineers visualize exact latency waterfalls locally in Grafana Tempo. | **Vendor-specific APM agents (Datadog / NewRelic):** Requires paid cloud accounts and proprietary libraries. |
| **ADR-059** | **Log-to-Trace Correlation** | **Custom `slog.Handler` Wrapper Injecting Active `trace_id` & `span_id` from `context.Context`** | Automatically attaches `"trace_id"` and `"span_id"` to every `logger.InfoContext(ctx, ...)` and `logger.ErrorContext(ctx, ...)` JSON log line so operators can jump directly from a log line to its Tempo trace in Grafana. | **Manually passing `traceID` strings to every log call:** Clutters business logic and is easily forgotten. |
| **ADR-060** | **Rate Limiting Architecture** | **In-Memory Sharded Token-Bucket Limiter (`golang.org/x/time/rate`) with 3 Tiered Policies** | Different endpoints have vastly different traffic profiles: `/auth/login` must be strictly throttled ($10\text{ req/min}$ per IP) to stop password brute-forcing, while `/runtime/bundle` and `/telemetry/heartbeat` must allow high microservice fleet throughput ($600\text{ req/min}$ per token). | **Single global rate limit across all routes:** Either too permissive for `/auth/login` or too restrictive for 50 polling microservice pods. |
| **ADR-061** | **Master Key Rotation** | **Version-Prefixed Ciphertext (`key_id || nonce || gcm_ciphertext`) + Online Re-Encryption Use Case** | Prefixing encrypted `BYTEA` blobs with a 1-byte key version tag allows `EnvelopeCipher.Decrypt` to automatically select the matching key from the keyring, while `ops.Service.RotateMasterKeyEncryption` upgrades all rows inside an atomic transaction. | **Taking the platform offline to run an external Python/bash decryption script:** High risk of data corruption and unnecessary downtime. |
| **ADR-062** | **Singleton Maintenance Sweeps Across Multiple Workers** | **PostgreSQL Session-Level/Transaction Advisory Locks (`pg_try_advisory_xact_lock`)** | While `OutboxWorker` uses `FOR UPDATE SKIP LOCKED` to process batches in parallel across $N$ worker replicas, periodic maintenance jobs (`RetentionWorker`, `DriftWorker`) use `pg_try_advisory_xact_lock` so only one worker replica executes a sweep per tick without needing Redis or ZooKeeper! | **Adding Redis/etcd solely for distributed cron locking:** Violates our zero-extra-infrastructure principle. |
| **ADR-063** | **Historical Data Retention Policy** | **Automated `RetentionWorker` Pruning Ephemeral Tables While Preserving `audit_logs` & `config_versions`** | Ephemeral tables (`sessions`, `oidc_auth_states`, `DELIVERED` `outbox_events`, `DEREGISTERED` `instance_heartbeats`) grow continuously and should be pruned after their retention window (e.g., 7–30 days). By contrast, `audit_logs`, `change_requests`, and `config_versions` remain 100% immutable forever. | **Never deleting expired sessions or delivered outbox rows:** Causes unbounded table bloat and degrades index scan performance over months of operation. |
| **ADR-064** | **Performance & Load Testing Tool** | **Grafana `k6` (`grafana/k6:latest`) Containerized JavaScript Scenarios** | `k6` is written in Go (capable of generating $10,000+\text{ RPS}$ from a single laptop container) while allowing test scripts to be written in clean JavaScript/TypeScript with built-in SLA threshold assertions (`http_req_duration: ['p(95)<25']`). | **JMeter / Locust:** Heavy JVM memory footprint (JMeter) or lower single-core throughput (Python Locust). |

---

## 4. Phase 7 DDD Bounded Contexts, Telemetry & Resilience Flows

### 4.1 Phase 7 Observability, Security & SRE Operations Topology

```
flowchart TD
    subgraph ClientTraffic["Incoming Traffic & Load Generation"]
        Browser["Browser / Next.js UI"]
        Fleet["SDKs / CLI / K8s Operator\n(W3C traceparent Header)"]
        K6["Grafana k6 Container\n(Load & SLA Benchmark Suite)"]
    end

    subgraph HardenedIngress["Hardened HTTP Middleware Pipeline (internal/shared/httputil)"]
        SecHdr["SecurityHeaders & MaxBytesMiddleware\n(CSP, HSTS, X-Frame-Options, 1MB Limit)"]
        OtelMW["OTel Trace & Prometheus RED Middleware\n(Starts Span + Records Duration Histogram)"]
        RateMW["Tiered Token-Bucket Rate Limiter\n(Auth IP: 10/m | API Actor: 180/m | Runtime: 600/m)"]
    end

    subgraph ControlPlane["iconfigly-api & iconfigly-worker"]
        Obs["internal/observability (NEW)\n(Prometheus Collector + OTLP Tracer + slog Trace Injector)"]
        Ops["internal/ops (NEW)\n(System Health, DLQ Replay, Keyring Re-Encrypt, Retention)"]
        Domain["Domain Services (Phases 1-6)\n(Catalog, Change, Impact, Access, Runtime, Telemetry)"]
        Workers["Background Workers\n(OutboxWorker, ExpiryWorker, DriftWorker, RetentionWorker)"]
    end

    subgraph StorageAndObservability["Persistence & Local Observability Stack (compose.yaml)"]
        PG[("PostgreSQL 18\n(Tuned Indexes & Advisory Locks)")]
        Prom["Prometheus (:9090)\n(Scrapes /metrics every 5s)"]
        Tempo["Grafana Tempo (:3200)\n(Receives OTLP Traces :4318)"]
        Graf["Grafana (:3001)\n(Pre-Built iconfigly SRE Dashboard)"]
    end

    Browser --> SecHdr
    Fleet --> SecHdr
    K6 -->|"1,000+ RPS Benchmark"| SecHdr
    SecHdr --> OtelMW --> RateMW --> Domain
    RateMW --> Ops
    Domain --> Obs
    Workers --> Obs
    Ops --> PG
    Workers --> PG
    Prom -->|"GET /metrics"| Obs
    Obs -->|"OTLP HTTP Spans"| Tempo
    Graf --> Prom
    Graf --> Tempo
```

### 4.2 Sequence Flow 1: End-to-End Distributed Tracing & Log Correlation

```
sequenceDiagram
    actor User as Service Lead
    participant MW as OTel + Logger Middleware
    participant Chg as change.Service
    participant DB as TxManager (PostgreSQL)
    participant Bao as OpenBaoProvider
    participant Tempo as Grafana Tempo (OTLP)

    User->>MW: POST /api/v1/projects/{id}/change-requests/{cID}/apply
    MW->>MW: Start Root Span "POST /change-requests/{cID}/apply"\n(Generate trace_id="4bf92f...", span_id="00f067...")
    MW->>Chg: ApplyChangeRequest(ctx, actor, projectID, cID)

    Chg->>DB: Start Child Span "db.tx.WithTx"
    Chg->>Bao: Start Child Span "openbao.RotateSecret"
    Bao-->>Chg: 200 OK (newVersion=2, duration=14ms)
    Chg->>DB: Start Child Span "audit.AppendWithLock" & "outbox.Enqueue"
    DB-->>Chg: Transaction Committed (duration=6ms)

    Chg->>MW: logger.InfoContext(ctx, "change request applied", "change_id", cID)
    Note over MW: slog TraceHandler automatically injects:\n{"level":"INFO","msg":"change request applied","trace_id":"4bf92f...","span_id":"00f067..."}

    MW-->>User: 200 OK (Header: X-Trace-ID: 4bf92f...)
    MW-)Tempo: Async Batch Export OTLP Spans (Root + 3 Child Spans)
```

### 4.3 Sequence Flow 2: Online Master Key Rotation & Dead-Letter Queue (DLQ) Replay

```
sequenceDiagram
    actor Admin as SRE / Org Admin
    participant OpsH as ops.Handler (/api/v1/ops/*)
    participant OpsS as ops.Service
    participant Keyring as crypto.EnvelopeCipher (Keyring v1 + v2)
    participant DB as PostgreSQL 18 (TxManager)
    participant Worker as worker.OutboxWorker

    Note over Admin,DB: Workflow A: Zero-Downtime Master Key Re-Encryption
    Admin->>OpsH: POST /api/v1/ops/rotate-encryption-keys
    OpsH->>OpsS: ReEncryptAllStoredSecrets(ctx, actor)
    OpsS->>DB: WithTx: SELECT rows FROM notification_rules, oidc_providers, external_integrations
    loop For Each Encrypted BYTEA Column
        OpsS->>Keyring: Decrypt(ciphertext) [Uses v1 or v2 key automatically]
        OpsS->>Keyring: Encrypt(plaintext) [Seals with active v2 Primary Key]
        OpsS->>DB: UPDATE table SET *_encrypted = newCiphertext, key_version = 2
    end
    OpsS->>DB: Record audit_logs (action="ops.encryption_keys_rotated", rotated_count=N)
    OpsS-->>Admin: 200 OK (Rotated N encrypted credentials to Key v2)

    Note over Admin,Worker: Workflow B: Dead-Letter Queue (DLQ) Inspection & Replay
    Admin->>OpsH: POST /api/v1/ops/outbox/dead-letters/{eventID}/replay
    OpsH->>OpsS: ReplayDeadLetterEvent(ctx, actor, eventID)
    OpsS->>DB: WithTx: UPDATE outbox_events SET status='PENDING', attempts=0, last_error='', next_attempt_at=NOW() WHERE id=eventID AND status='DEAD_LETTER'
    OpsS->>DB: Record audit_logs (action="ops.outbox_dlq_replayed", target_id=eventID)
    OpsS-->>Admin: 200 OK
    Worker->>DB: Claims replayed event on next 2s tick & delivers notification
```

---

## 5. Complete Phase 7 Folder & File Evolution Across Repositories

### 5.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── .env                                      # [UPDATED] Adds ICONFIGLY_OTEL_EXPORTER_URL, ICONFIGLY_RATE_LIMIT_ENABLED
├── .env.example                              # [UPDATED] Documents Phase 7 observability & rate limit variables
├── compose.yaml                              # [UPDATED] Adds prometheus, tempo, grafana (profile: observability) and k6 (profile: tools)
├── observability/
│   ├── prometheus.yml                        # [NEW] Scrapes iconfigly-api:8080/metrics and iconfigly-worker:8081/metrics every 5s
│   ├── tempo.yaml                            # [NEW] Lightweight local OTLP HTTP/gRPC trace receiver (:4318) & query backend (:3200)
│   └── grafana/
│       ├── provisioning/
│       │   ├── datasources/
│       │   │   └── datasources.yaml          # [NEW] Auto-provisions Prometheus and Tempo datasources with trace-to-metrics linking
│       │   └── dashboards/
│       │       └── dashboards.yaml           # [NEW] Auto-loads JSON dashboards from /var/lib/grafana/dashboards
│       └── dashboards/
│           └── iconfigly-overview.json       # [NEW] Pre-built SRE Dashboard: API p50/p95/p99 latency, ETag 304 hit ratio, Outbox depth, Drift & Leases
├── k6/
│   ├── bundle-etag-load.js                   # [NEW] 1,000+ RPS steady-state ETag caching & RuntimeBundle load test
│   ├── heartbeat-burst.js                    # [NEW] Simulated 500-pod fleet concurrent heartbeat ingestion test
│   └── impact-graph-stress.js                # [NEW] Concurrent recursive CTE blast-radius calculation benchmark
└── scripts/
    ├── backup-postgres.sh                    # [NEW] Creates timestamped, SHA-256 checksummed pg_dump custom-format archive
    └── restore-verify.sh                     # [NEW] Restores backup into temporary verification DB and runs audit hash-chain check
```

### 5.2 `iconfigly-api` File Additions & Updates

```
iconfigly-api/
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds /metrics and /api/v1/ops/* system health, DLQ replay & key rotation endpoints
├── migrations/
│   ├── 000001..000024                        # Unchanged Phase 1–6 migrations
│   ├── 000025_add_key_version_and_dlq_metadata.up.sql
│   ├── 000025_add_key_version_and_dlq_metadata.down.sql
│   ├── 000026_add_performance_covering_indexes.up.sql
│   └── 000026_add_performance_covering_indexes.down.sql
└── internal/
    ├── config/
    │   ├── config.go                         # [UPDATED] Adds PreviousMasterKeyHex, OTelEndpoint, RateLimitConfig, RetentionDaysConfig
    │   └── config_test.go                    # [UPDATED] Tests keyring & rate-limit configuration defaults
    ├── database/
    │   ├── postgres.go                       # [UPDATED] Registers pgx tracer hook for OpenTelemetry SQL query spans & pool metrics collector
    │   └── tx.go                             # [UPDATED] Adds TryAdvisoryLock helper for singleton background maintenance sweeps
    ├── shared/
    │   ├── crypto/
    │   │   ├── envelope.go                   # [UPDATED] Upgrades EnvelopeCipher to support v1/v2 keyring decryption and primary key rotation
    │   │   └── crypto_test.go                # [UPDATED] Tests decrypting v1 ciphertext with PreviousMasterKey and re-sealing with v2 PrimaryKey
    │   └── httputil/
    │       ├── middleware.go                 # [UPDATED] Adds SecurityHeadersMiddleware and MaxBodyBytesMiddleware (1MB default)
    │       ├── ratelimit.go                  # [NEW] Sharded token-bucket rate limiter (IP-based for Auth, Actor/Token-based for API & Runtime)
    │       └── ratelimit_test.go             # [NEW] Unit tests verifying burst allowance, 429 Too Many Requests, and Retry-After header
    ├── observability/
    │   ├── metrics.go                        # [NEW] Typed Prometheus metrics registry (HTTP RED histograms, Outbox gauges, RBAC & OpenBao counters)
    │   ├── tracing.go                        # [NEW] OpenTelemetry TracerProvider initializer (OTLP HTTP exporter + W3C TraceContext propagator)
    │   ├── log_handler.go                    # [NEW] slog.Handler decorator automatically injecting trace_id and span_id from context.Context
    │   ├── middleware.go                     # [NEW] HTTP middleware starting OTel server spans and recording Prometheus request histograms
    │   └── observability_test.go             # [NEW] Tests /metrics exposition format and trace_id injection into JSON logs
    ├── ops/
    │   ├── domain.go                         # [NEW] SystemHealthSummary, QueueMetrics, DeadLetterItem, RetentionSweepReport, KeyRotationReport
    │   ├── repository.go                     # [NEW] OpsRepository interface for queue inspection, DLQ replay, and retention batch deletes
    │   ├── postgres_repo.go                  # [NEW] SQL queries for outbox queue stats, DLQ replay, and bounded-batch retention cleanup
    │   ├── service.go                        # [NEW] GetSystemDiagnostics, ListDeadLetters, ReplayDeadLetter, RotateEncryptionKeys, RunRetentionSweep
    │   ├── handler.go                        # [NEW] HTTP handlers for /api/v1/ops/* (restricted to ORG_ADMIN)
    │   └── service_test.go                   # [NEW] Unit & integration tests for DLQ replay, key rotation, and retention sweeps
    ├── worker/
    │   ├── retention_worker.go               # [NEW] Periodic background worker pruning expired sessions, OIDC states, old heartbeats & delivered outbox rows
    │   └── worker_test.go                    # [UPDATED] Tests RetentionWorker advisory lock safety and verifies audit_logs are never touched
    └── server/
        ├── server.go                         # [UPDATED] Mounts /metrics, wires observability middlewares, rate limiters, and ops routes
        └── server_test.go                    # [UPDATED] Verifies security headers, /metrics endpoint, and /api/v1/ops/* routes
```

### 5.3 `iconfigly-web` File Additions & Updates

```
iconfigly-web/
└── src/
    ├── app/
    │   └── (dashboard)/
    │       └── settings/
    │           └── system-health/
    │               └── page.tsx              # [NEW] SRE System Health, Outbox Queue Telemetry, DLQ Replay Console & Key Rotation UI
    ├── features/
    │   └── ops/
    │       ├── SystemHealthCards.tsx         # [NEW] Displays DB Pool saturation, OpenBao latency, Outbox Pending/DLQ counts & Active Leases
    │       ├── DeadLetterQueueTable.tsx      # [NEW] Lists DEAD_LETTER outbox events with error trace, payload inspector & "Replay" / "Replay All" buttons
    │       ├── MaintenanceActionsPanel.tsx   # [NEW] Triggers Audit Hash Chain Verification, Retention Sweep, and Master Key Re-Encryption
    │       └── useOps.ts                     # [NEW] TanStack Query hooks for /api/v1/ops/* endpoints
    └── lib/
        └── types.ts                          # [UPDATED] Adds SystemHealthSummary, DeadLetterItem, and RetentionSweepReport interfaces
```

### 5.4 `iconfigly-cli` File Additions & Updates

```
iconfigly-cli/
└── internal/
    └── cmd/
        ├── root.go                           # [UPDATED] Registers admin subcommand group
        └── admin.go                          # [NEW] iconfigly admin status, iconfigly admin replay-dlq, iconfigly admin verify-audit
```

---

## 6. Sub-Phase 7.0: Containerized Observability & Load Testing Stack (`iconfigly-infra`)

### 6.1 Goal & Engineering Rationale

To give you a complete, zero-cost observability and performance testing lab on Windows 11 + WSL2 without slowing down everyday coding when you don't need it, we add **Prometheus**, **Grafana Tempo**, and **Grafana** under the `observability` Docker Compose profile (`docker compose --profile observability up -d`), and **Grafana `k6`** under the `tools` profile.

### 6.2 Exact File Specifications in `iconfigly-infra`

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-infra/compose.yaml` | **Update** | Adds 4 profiled services:<br>1. **`prometheus`** (`prom/prometheus:v3.2.1`, profile `observability`, port `127.0.0.1:9090:9090`), mounting `./observability/prometheus.yml`.<br>2. **`tempo`** (`grafana/tempo:2.7.1`, profile `observability`, ports `3200` and `4318` OTLP HTTP), mounting `./observability/tempo.yaml`.<br>3. **`grafana`** (`grafana/grafana:11.5.2`, profile `observability`, port `127.0.0.1:3001:3000`), pre-configured with anonymous viewer access in local dev and auto-provisioned datasources/dashboards.<br>4. **`k6`** (`grafana/k6:0.57.0`, profile `tools`), mounting `./k6:/scripts:ro` to execute load tests against `http://api:8080`. |
| `iconfigly-infra/observability/prometheus.yml` | **Create** | Configures a `5s` scrape interval targeting `api:8080/metrics` (and `worker:8081/metrics` when running standalone workers). |
| `iconfigly-infra/observability/grafana/dashboards/iconfigly-overview.json` | **Create** | Pre-built 12-panel Grafana dashboard displaying:<br>• **Row 1 (Golden Signals):** Request Rate (RPS), Error Rate ($\%$), $p_{50} / p_{95} / p_{99}$ HTTP Latency, and Runtime Bundle `ETag` `304 Not Modified` Cache Hit Ratio.<br>• **Row 2 (Control Plane Health):** Active `pgxpool` Connections, OpenBao RPC Latency & Error Count, Outbox Queue Depth (`PENDING` vs `DEAD_LETTER`), and RBAC Authorizer Evaluation Latency.<br>• **Row 3 (Fleet & Governance):** Active Microservice Instances (`IN_SYNC` vs `DRIFTED` vs `STALE`), Active Temporary Access Leases, and Change Requests Applied per Hour. |

---

## 7. Sub-Phase 7.1: Relational Data Model, Index Tuning & Retention Migrations (`000025`–`000026`)

### 7.1 Complete Migration & Index Specification (`iconfigly-api/migrations/`)

#### Migration `000025_add_key_version_and_dlq_metadata`

1. **Envelope Encryption Key Versioning:**
   * Adds `encryption_key_version SMALLINT NOT NULL DEFAULT 1` to `notification_rules`, `oidc_providers`, and `external_integrations` so `ops.Service` can query and track which rows are encrypted with key version `1` vs `2` during key rotation.
2. **Dead-Letter Queue (DLQ) Replay Tracking on `outbox_events`:**
   * Adds `dead_lettered_at TIMESTAMPTZ NULL`, `replayed_at TIMESTAMPTZ NULL`, and `replayed_by UUID NULL REFERENCES users(id) ON DELETE SET NULL` to `outbox_events`.
3. **Table `maintenance_runs`:** Tracks executions of background or admin-triggered maintenance operations (`RETENTION_SWEEP`, `KEY_ROTATION`, `AUDIT_VERIFICATION`).
   * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
   * `organization_id`: `UUID NULL REFERENCES organizations(id) ON DELETE CASCADE`
   * `job_type`: `TEXT NOT NULL CHECK (job_type IN ('RETENTION_SWEEP', 'KEY_ROTATION', 'AUDIT_VERIFICATION'))`
   * `triggered_by`: `UUID NULL REFERENCES users(id) ON DELETE SET NULL` (`NULL` when run automatically by `RetentionWorker`)
   * `status`: `TEXT NOT NULL CHECK (status IN ('RUNNING', 'COMPLETED', 'FAILED'))`
   * `items_processed`: `INT NOT NULL DEFAULT 0`
   * `details`: `JSONB NOT NULL DEFAULT '{}'::jsonb`
   * `started_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
   * `completed_at`: `TIMESTAMPTZ NULL`

#### Migration `000026_add_performance_covering_indexes`

Optimizes the three hottest read paths identified during `k6` load testing so PostgreSQL 18 can satisfy them via **Index-Only Scans** (`INCLUDE` covering columns) with zero heap fetches:

1. **Hot Path 1 — Runtime Bundle Version Vector Check (`GET /api/v1/runtime/bundle`):**
   * `CREATE INDEX idx_config_items_bundle_etag ON config_items (service_id, environment_id) INCLUDE (current_version_number) WHERE is_deleted = FALSE;`
   * `CREATE INDEX idx_secret_refs_bundle_etag ON secret_refs (service_id, resource_id, environment_id) INCLUDE (ref_key, version_hint);`
2. **Hot Path 2 — Scoped RBAC Evaluation (`Authorizer.Can`):**
   * `CREATE INDEX idx_role_bindings_authz_cover ON role_bindings (organization_id, scope_type, scope_id) INCLUDE (subject_type, subject_id, role_name, expires_at);`
3. **Hot Path 3 — Retention Cleanup Sweeps (`RetentionWorker`):**
   * `CREATE INDEX idx_outbox_delivered_retention ON outbox_events (processed_at) WHERE status = 'DELIVERED';`
   * `CREATE INDEX idx_heartbeats_deregistered_retention ON instance_heartbeats (deregistered_at) WHERE drift_status = 'DEREGISTERED';`

---

## 8. Sub-Phase 7.2: Prometheus Metrics & OpenTelemetry Distributed Tracing (`internal/observability`)

### 8.1 Custom Prometheus Metrics Catalog (`internal/observability/metrics.go`)

All metrics use the `iconfigly_` namespace prefix and avoid high-cardinality labels (never putting raw `user_id` or `instance_id` UUIDs into Prometheus labels; using normalized route templates like `/api/v1/projects/{projectID}/services` instead):

| Metric Name | Type | Labels | What It Measures |
| :--- | :--- | :--- | :--- |
| `iconfigly_http_requests_total` | Counter | `method`, `route`, `status` | Total HTTP requests processed per route template and status code. |
| `iconfigly_http_request_duration_seconds` | Histogram | `method`, `route` | HTTP request latency distribution (buckets: `0.002, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5`). |
| `iconfigly_runtime_bundle_requests_total` | Counter | `result` (`200_FULL`, `304_CACHED`, `ERROR`) | Tracks `ETag` conditional cache efficiency across the microservice fleet. |
| `iconfigly_authz_evaluations_total` | Counter | `verb`, `decision` (`ALLOWED`, `DENIED`) | Tracks RBAC permission checks and highlights unexpected `403` spikes. |
| `iconfigly_secret_provider_operations_total` | Counter | `provider`, `operation`, `status` | Tracks OpenBao `ResolveSecret`, `RotateSecret`, `IssueDynamicLease`, and `RevokeLease` calls. |
| `iconfigly_secret_provider_duration_seconds` | Histogram | `provider`, `operation` | Latency of outbound calls to OpenBao (`:8200`). |
| `iconfigly_outbox_events_queue_size` | Gauge | `status` (`PENDING`, `PROCESSING`, `DEAD_LETTER`) | Current depth of the PostgreSQL Transactional Outbox queue. |
| `iconfigly_fleet_instances_total` | Gauge | `drift_status` (`IN_SYNC`, `DRIFTED`, `STALE`) | Current count of reporting microservice instances by synchronization state. |
| `iconfigly_active_temporary_leases_total` | Gauge | `scope_type` | Number of active time-boxed RBAC / OpenBao database leases currently in effect. |
| `iconfigly_db_pool_connections` | Gauge | `state` (`acquired`, `idle`, `max`) | Live `pgxpool.Stat()` connection pool utilization. |

### 8.2 OpenTelemetry Tracing & `slog` Correlation (`internal/observability/tracing.go` & `log_handler.go`)

| File Path | Functions / Structs | Detailed Execution Flow |
| :--- | :--- | :--- |
| `internal/observability/tracing.go` | `InitTracer(ctx context.Context, cfg config.Config) (shutdown func(context.Context) error, err error)` | If `cfg.OTelExporterEndpoint` is empty, configures a zero-overhead `noop` tracer (so unit tests need no collector). When set (e.g., `http://tempo:4318`), initializes the OpenTelemetry `otlptracehttp` batch exporter, sets service resource attributes (`service.name = "iconfigly-api"`, `service.version = "0.7.0"`), and registers the global W3C `TraceContext` propagator. |
| `internal/observability/log_handler.go` | Struct: `TraceContextHandler` (wraps `slog.Handler`)<br>Method: `Handle(ctx context.Context, r slog.Record) error` | Inspects `trace.SpanFromContext(ctx).SpanContext()`. If the span context is valid, appends `slog.String("trace_id", sc.TraceID().String())` and `slog.String("span_id", sc.SpanID().String())` to the `slog.Record` before delegating to the underlying JSON handler. |

---

## 9. Sub-Phase 7.3: Production Security Hardening, Tiered Rate Limiting & Master Key Rotation (`internal/shared/httputil` & `internal/ops`)

### 9.1 Tiered Token-Bucket Rate Limiting (`internal/shared/httputil/ratelimit.go`)

To protect `iconfigly-api` without throttling legitimate microservice startups, `TieredRateLimiter` maintains an in-memory sharded map (with automatic background eviction of idle entries every 5 minutes) enforcing three distinct tiers:

| Tier | Target Routes | Key Identifier | Default Rate & Burst | Security Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Authentication & Public Webhooks** | `POST /api/v1/auth/login`<br>`POST /api/v1/auth/setup`<br>`GET /api/v1/auth/oidc/*` | Client IP Address | **$10\text{ req/min}$** ($\text{Burst} = 5$) | Prevents credential stuffing, password brute-forcing, and Argon2id CPU exhaustion. |
| **Tier 2: Interactive Dashboard & Admin API** | All general `/api/v1/*` routes | Authenticated `Actor.UserID` (or IP if unauthenticated) | **$300\text{ req/min}$** ($\text{Burst} = 60$) | Prevents runaway browser scripts or scraping while keeping UI tab switching instantaneous. |
| **Tier 3: High-Throughput Runtime & Telemetry** | `GET /api/v1/runtime/bundle`<br>`POST /api/v1/telemetry/heartbeat`<br>`POST /api/v1/k8s/reconcile-report` | Token Hash Prefix or Client IP | **$1,200\text{ req/min}$** ($\text{Burst} = 200$) | Allows large microservice fleets and Kubernetes Operators to poll `ETag`s and emit heartbeats without false throttling. |

### 9.2 HTTP Security Headers & Request Body Guardrails (`internal/shared/httputil/middleware.go`)

* **`SecurityHeadersMiddleware`:** Sets strict defense-in-depth headers on every API response:
  * `X-Content-Type-Options: nosniff`
  * `X-Frame-Options: DENY`
  * `Referrer-Policy: strict-origin-when-cross-origin`
  * `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`
  * `Permissions-Policy: geolocation=(), microphone=(), camera=()`
  * `Strict-Transport-Security: max-age=63072000; includeSubDomains` (when running over TLS / production mode)
* **`MaxBodyBytesMiddleware(limitBytes int64)`:** Wraps `r.Body` with `http.MaxBytesReader(w, r.Body, 1048576)` ($1\text{ MB}$ limit), immediately aborting oversized JSON payloads with `413 Content Too Large` RFC 9457 Problem JSON before `json.Decoder` allocates memory.

### 9.3 Keyring-Enabled `EnvelopeCipher` (`internal/shared/crypto/envelope.go`)

* **Keyring Upgrade:** `NewEnvelopeKeyring(primaryKeyHex, previousKeyHex string)` initializes the primary AES-256-GCM AEAD cipher (tagged with version byte `0x02` when a previous key is present, or `0x01` initially) and an optional previous AEAD cipher.
* **Seamless Decryption:** `Decrypt(ciphertext []byte)` inspects the leading version byte (or falls back to trying `primary` then `previous` for legacy Phase 2/6 rows), guaranteeing zero-downtime decryption during key rotation.
* **Online Re-Encryption (`ops.Service.RotateEncryptionKeys`):** Inside a single `TxManager.WithTx` transaction, loads all encrypted columns across `notification_rules`, `oidc_providers`, and `external_integrations`, decrypts each with the keyring, re-encrypts with the current primary key, updates `encryption_key_version`, and writes an immutable `ops.encryption_keys_rotated` audit log.

---

## 10. Sub-Phase 7.4: Multi-Worker Concurrency, Dead-Letter Replay & Automated Data Retention (`internal/worker` & `internal/ops`)

### 10.1 Safe Multi-Worker Scaling (`iconfigly-worker` Replicas $\ge 2$)

In Kubernetes (`helm/iconfigly/templates/deployment-worker.yaml`), organizations run 2 or more replicas of `iconfigly-worker` for high availability. Here is how each background worker coordinates safely across replicas without duplicate execution:

| Worker | Concurrency Mechanism | How It Prevents Duplicate Work Across Replicas |
| :--- | :--- | :--- |
| **`OutboxWorker`** | Row-Level Locking (`SELECT ... FOR UPDATE SKIP LOCKED LIMIT 20`) | Worker Replica A claims events $1\text{–}20$; Worker Replica B simultaneously claims events $21\text{–}40$ with zero lock contention. |
| **`ExpiryWorker`** | Row-Level Locking (`SELECT ... FOR UPDATE SKIP LOCKED`) | Claims expired `access_requests` and `secret_leases` individually inside transactions so OpenBao `RevokeLease` is called once per lease. |
| **`DriftWorker`** | Transaction Advisory Lock (`pg_try_advisory_xact_lock(7001)`) | Only the replica that acquires advisory lock `7001` executes the 30-second fleet stall/drift evaluation sweep; other replicas skip cleanly. |
| **`RetentionWorker` (NEW)** | Transaction Advisory Lock (`pg_try_advisory_xact_lock(7002)`) | Runs once per hour on the lock holder to prune old ephemeral records in bounded batches (`LIMIT 1000`) to avoid long table locks. |

### 10.2 Automated Data Retention Rules (`internal/worker/retention_worker.go`)

`RetentionWorker` enforces strict data hygiene while respecting our core **Immutability Invariant**:

* **Pruned Ephemeral Tables (Bounded Batch `DELETE`):**
  1. `oidc_auth_states`: Deleted where `expires_at < NOW() - INTERVAL '1 hour'`.
  2. `sessions`: Deleted where `expires_at < NOW() - INTERVAL '7 days'` OR `revoked_at < NOW() - INTERVAL '7 days'`.
  3. `outbox_events`: Deleted where `status = 'DELIVERED'` AND `processed_at < NOW() - INTERVAL '14 days'` (Note: `DEAD_LETTER` rows are **never** auto-deleted until replayed or explicitly dismissed by an admin).
  4. `instance_heartbeats`: Deleted where `drift_status = 'DEREGISTERED'` AND `deregistered_at < NOW() - INTERVAL '7 days'`.
* **Never Pruned (100% Permanent & Immutable):**
  * `audit_logs` (protected by `trg_audit_logs_immutable`), `change_requests`, `approvals`, `config_versions`, and `access_requests` history remain permanently queryable for compliance.

---

## 11. Sub-Phase 7.5: Disaster Recovery, Backup/Restore Automation & `k6` Performance Benchmarks (`iconfigly-infra`)

### 11.1 Automated Disaster Recovery Scripts (`iconfigly-infra/scripts/`)

| Script Path | Purpose & Execution Steps |
| :--- | :--- |
| `scripts/backup-postgres.sh` | 1. Executes `pg_dump -Fc --no-acl --no-owner` inside the `postgres` container to produce a compressed custom-format archive (`backups/iconfigly_YYYYMMDD_HHMMSS.dump`).<br>2. Computes and saves a companion `.sha256` checksum file.<br>3. Prunes local backup archives older than `RETENTION_DAYS` (default 14 days). |
| `scripts/restore-verify.sh` | **Automated DR Drill Script:**<br>1. Verifies the `.sha256` checksum of the latest `.dump` file.<br>2. Creates a temporary scratch database (`iconfigly_dr_verify`) inside PostgreSQL.<br>3. Runs `pg_restore -d iconfigly_dr_verify` and verifies row counts across `organizations`, `services`, `config_versions`, and `audit_logs`.<br>4. Runs `iconfigly admin verify-audit` against the restored database to prove 100% cryptographic hash-chain integrity after restore, then drops the scratch database! |

### 11.2 Containerized `k6` Performance & SLA Benchmark Suite (`iconfigly-infra/k6/`)

| Benchmark Script | Workload Profile | Enforced SLA Pass/Fail Thresholds (`thresholds` in `k6`) |
| :--- | :--- | :--- |
| `k6/bundle-etag-load.js` | **Steady-State Fleet Polling:** 100 virtual users (VUs) polling `GET /api/v1/runtime/bundle` with `If-None-Match` ETag at **$1,000+\text{ req/s}$** for 60 seconds. | • `http_req_failed: ['rate<0.001']` ($< 0.1\%$ error rate)<br>• `http_req_duration: ['p(95)<15', 'p(99)<30']` ($p_{95} < 15\text{ms}$, $p_{99} < 30\text{ms}$) |
| `k6/heartbeat-burst.js` | **Fleet Deployment Burst:** 200 VUs simulating 200 microservice pods concurrently sending `POST /api/v1/telemetry/heartbeat` upserts. | • `http_req_failed: ['rate<0.001']`<br>• `http_req_duration: ['p(95)<35', 'p(99)<75']` |
| `k6/impact-graph-stress.js` | **Recursive CTE Blast-Radius Stress:** 50 concurrent VUs calling `POST /change-requests/preview-impact` on a 5-hop dependency graph. | • `http_req_failed: ['rate<0.001']`<br>• `http_req_duration: ['p(95)<25', 'p(99)<50']` |

---

## 12. Sub-Phase 7.6: Next.js System Health, Queue Telemetry & DLQ Replay UI (`iconfigly-web` Phase 7)

### 12.1 SRE Operations Console (`/settings/system-health`)

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/settings/system-health` | `app/(dashboard)/settings/system-health/page.tsx` | **SRE System Health & Operations Console (`ORG_ADMIN` only):**<br>1. **Subsystem Status & Pool Telemetry (`SystemHealthCards`):** Live cards showing PostgreSQL 18 connection pool saturation (`Acquired / Idle / Max`), OpenBao Engine status & ping latency (`4ms`), Outbox Queue counts (`Pending`, `Processing`, `Delivered (24h)`, `Dead-Letter`), and Active Fleet Instances.<br>2. **Dead-Letter Queue (DLQ) Inspector & Replay (`DeadLetterQueueTable`):** Lists any `outbox_events` that exhausted their 5 retry attempts (`status = DEAD_LETTER`), displaying the event type, last error message (e.g., `dial tcp mailpit:1025: connection refused`), JSON payload drawer, a **`Replay Event`** button per row, and a **`Replay All Dead Letters`** batch button.<br>3. **Security & Maintenance Operations (`MaintenanceActionsPanel`):**<br>  – **`Verify Audit Hash Chain`:** Runs a full cryptographic SHA-256 verification across all `audit_logs` and displays a green `Verified: 1,420/1,420 entries intact` badge.<br>  – **`Rotate Encryption Keyring`:** Re-encrypts all stored webhook/OIDC/integration credentials to the active primary `ICONFIGLY_MASTER_KEY` and displays the count of upgraded records.<br>  – **`Run Retention Cleanup Now`:** Triggers an immediate `RetentionWorker` sweep and shows how many expired sessions, OIDC states, and delivered outbox rows were pruned. |

---

## 13. Sub-Phase 7.7: Comprehensive Testing Strategy & Phase 7 Verification Checklist

### 13.1 Complete Phase 7 REST API Endpoint Catalog (Additions to Phases 1–6)

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/metrics` | Internal / Scraper Token | Exposes Prometheus text exposition format metrics (`iconfigly_*` + Go runtime metrics). |
| `GET` | `/api/v1/ops/health-summary` | `org.manage` | Returns detailed subsystem diagnostics (`pgxpool` stats, OpenBao latency, Outbox queue counts, retention history). |
| `GET` | `/api/v1/ops/outbox/dead-letters` | `org.manage` | Lists `DEAD_LETTER` outbox events with failure reasons and retry timestamps. |
| `POST` | `/api/v1/ops/outbox/dead-letters/{eventID}/replay` | `org.manage` | Resets a single `DEAD_LETTER` event to `PENDING` (`attempts = 0`) for immediate re-delivery. |
| `POST` | `/api/v1/ops/outbox/dead-letters/replay-all` | `org.manage` | Replays all `DEAD_LETTER` events in the organization and audits `ops.outbox_dlq_replayed`. |
| `POST` | `/api/v1/ops/rotate-encryption-keys` | `org.manage` | Re-encrypts all envelope-encrypted database columns using the current primary master key. |
| `POST` | `/api/v1/ops/retention-sweep` | `org.manage` | Triggers an on-demand execution of `RetentionWorker` and returns the count of pruned ephemeral rows. |

### 13.2 Phase 7 Testing Matrix

| Test Layer | Target Repository & Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. Rate Limiter & Security Middleware Tests** | `iconfigly-api/internal/shared/httputil/ratelimit_test.go` | Verifies Tier 1 `/auth/login` blocks the 6th rapid burst request with `429 Too Many Requests` and `Retry-After` header; verifies `MaxBodyBytesMiddleware` rejects $>1\text{ MB}$ payloads with `413`; verifies CSP and HSTS security headers. |
| **2. Keyring Rotation & Envelope Crypto Tests** | `iconfigly-api/internal/shared/crypto/crypto_test.go` | Verifies data encrypted with `KeyV1` decrypts cleanly when `KeyV1` is moved to `PreviousMasterKey` and `KeyV2` is set as `PrimaryMasterKey`, and verifies re-encryption seals with `KeyV2`. |
| **3. Observability & Trace Log Correlation Tests** | `iconfigly-api/internal/observability/observability_test.go` | Verifies `/metrics` outputs `iconfigly_http_requests_total` and `iconfigly_runtime_bundle_requests_total`, and verifies `TraceContextHandler` injects `"trace_id"` and `"span_id"` into `slog` JSON output. |
| **4. DLQ Replay & Retention Worker Integration Tests** | `iconfigly-api/internal/ops/service_test.go` | Seeds a `DEAD_LETTER` outbox event, calls `ReplayDeadLetter`, and verifies `OutboxWorker` delivers it; runs `RetentionWorker` and verifies expired sessions and delivered outbox events are pruned while `audit_logs` count remains 100% untouched. |
| **5. `k6` Load & SLA Benchmark Suite** | `iconfigly-infra/k6/*.js` | Runs `bundle-etag-load.js`, `heartbeat-burst.js`, and `impact-graph-stress.js` inside Docker and verifies all $p_{95}$ and $p_{99}$ latency thresholds pass with $0\%$ errors. |

### 13.3 End-to-End Phase 7 Demo Scenario & Definition of Done Checklist

To mark Phase 7 100% complete, the following end-to-end production hardening and observability workflow must execute cleanly on your Windows 11 + WSL2 setup at $\$0$ cost:

* [ ] **Step 1 (Migrations `000025`–`000026` & Observability Stack):** Running `docker compose --profile observability up -d` starts `prometheus` (`:9090`), `tempo` (`:3200`), and `grafana` (`:3001`), and `migrate` applies `000025` and `000026` cleanly.
* [ ] **Step 2 (Pre-Built Grafana Dashboard & Distributed Tracing):** Open `http://localhost:3001` (Grafana) and open the **iconfigly SRE Overview** dashboard. Trigger a Change Request apply in `iconfigly-web`, then inspect the live Prometheus graphs and click into the **Grafana Tempo** trace waterfall showing the exact HTTP $\rightarrow$ PostgreSQL $\rightarrow$ OpenBao spans and matching `trace_id` in the container JSON logs.
* [ ] **Step 3 (Tiered Rate Limiting Verification):** Send 10 rapid failed login attempts to `POST /api/v1/auth/login` and verify that the rate limiter blocks subsequent requests with `429 Too Many Requests` (`Retry-After`), while `GET /api/v1/runtime/bundle` continues serving SDK requests without interruption.
* [ ] **Step 4 (DLQ Replay & Keyring Rotation in `/settings/system-health`):** Open `/settings/system-health` in `iconfigly-web`, click **`Rotate Encryption Keyring`** and **`Verify Audit Hash Chain`**, and replay a simulated `DEAD_LETTER` webhook event back to `DELIVERED` status.
* [ ] **Step 5 (Automated Backup & Restore Drill):** Run `./scripts/backup-postgres.sh` followed by `./scripts/restore-verify.sh` and confirm the backup restores cleanly and passes 100% cryptographic audit hash-chain verification.
* [ ] **Step 6 (`k6` Load Test SLA Pass):** Run `docker compose --profile tools run --rm k6 run /scripts/bundle-etag-load.js` and verify `iconfigly-api` sustains $>1,000\text{ req/s}$ with $p_{95} < 15\text{ms}$ and $0\%$ errors.
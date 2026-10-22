# iconfigly — Phase 8 Engineering Blueprint: Open-Source Product Launch, Multi-Arch Packaging (GHCR, GoReleaser & OCI Helm), 60-Second Demo Sandbox, Supply-Chain Security & Portfolio Case Study

> **Document Scope:** Phase 8 Complete Engineering Plan (Sub-Phase 8.0 to Sub-Phase 8.8)
>
> **Architectural Paradigm:** Release Engineering + Software Supply-Chain Security (SLSA / SBOM / Cosign) + Deterministic Sandbox Seeding + Open-Source Governance (Apache-2.0)
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; packaging and launching a 9-repository polyglot open-source DevOps platform for public adoption and technical interviews)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop + GitHub Actions Free Tier (100% open-source CI/CD and container hosting on GHCR, $\$0$ cost)

---

## Table of Contents

1. [Phase 8 Executive Summary & Scope](#1-phase-8-executive-summary--scope)
2. [Release Engineering, Multi-Arch Packaging & Supply-Chain Primer for Full-Stack Engineers](#2-release-engineering-multi-arch-packaging--supply-chain-primer-for-full-stack-engineers)
3. [Phase 8 Architectural Decisions & Rationale (ADRs)](#3-phase-8-architectural-decisions--rationale-adrs)
4. [Phase 8 Release Topologies & 60-Second Evaluator Sandbox Flows](#4-phase-8-release-topologies--60-second-evaluator-sandbox-flows)
5. [Complete Phase 8 Folder & File Evolution Across All 9 Repositories](#5-complete-phase-8-folder--file-evolution-across-all-9-repositories)
6. [Sub-Phase 8.0: Deterministic Demo Sandbox Seeder & Persona Switcher (`internal/seed` & `compose.demo.yaml`)](#6-sub-phase-80-deterministic-demo-sandbox-seeder--persona-switcher-internalseed--composedemoyaml)
7. [Sub-Phase 8.1: Multi-Arch Container Publishing (`linux/amd64`, `linux/arm64`) & OCI Helm Chart Registry](#7-sub-phase-81-multi-arch-container-publishing-linuxamd64-linuxarm64--oci-helm-chart-registry)
8. [Sub-Phase 8.2: Cross-Platform CLI Release Engineering with GoReleaser (`iconfigly-cli`)](#8-sub-phase-82-cross-platform-cli-release-engineering-with-goreleaser-iconfigly-cli)
9. [Sub-Phase 8.3: Polyglot SDK Versioning, Contract Verification & Package Publishing (`sdk-js`, `sdk-go`, `sdk-java`)](#9-sub-phase-83-polyglot-sdk-versioning-contract-verification--package-publishing-sdk-js-sdk-go-sdk-java)
10. [Sub-Phase 8.4: Supply-Chain Security, SBOM Generation (`Syft`) & Vulnerability Gates (`Trivy`, `gitleaks`, `govulncheck`)](#10-sub-phase-84-supply-chain-security-sbom-generation-syft--vulnerability-gates-trivy-gitleaks-govulncheck)
11. [Sub-Phase 8.5: Open-Source Governance, Apache-2.0 Licensing & Community Templates](#11-sub-phase-85-open-source-governance-apache-20-licensing--community-templates)
12. [Sub-Phase 8.6: Public Documentation Site & Interactive OpenAPI 3.1 Explorer (`iconfigly-docs`)](#12-sub-phase-86-public-documentation-site--interactive-openapi-31-explorer-iconfigly-docs)
13. [Sub-Phase 8.7: Technical Portfolio Case Study, System Design Narrative & 5-Minute Demo Script](#13-sub-phase-87-technical-portfolio-case-study-system-design-narrative--5-minute-demo-script)
14. [Sub-Phase 8.8: Comprehensive Release Verification & Phase 8 Launch Checklist](#14-sub-phase-88-comprehensive-release-verification--phase-8-launch-checklist)

---

## 1. Phase 8 Executive Summary & Scope

### 1.1 Phase 8 Objective

By the end of Phase 7, `iconfigly` is feature-complete, hardened with tiered rate limiting and envelope keyring rotation, instrumented with Prometheus metrics and OpenTelemetry distributed tracing, and benchmarked at $>1,000\text{ req/s}$ via `k6`.

Phase 8 transforms `iconfigly` from a powerful codebase on your laptop into an **install-ready, publicly verifiable Open-Source Product (`v1.0.0`) and Flagship Engineering Portfolio Centerpiece**. Phase 8 solves four critical product launch challenges:

1. **The 60-Second Evaluator Experience (`compose.demo.yaml` & `cmd/seed`):** When a CTO, platform engineer, or technical interviewer discovers `iconfigly` on GitHub, they will not spend 30 minutes manually creating organizations, teams, 6 microservices, dependency graphs, and OpenBao secrets just to see how Blast-Radius Impact Analysis works. Phase 8 adds a **1-Command Demo Sandbox** (`docker compose -f compose.demo.yaml up -d`) that pulls pre-built images from GitHub Container Registry (GHCR), seeds a realistic `Acme Fintech` enterprise topology, and enables a **1-Click Persona Switcher Bar** (`Alice - Super Admin` | `Bob - Payments Lead` | `Charlie - Developer` | `Diana - QA Lead`) in the UI!
2. **Automated Multi-Arch & Cross-Platform Distribution:** Tagging `v1.0.0` automatically builds and publishes `linux/amd64` and `linux/arm64` Docker images to GHCR (`ghcr.io/pathumsandeepa/iconfigly-*`), packages and pushes the Helm chart to GHCR's OCI registry, cross-compiles `iconfigly-cli` binaries for Windows, Linux, and macOS via **GoReleaser**, and publishes the TypeScript, Go, and Java SDKs.
3. **Enterprise Supply-Chain Security:** Every release artifact is scanned for leaked secrets (`gitleaks`), CVEs (`Trivy`, `govulncheck`, `npm audit`), accompanied by a CycloneDX **Software Bill of Materials (SBOM)** generated via `Syft`, and cryptographically signed using **Sigstore Cosign**.
4. **Public Documentation Site & Interview Story:** Turns `iconfigly-docs` into a searchable documentation website (deployed free on GitHub Pages) with an interactive OpenAPI 3.1 playground, architecture deep dives, and a structured **5-Minute Demo Script & System Design Narrative**.

### 1.2 All 9 Repositories Active & Coordinated in Phase 8

| Repository | Phase 8 Target Artifact | Public Distribution Channel ($\$0$ Cost) |
| :--- | :--- | :--- |
| **`iconfigly-api`** | Multi-arch container image (`server` + `worker` + `seed`) & `openapi.yaml` | `ghcr.io/pathumsandeepa/iconfigly-api:v1.0.0` |
| **`iconfigly-web`** | Multi-arch Next.js standalone container image + Demo Persona Bar | `ghcr.io/pathumsandeepa/iconfigly-web:v1.0.0` |
| **`iconfigly-infra`** | `compose.prod.yaml`, `compose.demo.yaml` & OCI Helm Chart | `oci://ghcr.io/pathumsandeepa/charts/iconfigly:1.0.0` |
| **`iconfigly-cli`** | Cross-compiled static binaries (`windows`, `linux`, `darwin` on `amd64`/`arm64`) | GitHub Releases (`GoReleaser`) + SHA-256 Checksums |
| **`iconfigly-operator`** | Multi-arch Kubernetes Operator image & bundled CRD `install.yaml` | `ghcr.io/pathumsandeepa/iconfigly-operator:v1.0.0` |
| **`iconfigly-sdk-js`** | Dual ESM/CJS TypeScript package (`@iconfigly/sdk`) | GitHub Packages / npm Registry (`v1.0.0`) |
| **`iconfigly-sdk-go`** | Version-tagged Go module (`github.com/PathumSandeepa/iconfigly-sdk-go`) | Go Module Proxy (`pkg.go.dev` via Git tag `v1.0.0`) |
| **`iconfigly-sdk-java`** | Maven artifacts (`iconfigly-client` & `iconfigly-spring-boot-starter`) | GitHub Packages Maven Registry (`v1.0.0`) |
| **`iconfigly-docs`** | Static Documentation Portal + Interactive OpenAPI Explorer + Case Study | GitHub Pages (`https://pathumsandeepa.github.io/iconfigly-docs`) |

### 1.3 Scope Boundaries for Phase 8

| In Scope for Phase 8 | Out of Scope for Phase 8 (Reserved for Optional Phase 9) |
| :--- | :--- |
| Idempotent Demo Seeder (`cmd/seed` & `internal/seed`) and 1-Click Demo Persona Switcher (`ICONFIGLY_DEMO_MODE=true`) | Declarative Policy-as-Code Engine (custom freeze windows and compliance rules) (Phase 9) |
| Zero-build `compose.prod.yaml` and `compose.demo.yaml` pulling pre-built images from `ghcr.io` | Organization-wide Incident Lock-Down Mode freezing non-emergency changes (Phase 9) |
| GitHub Actions multi-arch Docker Buildx pipelines (`linux/amd64`, `linux/arm64`) with Cosign keyless signing and Syft SBOMs | Guardrailed AI Drift & Blast-Radius Summarizer (Phase 9) |
| GoReleaser configuration (`.goreleaser.yaml`) in `iconfigly-cli` producing OS/Arch archives and checksums | |
| OCI Helm Chart packaging and publishing workflow in `iconfigly-infra` | |
| Apache-2.0 `LICENSE`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, and GitHub Issue/PR templates across all 9 repos | |
| Static documentation website (`iconfigly-docs`), Architecture Decision Record (ADR) catalog, and 5-minute demo walkthrough | |

---

## 2. Release Engineering, Multi-Arch Packaging & Supply-Chain Primer for Full-Stack Engineers

### 2.1 Why Multi-Architecture Container Images (`linux/amd64` + `linux/arm64`) Matter

Developers and servers run on two primary CPU architectures today:
1. **`linux/amd64` (`x86_64`):** Windows 11 PCs (Intel/AMD), standard Linux servers, and most cloud VMs.
2. **`linux/arm64` (`aarch64`):** Apple Silicon Macs (M1/M2/M3/M4), AWS Graviton servers, and Raspberry Pi homelabs.

If you only build a Docker image for `amd64`, anyone on an Apple Silicon Mac gets a slow emulation warning when running `docker compose up -d`. By using **Docker Buildx** in GitHub Actions (`platforms: linux/amd64,linux/arm64`), a single image tag (`ghcr.io/pathumsandeepa/iconfigly-api:v1.0.0`) contains a **Multi-Arch Manifest List** that automatically serves the native binary to both Windows/Linux (`amd64`) and Mac/ARM (`arm64`) users!

### 2.2 What `GoReleaser` Does for CLI Distribution

Instead of manually running `GOOS=windows GOARCH=amd64 go build` six times on your laptop, **GoReleaser** reads a single `.goreleaser.yaml` file in `iconfigly-cli`. Whenever you push a Git tag like `v1.0.0`, GitHub Actions runs GoReleaser to:
1. Inject the exact Git tag, commit SHA, and timestamp into `iconfigly version` via Go linker flags (`-ldflags`).
2. Cross-compile 6 static binaries (`linux`, `windows`, `darwin` $\times$ `amd64`, `arm64`) with `CGO_ENABLED=0`.
3. Package `.tar.gz` and `.zip` archives including `LICENSE` and `README.md`.
4. Generate a `checksums.txt` file containing SHA-256 digests of every binary and publish them directly to the **GitHub Releases** page.

### 2.3 Software Supply-Chain Security (SBOMs & Cosign)

Modern DevOps and platform engineering teams inspect how open-source software is built before running it:
* **SBOM (Software Bill of Materials):** A machine-readable JSON inventory (`sbom.cdx.json`) generated by **Anchore Syft** listing every exact Go module (`pgx/v5 v5.10.0`) and npm package inside your container image.
* **Keyless Container Signing (`Sigstore Cosign`):** Uses GitHub Actions' OpenID Connect (OIDC) identity to cryptographically sign your GHCR container digest without needing to store long-lived private keys in GitHub Secrets.

---

## 3. Phase 8 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-065** | **Container & Helm Registry** | **GitHub Container Registry (`ghcr.io/pathumsandeepa/*`) for Both Docker Images and OCI Helm Charts** | GHCR is 100% free for public open-source repositories, integrates natively with GitHub Actions `GITHUB_TOKEN` (zero external registry credentials to manage), has no aggressive pull rate limits like Docker Hub, and supports OCI Helm charts (`oci://ghcr.io/...`). | **Docker Hub Free Tier:** Enforces strict anonymous pull rate limits ($100\text{ pulls / 6 hours}$) that break `kind` and CI pipelines. |
| **ADR-066** | **Evaluator Sandbox Strategy** | **Dedicated `cmd/seed` Binary + `ICONFIGLY_DEMO_MODE` Persona Switcher in `compose.demo.yaml`** | Hiring managers and open-source evaluators judge a tool in the first 60 seconds. Pre-seeding a rich, realistic `Acme Fintech` dataset with 4 switchable user personas lets anyone test Blast-Radius Impact Analysis, Separation of Duties, and Rollbacks immediately without typing a single setup form. | **Forcing evaluators to manually create orgs, teams, services, and bindings from a blank database:** 90% of casual visitors close the tab before reaching the Change Request workflow. |
| **ADR-067** | **Build-Time Version Injection** | **Go Linker Flags (`-ldflags "-s -w -X .../version.Version={{.Version}}"`)** | Strips debug symbol tables (`-s -w`) to reduce binary size by $\sim 30\%$ and embeds the immutable Git tag, commit SHA, and UTC build timestamp into `iconfigly-api`, `iconfigly-cli`, and `iconfigly-operator`. | **Hardcoding version strings in `.go` files:** Easily forgotten during releases, causing version skew between Git tags and `/health` or `iconfigly version` output. |
| **ADR-068** | **Cross-Repository Version Synchronization** | **Unified Lockstep Semantic Versioning (`v1.0.0` Major.Minor compatibility across all 9 repos)** | Keeping `iconfigly-api`, `iconfigly-web`, `iconfigly-cli`, `iconfigly-operator`, and the 3 SDKs on synchronized `v1.x` minor releases makes compatibility clear and predictable for self-hosted users. | **Independent uncoordinated version numbers (e.g., API `v0.4`, CLI `v2.1`, Operator `v0.9`):** Confuses users about which CLI or Operator version works with which API server. |
| **ADR-069** | **Supply-Chain Security Pipeline** | **Automated `gitleaks` + `govulncheck` + `Trivy` + `Syft` SBOM + `Cosign` OIDC Signing** | Demonstrates staff-level DevSecOps engineering. Every release proves it contains zero leaked secrets, zero known high/critical CVEs, a complete CycloneDX SBOM, and a verifiable cryptographic signature. | **Pushing manually built local images from a developer laptop:** Untraceable build provenance and high risk of architecture mismatch or unpushed local edits. |
| **ADR-070** | **Documentation Architecture** | **Static Markdown Documentation Site + Embedded OpenAPI 3.1 Interactive Viewer on GitHub Pages** | Renders our Markdown blueprints, Mermaid diagrams, and `iconfigly-api/api/openapi.yaml` into a fast, zero-cost public website hosted at `https://pathumsandeepa.github.io/iconfigly-docs`. | **Paid SaaS documentation platforms (GitBook Pro / ReadMe.io):** Costs monthly fees and locks documentation outside the Git workflow. |
| **ADR-071** | **Open-Source License** | **Apache License 2.0 (`Apache-2.0`) Across All 9 Repositories** | Apache-2.0 is the gold standard for cloud-native and CNCF infrastructure software (used by Kubernetes, OpenBao, Backstage, and Prometheus), providing explicit patent grants and permissive enterprise adoption. | **GPLv3:** Copyleft restrictions deter enterprise engineering teams from importing `iconfigly-sdk-*` into their proprietary microservices. |

---

## 4. Phase 8 Release Topologies & 60-Second Evaluator Sandbox Flows

### 4.1 Automated Multi-Repository Release & Supply-Chain Topology

```
flowchart TD
    subgraph GitTrigger["Git Tag Push (v1.0.0)"]
        Tag["git tag v1.0.0 && git push origin v1.0.0"]
    end

    subgraph SecurityGates["Automated CI Security & Quality Gates (GitHub Actions)"]
        Leak["gitleaks\n(Zero Secret Leaks)"]
        Vuln["govulncheck & npm audit\n(Dependency CVE Check)"]
        Test["Unit + PG18 Integration + Playwright E2E\n(100% Green Suite)"]
    end

    subgraph BuildAndSign["Multi-Arch Build, SBOM & Keyless Signing"]
        Buildx["Docker Buildx (QEMU)\n(linux/amd64 + linux/arm64)\niconfigly-api, web, operator"]
        GoRel["GoReleaser\n(windows, linux, darwin)\niconfigly-cli Static Binaries"]
        HelmPkg["Helm OCI Packager\n(helm/iconfigly-1.0.0.tgz)"]
        SDKPub["SDK Publishers\n(npm, Go Proxy, Maven)"]
        SyftCosign["Syft CycloneDX SBOM\n+ Trivy Image Scan\n+ Sigstore Cosign OIDC Sign"]
    end

    subgraph PublicRegistries["Public Distribution Channels ($0 Cost)"]
        GHCR["GitHub Container Registry\nghcr.io/pathumsandeepa/*"]
        GHRel["GitHub Releases\nBinaries + checksums.txt + SBOMs"]
        DocsPages["GitHub Pages\nPublic Docs & OpenAPI Explorer"]
    end

    Tag --> SecurityGates
    Leak & Vuln & Test --> BuildAndSign
    Buildx --> SyftCosign --> GHCR
    HelmPkg --> GHCR
    GoRel --> GHRel
    SDKPub --> GHRel
    Tag --> DocsPages
```

### 4.2 Sequence Flow: The 60-Second Evaluator Sandbox (`compose.demo.yaml`)

```
sequenceDiagram
    actor Eval as Evaluator / Hiring Manager / Engineer
    participant Compose as Docker Compose (compose.demo.yaml)
    participant PG as PostgreSQL 18
    participant Bao as OpenBao + openbao-init
    participant Seed as iconfigly-api (/app/seed)
    participant Web as iconfigly-web (Demo Mode)

    Eval->>Compose: 1. docker compose -f compose.demo.yaml up -d
    Compose->>PG: Start postgres:18-alpine & run migrations 000001..000026
    Compose->>Bao: Start OpenBao (:8200) & bootstrap KV v2 + Dynamic DB roles
    Compose->>Seed: Run "/app/seed --demo" (Idempotent Enterprise Seeder)

    Seed->>PG: Upsert Organization "Acme Fintech" + 4 Demo Users (Alice, Bob, Charlie, Diana)
    Seed->>PG: Upsert 4 Teams (Payments, Storefront, Finance, DevOps) & Scoped RoleBindings
    Seed->>PG: Upsert Project "Core Banking" (DEV, QA, UAT, PROD) + 6 Microservices + 5 Resources
    Seed->>PG: Upsert Resource Bindings + Service Dependencies + Config Versions (v1..v14)
    Seed->>Bao: Seed initial secrets for payments-db, payment-cache, stripe-api
    Seed->>PG: Create Change Request #142 (PENDING_APPROVAL: Rotate payments-db in UAT, Risk=HIGH, 4 Affected Services)
    Seed->>PG: Simulate 6 active instance heartbeats (5 IN_SYNC, 1 DRIFTED)

    Eval->>Web: 2. Open http://localhost:3000
    Web-->>Eval: Auto-logged in as Alice (Admin) with Top Persona Switcher Bar!
    Eval->>Web: 3. Click "Switch to Bob (Payments Lead)" -> Approve Change #142 -> Apply & Watch Live Rollout!
```

---

## 5. Complete Phase 8 Folder & File Evolution Across All 9 Repositories

### 5.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── LICENSE                                   # [NEW] Apache-2.0 License
├── README.md                                 # [NEW] Self-Hosting Quickstart (Demo Mode, Docker Compose Prod, and Kubernetes Helm)
├── compose.yaml                              # [UNCHANGED] Local source-mounted development stack
├── compose.prod.yaml                         # [UPDATED] Production stack pulling signed GHCR images (ghcr.io/pathumsandeepa/iconfigly-*:v1.0.0)
├── compose.demo.yaml                         # [NEW] 1-Command Evaluator Sandbox running postgres, openbao, mailpit, migrate, demo-seed, api, web
└── .github/
    └── workflows/
        ├── ci-lint-helm.yml                  # [NEW] Runs helm lint, helm template validation, and docker compose config checks
        └── release-helm-oci.yml              # [NEW] Packages helm/iconfigly and pushes to oci://ghcr.io/pathumsandeepa/charts on v* tags
```

### 5.2 `iconfigly-api` File Additions & Updates

```
iconfigly-api/
├── LICENSE                                   # [NEW] Apache-2.0 License
├── CONTRIBUTING.md                           # [NEW] DDD architecture guide, local Docker test commands, and PR checklist
├── SECURITY.md                               # [NEW] Vulnerability disclosure policy and security architecture summary
├── Dockerfile                                # [UPDATED] Compiles /app/server, /app/worker, AND /app/seed with -ldflags version metadata
├── cmd/
│   ├── server/
│   │   └── main.go                           # [UPDATED] Mounts demo persona switch route only when cfg.DemoMode == true
│   ├── worker/
│   │   └── main.go                           # [UPDATED] Logs version.Info() at startup
│   └── seed/
│       └── main.go                           # [NEW] Idempotent CLI entrypoint running internal/seed against PostgreSQL & OpenBao
├── internal/
│   ├── version/
│   │   └── version.go                        # [NEW] Holds Version, CommitSHA, and BuildTime variables injected via -ldflags
│   ├── config/
│   │   └── config.go                         # [UPDATED] Adds DemoMode bool (ICONFIGLY_DEMO_MODE, default false; forbidden if Env=="production")
│   └── seed/
│       ├── seed.go                           # [NEW] Idempotent Acme Fintech enterprise topology, config, secret, change & telemetry seeder
│       ├── demo_handler.go                   # [NEW] POST /api/v1/auth/demo-switch/{personaSlug} (active strictly when DemoMode == true)
│       └── seed_test.go                      # [NEW] Integration test verifying seed idempotency (running twice produces zero duplicates)
└── .github/
    └── workflows/
        ├── ci.yml                            # [UPDATED] Adds gitleaks, govulncheck, OpenAPI validation, and PG18 integration tests
        └── release.yml                       # [NEW] Multi-arch Buildx push to GHCR, Syft SBOM attachment, Trivy scan & Cosign signing
```

### 5.3 `iconfigly-web` File Additions & Updates

```
iconfigly-web/
├── LICENSE                                   # [NEW] Apache-2.0 License
├── README.md                                 # [UPDATED] Frontend architecture, proxy design, and Playwright E2E instructions
├── src/
│   ├── app/
│   │   └── (dashboard)/
│   │       └── layout.tsx                    # [UPDATED] Renders DemoPersonaBanner at top of screen when demo_mode is active
│   └── components/
│       └── layout/
│           └── DemoPersonaBanner.tsx         # [NEW] 1-click switcher between Alice (Admin), Bob (Payments Lead), Charlie (Dev), Diana (QA)
└── .github/
    └── workflows/
        ├── ci.yml                            # [UPDATED] Runs ESLint, tsc --noEmit, Next.js standalone build, and Playwright E2E suite
        └── release.yml                       # [NEW] Multi-arch Buildx push of iconfigly-web to GHCR with SBOM & Cosign signature
```

### 5.4 `iconfigly-cli`, `iconfigly-operator` & SDK Repositories (`sdk-js`, `sdk-go`, `sdk-java`)

```
iconfigly-cli/
├── LICENSE                                   # [NEW] Apache-2.0 License
├── README.md                                 # [NEW] Installation guide (GitHub Releases, Docker, Go install) & command reference
├── .goreleaser.yaml                          # [NEW] Cross-compiles linux/windows/darwin (amd64/arm64), archives, and SHA-256 checksums
├── internal/
│   └── cmd/
│       └── version.go                        # [NEW] iconfigly version command printing Version, Commit, OS/Arch, and API compatibility
└── .github/
    └── workflows/
        ├── ci.yml                            # [NEW] go vet, golangci-lint, and unit tests
        └── release.yml                       # [NEW] Runs goreleaser/goreleaser-action on v* tags

iconfigly-operator/
├── LICENSE                                   # [NEW] Apache-2.0 License
├── README.md                                 # [NEW] CRD specification and Kubernetes installation guide
└── .github/
    └── workflows/
        ├── ci.yml                            # [NEW] Controller unit tests & CRD manifest verification
        └── release.yml                       # [NEW] Multi-arch GHCR image build + bundled install.yaml release asset

iconfigly-sdk-js/, iconfigly-sdk-go/, iconfigly-sdk-java/
├── LICENSE                                   # [NEW] Apache-2.0 License in each SDK repository
├── README.md                                 # [NEW] Quickstart, heartbeat configuration, and code examples per language
└── .github/
    └── workflows/
        ├── ci.yml                            # [NEW] Language-specific test suite (node:test, go test, mvn test)
        └── release.yml                       # [NEW] Publishes tagged release to npm / GitHub Packages / Maven
```

### 5.5 `iconfigly-docs` Complete Documentation Portal Tree

```
iconfigly-docs/
├── LICENSE                                   # [NEW] Apache-2.0 License
├── README.md                                 # [UPDATED] Master Landing Page with Architecture Overview, 60-Second Demo & Phase Index
├── PROJECT_MASTER_PLAN.md                    # Master Architecture Overview
├── PHASE_01_FOUNDATION.md                    # Phase 1 Engineering Blueprint
├── PHASE_02_CHANGE_SAFETY_CORE.md            # Phase 2 Engineering Blueprint
├── PHASE_03_OPENBAO_AND_DYNAMIC_LEASES.md    # Phase 3 Engineering Blueprint
├── PHASE_04_CLI_SDKS_AND_ROLLOUT_TRACKING.md # Phase 4 Engineering Blueprint
├── PHASE_05_KUBERNETES_HELM_AND_OPERATOR.md  # Phase 5 Engineering Blueprint
├── PHASE_06_ENTERPRISE_IDENTITY_AND_INTEGRATIONS.md # Phase 6 Engineering Blueprint
├── PHASE_07_HARDENING_OBSERVABILITY_AND_SCALE.md    # Phase 7 Engineering Blueprint
├── PHASE_08_LAUNCH_PACKAGING_AND_PORTFOLIO.md       # [THIS DOCUMENT] Phase 8 Engineering Blueprint
├── guides/
│   ├── QUICKSTART_60_SECONDS.md              # [NEW] Step-by-step evaluator walkthrough using compose.demo.yaml
│   ├── SELF_HOSTING_PRODUCTION.md            # [NEW] Production deployment guide (Docker Compose & Kubernetes Helm + TLS + Backups)
│   ├── CLI_AND_SDK_INTEGRATION.md            # [NEW] Developer guide for iconfigly-cli and Node.js, Go, and Spring Boot SDKs
│   └── PORTFOLIO_CASE_STUDY.md               # [NEW] Engineering narrative, interview Q&A, and 5-minute demo script
└── .github/
    └── workflows/
        └── deploy-pages.yml                  # [NEW] Publishes documentation site & interactive OpenAPI viewer to GitHub Pages
```

---

## 6. Sub-Phase 8.0: Deterministic Demo Sandbox Seeder & Persona Switcher (`internal/seed` & `compose.demo.yaml`)

### 6.1 Why the Demo Sandbox Is Critical for Open-Source Adoption & Interviews

When a recruiter, engineering manager, or developer runs your project, they want to experience the **Killer Workflow** (*Change Request $\rightarrow$ Blast-Radius Impact Analysis $\rightarrow$ Separation-of-Duties Approval $\rightarrow$ Secret Rotation $\rightarrow$ Live Fleet Rollout & Mailpit Notification*) within 60 seconds of starting the containers.

### 6.2 What `internal/seed/seed.go` Pre-Populates Idempotently

Running `/app/seed --demo` inside `compose.demo.yaml` executes an idempotent transaction (safe to run multiple times) that provisions the complete **Acme Fintech (`acme-fintech`)** reference environment:

| Domain Area | Pre-Seeded Entities in `Acme Fintech` | Purpose in Live Demo |
| :--- | :--- | :--- |
| **1. Four Switchable User Personas** | • **Alice Rivera** (`alice@acme.local`, `ORG_ADMIN` / DevOps Lead)<br>• **Bob Chen** (`bob@acme.local`, `SERVICE_LEAD` of `Payments Team`)<br>• **Charlie Patel** (`charlie@acme.local`, `DEVELOPER` on `Payments Team` — has `DEV`/`QA` write, `UAT` read, **no `PROD` access**)<br>• **Diana Silva** (`diana@acme.local`, `LEAD` of `Finance Team`) | Allows instant 1-click persona switching in the UI to demonstrate RBAC denials (`403` in `PROD`), Separation of Duties (`Alice` requests $\rightarrow$ `Bob` approves), and Temporary Access leases! |
| **2. Project & 4 Environments** | Project **`Core Banking`** (`core-banking`) with `DEV` ($0$ approvals), `QA` ($0$ approvals), `UAT` ($1$ approval), and `PROD` ($2$ approvals, `is_production = true`). | Demonstrates environment promotion diffs (`UAT` vs `PROD`) and tiered approval policies. |
| **3. Six Microservices & Dependency Graph** | • `payment-service` (`Payments Team`)<br>• `refund-service` (`Payments Team`)<br>• `invoice-service` (`Finance Team`)<br>• `reconciliation-service` (`Finance Team`)<br>• `checkout-service` (`Storefront Team` — calls `payment-service` via `HTTP`)<br>• `notification-worker` (`DevOps Team` — consumes `payment-events` via `KAFKA`) | Powers the interactive **Topology Graph** and multi-hop **Blast-Radius Impact Analyzer** ($d = 1$ direct bindings and $d = 2$ transitive callers). |
| **4. Shared Infrastructure Resources & OpenBao Secrets** | In `UAT` and `PROD`:<br>• `payments-db` (`POSTGRES`, bound to `payment-service`, `refund-service`, `invoice-service`)<br>• `payment-cache` (`REDIS`, bound to `payment-service`, `checkout-service`)<br>• `payment-events` (`KAFKA`, bound to `payment-service`, `notification-worker`)<br>• Real KV v2 secrets and dynamic SQL role templates seeded in `OpenBao` | Demonstrates shared-resource blast radius: rotating `payments-db` immediately flags 3 direct services + 2 transitive callers across 3 teams! |
| **5. Ready-to-Review Change Request (`#142`)** | Pre-creates **Change Request `#142`** (`status = PENDING_APPROVAL`) requested by `Alice`: *"Rotate `payments-db` credentials in `UAT`"*, with pre-computed `RiskLevel = HIGH (Score 65)` and 5 affected services. | The evaluator can immediately click **"Switch to Bob (Payments Lead)"**, click **Approve**, click **Apply**, and watch the OpenBao rotation and Mailpit emails fire! |
| **6. Simulated Live Fleet Instances** | Inserts 6 active `instance_heartbeats` rows in `UAT` (`5 IN_SYNC` on `v14`, `1 DRIFTED` on `v13` for `invoice-service`). | Immediately showcases the **Live Fleet & Configuration Drift** indicators on the dashboard. |

### 6.3 Security Guardrail on `DemoPersonaBanner`

* The endpoint `POST /api/v1/auth/demo-switch/{personaSlug}` and the top `DemoPersonaBanner` UI component are **only** registered when `ICONFIGLY_DEMO_MODE=true`.
* In `internal/config/config.go`, if `ICONFIGLY_ENV=production` and `ICONFIGLY_DEMO_MODE=true`, `config.Load()` immediately fails with a fatal startup error, guaranteeing that demo persona switching can never be accidentally enabled in a real production deployment.

---

## 7. Sub-Phase 8.1: Multi-Arch Container Publishing (`linux/amd64`, `linux/arm64`) & OCI Helm Chart Registry

### 7.1 Container Image Matrix & Tagging Strategy

Every release workflow in `iconfigly-api`, `iconfigly-web`, and `iconfigly-operator` uses `docker/metadata-action` and `docker/build-push-action` to publish four deterministic tags per release:

| Image Repository | Published Tags on `v1.0.0` | Target Architectures | Final Image Base & Size Target |
| :--- | :--- | :--- | :--- |
| `ghcr.io/pathumsandeepa/iconfigly-api` | `1.0.0`, `1.0`, `latest`, `sha-<7char>` | `linux/amd64`, `linux/arm64` | `debian:bookworm-slim` (contains `/app/server`, `/app/worker`, `/app/seed`, CA certs; $< 45\text{ MB}$) |
| `ghcr.io/pathumsandeepa/iconfigly-web` | `1.0.0`, `1.0`, `latest`, `sha-<7char>` | `linux/amd64`, `linux/arm64` | `node:26-bookworm-slim` (Next.js `standalone` build; $< 135\text{ MB}$) |
| `ghcr.io/pathumsandeepa/iconfigly-operator` | `1.0.0`, `1.0`, `latest`, `sha-<7char>` | `linux/amd64`, `linux/arm64` | `gcr.io/distroless/static:nonroot` (static `/manager` binary; $< 25\text{ MB}$) |

### 7.2 OCI Helm Chart Publishing (`iconfigly-infra/.github/workflows/release-helm-oci.yml`)

When a release tag `v1.0.0` is pushed to `iconfigly-infra`:
1. GitHub Actions runs `helm lint ./helm/iconfigly` and verifies template rendering via `helm template`.
2. Runs `helm package ./helm/iconfigly --version 1.0.0 --app-version 1.0.0`.
3. Authenticates to GHCR using `GITHUB_TOKEN` and executes `helm push iconfigly-1.0.0.tgz oci://ghcr.io/pathumsandeepa/charts`.
4. Users worldwide can install `iconfigly` into any Kubernetes cluster with a single command:
   `helm install iconfigly oci://ghcr.io/pathumsandeepa/charts/iconfigly --version 1.0.0 --namespace iconfigly-system --create-namespace`

---

## 8. Sub-Phase 8.2: Cross-Platform CLI Release Engineering with GoReleaser (`iconfigly-cli`)

### 8.1 `.goreleaser.yaml` Specification in `iconfigly-cli`

| Section in `.goreleaser.yaml` | Configuration Details |
| :--- | :--- |
| **`builds`** | • Binary name: `iconfigly`<br>• Entrypoint: `./cmd/iconfigly/main.go`<br>• Environment: `CGO_ENABLED=0` (100% static binary with zero C library dependencies)<br>• `goos`: `["linux", "windows", "darwin"]`<br>• `goarch`: `["amd64", "arm64"]`<br>• `ldflags`: `-s -w -X github.com/PathumSandeepa/iconfigly-cli/internal/cmd.Version={{.Version}} -X github.com/PathumSandeepa/iconfigly-cli/internal/cmd.Commit={{.ShortCommit}} -X github.com/PathumSandeepa/iconfigly-cli/internal/cmd.BuildDate={{.Date}}` |
| **`archives`** | • Format: `tar.gz` for Linux/macOS, `zip` for Windows (`format_overrides`)<br>• Naming template: `iconfigly_{{.Version}}_{{.Os}}_{{.Arch}}`<br>• Bundled files: `LICENSE`, `README.md` |
| **`checksum`** | • Generates `checksums.txt` using `sha256` algorithm across all 6 platform archives. |
| **`sboms`** | • Runs `syft` on each compiled archive to attach CycloneDX SBOM files (`*.sbom.json`) to the GitHub Release. |
| **`changelog`** | • Automatically groups Conventional Commits (`feat:`, `fix:`, `perf:`, `sec:`) into structured release notes on the GitHub Release page. |

---

## 9. Sub-Phase 8.3: Polyglot SDK Versioning, Contract Verification & Package Publishing (`sdk-js`, `sdk-go`, `sdk-java`)

### 9.1 Cross-Repository Compatibility Matrix

All 9 repositories follow **Semantic Versioning 2.0.0** (`MAJOR.MINOR.PATCH`) and maintain a strict compatibility contract against the `/api/v1` OpenAPI 3.1 specification (`iconfigly-api/api/openapi.yaml`):

| Component | Version Range | Supported `iconfigly-api` Version | Wire Protocol Contract |
| :--- | :--- | :--- | :--- |
| **`iconfigly-web`** | `1.x.y` | `1.x.y` | `/api/v1/*` REST + Cookie/CSRF |
| **`iconfigly-cli`** | `1.x.y` | `>= 1.0.0, < 2.0.0` | `/api/v1/runtime/bundle`, `/api/v1/telemetry/*`, `/api/v1/projects/*` |
| **`iconfigly-operator`** | `1.x.y` | `>= 1.0.0, < 2.0.0` | `k8s.iconfigly.dev/v1alpha1` CRD + `/api/v1/runtime/bundle` + `/api/v1/k8s/reconcile-report` |
| **`iconfigly-sdk-js`** | `1.x.y` | `>= 1.0.0, < 2.0.0` | `/api/v1/runtime/bundle` (`ETag`) + `/api/v1/telemetry/heartbeat` |
| **`iconfigly-sdk-go`** | `v1.x.y` | `>= 1.0.0, < 2.0.0` | `/api/v1/runtime/bundle` (`ETag`) + `/api/v1/telemetry/heartbeat` |
| **`iconfigly-sdk-java`** | `1.x.y` | `>= 1.0.0, < 2.0.0` | `/api/v1/runtime/bundle` (`ETag`) + `/api/v1/telemetry/heartbeat` |

---

## 10. Sub-Phase 8.4: Supply-Chain Security, SBOM Generation (`Syft`) & Vulnerability Gates (`Trivy`, `gitleaks`, `govulncheck`)

### 10.1 Automated DevSecOps Pipeline Gates Across Repositories

Every pull request and release workflow enforces five automated security gates:

| Security Gate | Tool Used in GitHub Actions | What It Verifies & Blocks |
| :--- | :--- | :--- |
| **1. Secret Leak Prevention** | **`gitleaks/gitleaks-action@v2`** | Scans the entire Git commit history on every push to ensure no real API tokens, private keys, or `.env` files were ever committed. |
| **2. Go Vulnerability Reachability** | **`golang.org/x/vuln/cmd/govulncheck`** | Analyzes the Go call graph in `iconfigly-api`, `iconfigly-cli`, `iconfigly-sdk-go`, and `iconfigly-operator` against the official Go Vulnerability Database, failing the build if any vulnerable symbol is reachable. |
| **3. Container & Filesystem CVE Scan** | **`aquasecurity/trivy-action`** | Scans compiled Docker images (`iconfigly-api`, `iconfigly-web`, `iconfigly-operator`) and Helm charts for `CRITICAL` and `HIGH` OS/library vulnerabilities (`exit-code: 1` on unfixed critical CVEs). |
| **4. Software Bill of Materials (SBOM)** | **`anchore/sbom-action` (`Syft`)** | Generates a CycloneDX JSON SBOM (`sbom.cdx.json`) for every container image and CLI release and attaches it as a downloadable release asset. |
| **5. Keyless Cryptographic Signing** | **`sigstore/cosign-installer`** | Signs the pushed GHCR container image digests using GitHub Actions OIDC (`cosign sign --yes ghcr.io/pathumsandeepa/iconfigly-api@sha256:...`) so users can verify image authenticity with `cosign verify`. |

---

## 11. Sub-Phase 8.5: Open-Source Governance, Apache-2.0 Licensing & Community Templates

### 11.1 Standard Open-Source Governance Files in Every Repository

| File Path | Purpose & Contents |
| :--- | :--- |
| `LICENSE` | Full text of the **Apache License, Version 2.0** (`Copyright 2026 Pathum Sandeepa & iconfigly Contributors`). |
| `SECURITY.md` | Explains the security model (Control Plane vs. OpenBao Secret Engine, Argon2id, AES-256-GCM keyring, SHA-256 hash-chained audit logs) and provides instructions for reporting security vulnerabilities privately via GitHub Security Advisories. |
| `CONTRIBUTING.md` | Explains the 100% containerized Windows 11 / WSL2 / Linux / macOS developer workflow, the 4-layer DDD package structure (`domain.go`, `repository.go`, `service.go`, `handler.go`), Conventional Commits (`feat:`, `fix:`, `docs:`), and how to run unit/integration tests inside Docker. |
| `CODE_OF_CONDUCT.md` | Contributor Covenant v2.1 Code of Conduct. |
| `.github/ISSUE_TEMPLATE/bug_report.yml` & `feature_request.yml` | Structured GitHub Issue forms capturing `iconfigly` version, deployment method (`Docker Compose` vs `Kubernetes Helm`), and reproduction steps. |
| `.github/pull_request_template.md` | Checklist verifying unit tests, migration `.up.sql`/`.down.sql` pairs, RBAC enforcement, and audit log coverage. |

---

## 12. Sub-Phase 8.6: Public Documentation Site & Interactive OpenAPI 3.1 Explorer (`iconfigly-docs`)

### 12.1 Documentation Portal Structure (`iconfigly-docs`)

`iconfigly-docs` is organized so it reads cleanly both directly inside GitHub's Markdown viewer AND as a static documentation site published to GitHub Pages (`.github/workflows/deploy-pages.yml`):

1. **Home / Overview (`README.md`):**
   * Hero architecture diagram, feature matrix, competitor comparison (`Backstage`, `OpenBao`, `Argo CD`, `Doppler`), and the **60-Second Evaluator Quickstart** (`docker compose -f compose.demo.yaml up -d`).
2. **Engineering Blueprints (`PHASE_01` through `PHASE_09`):**
   * Complete phase-by-phase architectural specifications, ADRs (`ADR-001` to `ADR-071`), ERDs, and sequence diagrams.
3. **Operator & Self-Hosting Guides (`guides/SELF_HOSTING_PRODUCTION.md`):**
   * Production checklist: setting `ICONFIGLY_MASTER_KEY`, configuring OpenBao, setting up OIDC/SSO, enabling Prometheus & Grafana, and scheduling `./scripts/backup-postgres.sh`.
4. **Interactive OpenAPI 3.1 Reference:**
   * Embeds Scalar / Swagger UI rendering `iconfigly-api/api/openapi.yaml` so developers can browse all 90+ REST endpoints, inspect request/response JSON schemas, and view RFC 9457 error codes in their browser.

---

## 13. Sub-Phase 8.7: Technical Portfolio Case Study, System Design Narrative & 5-Minute Demo Script

### 13.1 How to Pitch `iconfigly` in Technical Interviews (The 60-Second Elevator Pitch)

> *"In enterprise microservice architectures, configuration and credential changes are one of the leading causes of production outages—not because teams lack a secret vault, but because there is a disconnect between **infrastructure resources**, **service dependencies**, and **team ownership**. When DevOps rotates a shared database credential or updates a configuration in UAT or PROD, they often don't know which 4 downstream services and 3 teams will be impacted, or whether all running pods actually picked up the new version.*
>
> *I built **iconfigly**—an open-source, self-hosted Change-Safety and Access Control Plane written in Go, Next.js, and PostgreSQL 18, integrated with OpenBao and Kubernetes. Instead of storing plaintext passwords in the database, `iconfigly` models the full service-to-resource dependency graph, computes real-time blast-radius impact using recursive SQL CTEs, enforces multi-approver separation of duties, rotates credentials in OpenBao, tracks live rollout convergence and drift across polyglot SDKs and a Kubernetes Operator, and notifies every affected team via a PostgreSQL Transactional Outbox."*

### 13.2 The 5-Minute Live Demo Script (For Video Recording & Live Interviews)

| Timestamp | Screen / Terminal Action | Architectural Highlight You Point Out |
| :--- | :--- | :--- |
| **0:00 – 0:45** | **1. Single-Pane Service Context & Topology Graph:**<br>Open `Core Banking` $\rightarrow$ `payment-service` in `UAT` and switch to the **Topology Graph**. | Show how `payments-db` (`POSTGRES`), `payment-cache` (`REDIS`), and `payment-events` (`KAFKA`) are bound across multiple microservices owned by `Payments Team`, `Finance Team`, and `Storefront Team`. |
| **0:45 – 1:45** | **2. Live Blast-Radius Impact Analysis & Separation of Duties:**<br>As `Alice` (DevOps), open **Change Request `#142`** (rotating `payments-db` in `UAT`). Show the **Blast-Radius Impact Card** (`3 Direct Services`, `2 Transitive Callers`, `3 Affected Teams`, `Risk: HIGH`). Try clicking **Approve** as Alice and show the `403 Separation of Duties` guardrail. | Explain the PostgreSQL `WITH RECURSIVE` CTE graph traversal ($d \le 5$), the deterministic Risk Score formula, and why `approver != requester` is enforced in the domain layer. |
| **1:45 – 2:45** | **3. Approval, OpenBao Rotation & Transactional Outbox Delivery:**<br>Click **"Switch to Bob (Payments Lead)"** in the Demo Banner, approve Change `#142`, and click **Apply Change**. Open **Mailpit (`:8025`)** and the In-App Notification bell to show instant blast-radius alerts delivered to all 3 affected teams. | Explain the Hexagonal `SecretProvider` port calling **OpenBao KV v2** (`v1` $\rightarrow$ `v2`), and how the `outbox_events` row was committed in the same `TxManager.WithTx` transaction and processed via `FOR UPDATE SKIP LOCKED`. |
| **2:45 – 3:45** | **4. Zero-Disk CLI (`iconfigly run`) & Live Rollout/Drift Tracking:**<br>Run `iconfigly run --project core-banking --service payment-service --env uat -- env` in the terminal. Show the **Rollout Progress Bar** on the Change Request updating live as instances send heartbeats, while flagging a stuck `v1` instance as `DRIFTED`. | Highlight how `GET /api/v1/runtime/bundle` uses SHA-256 `ETag` conditional caching (`304 Not Modified` in $< 2\text{ms}$) and injects secrets into child process memory via `os/exec` with zero `.env` files written to disk. |
| **3:45 – 4:30** | **5. Time-Boxed Dynamic Database Lease (`OpenBao`):**<br>Switch to `Charlie` (Developer, denied in `PROD`). Request 30-minute `VIEWER` access to `payments-db` in `PROD`. Approve as `Alice`, click **View Ephemeral Credentials**, and show the temporary OpenBao PostgreSQL username (`v-token-readonly-...`) with a live countdown timer. | Explain how `ExpiryWorker` revokes the lease in OpenBao (`/v1/sys/leases/revoke`), which automatically runs `DROP ROLE` in PostgreSQL when the timer expires. |
| **4:30 – 5:00** | **6. Cryptographic Audit Trail & Grafana/Tempo Observability:**<br>Open `/audit` and click **Verify Hash Chain Integrity** (`100% Verified`), then briefly show the **Grafana SRE Dashboard (`:3001`)** with the OpenTelemetry trace waterfall. | Conclude with the PostgreSQL immutability trigger (`trg_audit_logs_immutable`), SHA-256 hash chain, and `k6` benchmark results ($>1,000\text{ RPS}$, $p_{95} < 15\text{ms}$). |

---

## 14. Sub-Phase 8.8: Comprehensive Release Verification & Phase 8 Launch Checklist

### 14.1 Phase 8 Testing & Release Verification Matrix

| Verification Target | Command / Workflow | Pass Criteria |
| :--- | :--- | :--- |
| **1. Idempotent Demo Seeder Test** | `go test -v ./internal/seed/...` | Running `seed.RunDemoSeed(ctx)` twice in a row against PostgreSQL 18 succeeds with zero duplicate key errors and produces the exact expected counts of services, bindings, and change requests. |
| **2. Zero-Build Sandbox Smoke Test** | `docker compose -f compose.demo.yaml up -d` | Starts from a clean Docker state without needing local source code mounts, runs migrations + OpenBao init + demo seeder, and serves `http://localhost:3000` ready to use in $< 60\text{ seconds}$. |
| **3. Multi-Arch Container &Helm Build Test** | `docker buildx build --platform linux/amd64,linux/arm64 ...` & `helm lint ./helm/iconfigly` | Both architectures compile cleanly for `api`, `web`, and `operator`, and `helm template` renders valid Kubernetes manifests with zero warnings. |
| **4. GoReleaser Snapshot Test** | `goreleaser release --snapshot --clean` (inside `iconfigly-cli`) | Produces all 6 OS/Arch binaries (`linux`, `windows`, `darwin` $\times$ `amd64`, `arm64`) and `checksums.txt` in `dist/`. |
| **5. Security & Supply-Chain Gate** | `gitleaks detect` + `govulncheck ./...` + `trivy image` | Zero leaked secrets across all 9 repositories, zero reachable Go vulnerabilities, and valid CycloneDX SBOM files generated. |

### 14.2 End-to-End Phase 8 Definition of Done Checklist

To mark Phase 8 (`v1.0.0` Public Launch) 100% complete, verify the following milestones:

* [ ] **Step 1 (Apache-2.0 Governance Across All 9 Repos):** Every repository in `PathumSandeepa/iconfigly-*` contains `LICENSE` (Apache-2.0), `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, and `.github/workflows/ci.yml`.
* [ ] **Step 2 (60-Second Evaluator Sandbox):** Running `docker compose -f compose.demo.yaml up -d` boots the complete platform, seeds the `Acme Fintech` dataset, and allows switching between `Alice`, `Bob`, `Charlie`, and `Diana` in one click via the Demo Persona Banner.
* [ ] **Step 3 (Multi-Arch GHCR Container & OCI Helm Release):** Pushing tag `v1.0.0` publishes signed multi-arch images (`iconfigly-api`, `iconfigly-web`, `iconfigly-operator`) and the OCI Helm chart (`oci://ghcr.io/pathumsandeepa/charts/iconfigly:1.0.0`) to GitHub Container Registry.
* [ ] **Step 4 (GoReleaser CLI & Polyglot SDK Releases):** Tagging `v1.0.0` in `iconfigly-cli`, `iconfigly-sdk-js`, `iconfigly-sdk-go`, and `iconfigly-sdk-java` publishes cross-platform CLI binaries with SHA-256 checksums and versioned SDK packages.
* [ ] **Step 5 (Public Documentation Portal & Portfolio Case Study):** `iconfigly-docs` is live on GitHub Pages with all phase blueprints, the interactive OpenAPI 3.1 explorer, and `guides/PORTFOLIO_CASE_STUDY.md`.
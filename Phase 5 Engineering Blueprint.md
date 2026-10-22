# iconfigly — Phase 5 Engineering Blueprint: Kubernetes Native Deployment (`kind` + Helm), Cluster Workload Inspector & `iconfigly-operator`

> **Document Scope:** Phase 5 Complete Engineering Plan (Sub-Phase 5.0 to Sub-Phase 5.8)
>
> **Architectural Paradigm:** Domain-Driven Design (DDD) + Clean Architecture + Kubernetes Controller Pattern (Declarative Desired State vs. Actual Cluster State Reconciliation)
>
> **Target Reader:** Full-Stack Engineer (strong in TypeScript, Next.js, React, SQL, and Docker; learning Kubernetes, Helm charts, Custom Resource Definitions, and Go Kubernetes Operators from first principles)
>
> **Runtime Environment:** Windows 11 + WSL2 + Docker Desktop + `kind` (Kubernetes-in-Docker, 100% local execution, $\$0$ cloud cost)

---

## Table of Contents

1. [Phase 5 Executive Summary & Scope](#1-phase-5-executive-summary--scope)
2. [Kubernetes, Helm & Operator Primer for Full-Stack Engineers](#2-kubernetes-helm--operator-primer-for-full-stack-engineers)
3. [Phase 5 Architectural Decisions & Rationale (ADRs)](#3-phase-5-architectural-decisions--rationale-adrs)
4. [Phase 5 DDD Bounded Contexts & Operator Reconciliation Flows](#4-phase-5-ddd-bounded-contexts--operator-reconciliation-flows)
5. [Complete Phase 5 Folder & File Evolution Across Active Repositories](#5-complete-phase-5-folder--file-evolution-across-active-repositories)
6. [Sub-Phase 5.0: Multi-Stage Production Dockerfiles & Local `kind` Cluster (`iconfigly-infra`)](#6-sub-phase-50-multi-stage-production-dockerfiles--local-kind-cluster-iconfigly-infra)
7. [Sub-Phase 5.1: Relational Data Model & Database Migrations (`000020`–`000021`)](#7-sub-phase-51-relational-data-model--database-migrations-000020000021)
8. [Sub-Phase 5.2: Kubernetes Cluster & Workload Bounded Context (`internal/k8s`)](#8-sub-phase-52-kubernetes-cluster--workload-bounded-context-internalk8s)
9. [Sub-Phase 5.3: Production Helm Chart Architecture (`iconfigly-infra/helm/iconfigly`)](#9-sub-phase-53-production-helm-chart-architecture-iconfigly-infrahelmiconfigly)
10. [Sub-Phase 5.4: Custom Resource Definition (`ServiceConfigBinding`) & Operator Bootstrap (`iconfigly-operator`)](#10-sub-phase-54-custom-resource-definition-serviceconfigbinding--operator-bootstrap-iconfigly-operator)
11. [Sub-Phase 5.5: Operator Reconciliation Loop, `ConfigMap`/`Secret` Sync & Rolling Restarts](#11-sub-phase-55-operator-reconciliation-loop-configmapsecret-sync--rolling-restarts)
12. [Sub-Phase 5.6: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 5)](#12-sub-phase-56-nextjs-web-dashboard-architecture--ui-iconfigly-web-phase-5)
13. [Sub-Phase 5.7: Comprehensive Testing Strategy & Phase 5 Verification Checklist](#13-sub-phase-57-comprehensive-testing-strategy--phase-5-verification-checklist)

---

## 1. Phase 5 Executive Summary & Scope

### 1.1 Phase 5 Objective

In Phase 4, microservices gained the ability to pull configurations and report heartbeats using `iconfigly-cli` or our language SDKs (`js`, `go`, `java`). However, in modern cloud-native organizations running **Kubernetes**, platform teams often want legacy or third-party microservices to receive their configurations and OpenBao secrets **automatically via native Kubernetes `ConfigMap` and `Secret` objects**—without modifying a single line of application code or importing an SDK!

Phase 5 solves both **Platform Self-Hosting on Kubernetes** and **Zero-Code Workload Synchronization**:

1. **Self-Hosting `iconfigly` on Kubernetes via Helm (`iconfigly-infra/helm/iconfigly`):** Packages the entire `iconfigly` platform (`api`, `worker`, `web`, `postgres`, `openbao`) into a production-grade **Helm Chart** deployed and tested locally inside a zero-cost **`kind` (Kubernetes-in-Docker)** cluster running on your Windows 11 + WSL2 machine.
2. **The `iconfigly-operator` (`ServiceConfigBinding` CRD):** Activates the 9th and final repository in our ecosystem. Running inside the Kubernetes cluster, `iconfigly-operator` watches `ServiceConfigBinding` Custom Resources, polls `GET /api/v1/runtime/bundle` using lightweight `ETag` conditional requests, atomically creates/updates native Kubernetes `ConfigMap` and `Secret` objects, optionally triggers zero-downtime Kubernetes `Deployment` rolling restarts when a Change Request is applied, and reports **Replica & Pod Configuration Drift** (`expected: v15, 3/3 ready replicas` vs `actual: v14, 2/3 ready replicas`) back to `iconfigly-api`!

### 1.2 Repository Activation in Phase 5 (All 9 Repositories Now Active)

Phase 5 activates **`iconfigly-operator`**, completing the activation of all 9 repositories in the `PathumSandeepa/iconfigly` ecosystem:

| Repository | Phase 5 Status | Role in Phase 5 |
| :--- | :--- | :--- |
| **`iconfigly-infra`** | **Active** | Adds `kind/kind-cluster.yaml` (local multi-node K8s cluster), `helm/iconfigly/` (production Helm chart), and `k8s-tools` Docker Compose profile (`kubectl`, `helm`, `kind`, `kubebuilder`). |
| **`iconfigly-api`** | **Active** | Adds production multi-stage `Dockerfile`, migrations `000020`–`000021`, and `internal/k8s` bounded context (cluster registration, workload binding registry, operator reconcile ingestion, and CRD manifest generator). |
| **`iconfigly-web`** | **Active** | Adds production standalone `Dockerfile`, Kubernetes Clusters & Workloads UI, CRD YAML 1-Click Generator Drawer, and Replica Drift indicators (`2 / 3 Pods Ready`). |
| **`iconfigly-operator`** | **Activated in Phase 5** | Go 1.27.2 Kubernetes Operator (`controller-runtime`) reconciling `ServiceConfigBinding` CRDs into native `ConfigMap` and `Secret` objects, triggering rolling restarts, and reporting cluster drift. |
| **`iconfigly-cli`** | **Active (Phase 4)** | Adds `iconfigly k8s generate-binding` helper command to output `ServiceConfigBinding` YAML from the terminal. |
| **`iconfigly-sdk-js`** | **Active (Phase 4)** | Unchanged; works alongside or independently of the Operator. |
| **`iconfigly-sdk-go`** | **Active (Phase 4)** | Unchanged; works alongside or independently of the Operator. |
| **`iconfigly-sdk-java`** | **Active (Phase 4)** | Unchanged; works alongside or independently of the Operator. |
| **`iconfigly-docs`** | **Active** | Phase 5 engineering blueprint, Helm deployment guide, and Operator CRD reference. |

### 1.3 Scope Boundaries for Phase 5

| In Scope for Phase 5 | Out of Scope for Phase 5 (Deferred to Later Phases) |
| :--- | :--- |
| Multi-stage production `Dockerfile`s for `iconfigly-api` (`server` + `worker`), `iconfigly-web` (Next.js standalone), and `iconfigly-operator` | OIDC / Single Sign-On (SSO), GitHub repository/PR webhooks, and Slack/Teams rich notifications (Phase 6) |
| Local Kubernetes cluster via `kind` (`kind/kind-cluster.yaml`) running inside Docker Desktop on Windows 11 + WSL2 at $\$0$ cost | Argo CD external application sync status integration (Phase 6) |
| Complete Helm chart (`helm/iconfigly`) deploying `api`, `worker`, `web`, `postgres`, `openbao`, and `operator` with Ingress and readiness probes | Prometheus `/metrics` scraping, Grafana dashboards, OpenTelemetry tracing, and `k6` load testing (Phase 7) |
| `iconfigly-operator` with `ServiceConfigBinding` CRD (`k8s.iconfigly.dev/v1alpha1`), `ConfigMap`/`Secret` sync, and annotation-driven `Deployment` rolling restarts | Automated multi-arch image publishing to GitHub Container Registry (GHCR) and Helm chart repository hosting (Phase 8) |
| Cluster registration, workload bindings, and Replica + Version Drift detection (`internal/k8s` in `iconfigly-api` & `iconfigly-web`) | |

---

## 2. Kubernetes, Helm & Operator Primer for Full-Stack Engineers

Because Phase 5 introduces Kubernetes and the Operator pattern, here is a plain-English mental model mapping every Kubernetes concept directly to Docker Compose and Full-Stack concepts you already know:

### 2.1 Docker Compose vs. Kubernetes Concepts

| Concept | In Docker Compose (Phases 1–4) | In Kubernetes (Phase 5) | Plain-English Role in `iconfigly` |
| :--- | :--- | :--- | :--- |
| **Running Container Instance** | A single container (`iconfigly-api`) | **`Pod`** | The smallest deployable unit in K8s (wraps 1 container and gives it an internal IP). |
| **Scaling & Auto-Healing** | `restart: always` on 1 container | **`Deployment`** | Manages $N$ identical `Pod` replicas (e.g., `replicas: 3`). If a Pod crashes, the `Deployment` controller immediately spawns a replacement Pod. |
| **Stateful Database** | `postgres` service + named volume | **`StatefulSet` + `PersistentVolumeClaim (PVC)`** | Like a `Deployment`, but guarantees stable disk storage and network identity for `postgres` and `openbao`. |
| **Internal Networking** | Service hostname (`http://api:8080`) | **`Service` (`ClusterIP`)** | Gives a group of `Pod` replicas a single stable internal DNS name and load-balances traffic across healthy Pods. |
| **External HTTP Routing** | `ports: ["3000:3000"]` | **`Ingress`** | Routes external browser traffic (e.g., `http://iconfigly.local`) to the internal `web` and `api` Kubernetes Services. |
| **Non-Secret Env Vars** | `environment:` block in `compose.yaml` | **`ConfigMap`** | A Kubernetes object storing non-secret key-value pairs (`LOG_LEVEL=info`, `PAYMENTS_DB_HOST=postgres`) that Pods mount as environment variables. |
| **Secret Env Vars** | `.env` file | **`Secret`** | A Kubernetes object storing sensitive key-value pairs (`DB_PASSWORD`, `REDIS_AUTH_TOKEN`) mounted into Pods. |
| **Multi-Container App Template** | `compose.yaml` + `.env` | **`Helm Chart` (`Chart.yaml` + `values.yaml`)** | **Helm** is the "npm / package manager for Kubernetes." A Helm Chart bundles all YAML files (`Deployment`, `Service`, `Ingress`) into one parameterized package installed via `helm install iconfigly ./helm/iconfigly`. |

### 2.2 What Is a Kubernetes Operator & Why Is It So Impressive?

By default, Kubernetes knows how to manage built-in objects like `Deployment`, `Pod`, `ConfigMap`, and `Secret`.

1. **Custom Resource Definition (CRD):** Kubernetes lets you teach its API a brand-new object type! In Phase 5, we register a CRD called **`ServiceConfigBinding`**. A developer can apply a 12-line YAML file saying: *"Bind Kubernetes Deployment `payment-service` to `iconfigly` project `core-banking`, service `payment-service`, environment `uat`."*
2. **The Operator (`iconfigly-operator`):** An Operator is a small Go program running inside the cluster that runs an infinite **Reconcile Loop** ($\text{Actual Cluster State} \rightarrow \text{Desired Control Plane State}$):
   * It watches every `ServiceConfigBinding` in the cluster.
   * It asks `iconfigly-api`: *"What is the latest approved `RuntimeBundle` for `payment-service` in `uat`?"*
   * It creates or updates the native Kubernetes `ConfigMap` (`payment-service-config`) and `Secret` (`payment-service-secrets`).
   * If a Change Request just rotated a database password from `v1` to `v2`, the Operator updates the Kubernetes `Secret` and triggers a zero-downtime rolling restart of the `payment-service` `Deployment` so the new Pods boot with the new password automatically!

---

## 3. Phase 5 Architectural Decisions & Rationale (ADRs)

| Decision ID | Area | Chosen Solution | Why Chosen | Alternatives Rejected & Why |
| :--- | :--- | :--- | :--- | :--- |
| **ADR-040** | **Local Kubernetes Runtime** | **`kind` (Kubernetes-in-Docker) Multi-Node Cluster on WSL2 / Docker Desktop** | `kind` runs real upstream Kubernetes nodes as lightweight Docker containers using zero cloud budget ($\$$0) and starts in $< 45$ seconds on Windows 11 + WSL2. | **Cloud EKS / GKE / AKS clusters:** Costs $\$70\text{–}\$150/\text{month}$ and requires cloud billing accounts. **Heavy VM-based Minikube:** Consumes excessive RAM on Windows laptops. |
| **ADR-041** | **API vs. Worker Separation in K8s** | **Independent `Deployment`s for `iconfigly-api` (`/app/server`) and `iconfigly-worker` (`/app/worker`) from One Image** | In Docker Compose dev, running the worker embedded inside `api` saves RAM. In Kubernetes (`helm/iconfigly`), running 2 replicas of `deployment-api` and 2 replicas of `deployment-worker` (built into the same Docker image from `cmd/server` and `cmd/worker`) proves true cloud-native horizontal scaling! | **Building two separate Docker images for API and Worker:** Doubles image build times and storage for identical Go dependencies. |
| **ADR-042** | **Next.js Production Container** | **Next.js `output: "standalone"` Multi-Stage Build (`node:26-bookworm-slim`)** | `output: "standalone"` traces only the exact files needed for production and produces a self-contained `server.js` image under $140\text{ MB}$ without shipping dev dependencies. | **Running `npm run dev` in Kubernetes:** High memory consumption, slow cold starts, and unsuitable for production probes. |
| **ADR-043** | **Operator Framework** | **`sigs.k8s.io/controller-runtime` (`v0.20+`) in Go 1.27.2** | `controller-runtime` is the official Kubernetes SIG-Machinery library underlying `kubebuilder` and `operator-sdk`. Writing the controller cleanly on top of `controller-runtime` keeps `iconfigly-operator` lean, idiomatic, and testable with `envtest`. | **Raw `client-go` informers with manual workqueues:** Requires hundreds of lines of boilerplate queue/cache synchronization code. |
| **ADR-044** | **Operator-to-API Sync Protocol** | **Pull-Based Reconciliation via `GET /api/v1/runtime/bundle` (`If-None-Match` ETag) + `POST /api/v1/k8s/reconcile-report`** | Reuses the exact atomic `RuntimeBundle` + `ETag` engine built in Phase 4! The Operator initiates all outbound HTTPS connections to `iconfigly-api`, meaning `iconfigly-api` **never** needs inbound firewall access or cluster-admin credentials into remote Kubernetes clusters. | **`iconfigly-api` pushing directly to remote K8s cluster API servers:** Security anti-pattern requiring the control plane to store powerful external `kubeconfig` cluster-admin tokens. |
| **ADR-045** | **Workload Rolling Restart Mechanism** | **Deterministic Pod Template Annotation Patch (`iconfigly.dev/bundle-etag`)** | Kubernetes `Deployment`s do not automatically restart Pods when a mounted `ConfigMap` or `Secret` changes. By patching `spec.template.metadata.annotations["iconfigly.dev/bundle-etag"] = bundle.ETag` on the target `Deployment` (when `autoRolloutRestart: true`), Kubernetes natively orchestrates a surge/unavailable rolling update! | **Deleting Pods manually from the Operator:** Dangerous; bypasses `Deployment` `maxUnavailable` budgets and causes service downtime. |
| **ADR-046** | **Orphaned Key Prevention** | **Full Data Map Replacement + `controllerutil.SetControllerReference` Owner References** | Setting the `ServiceConfigBinding` as the Kubernetes `OwnerReference` on the generated `ConfigMap` and `Secret` ensures Kubernetes garbage-collects them automatically if the `ServiceConfigBinding` is deleted. | **Leaving unmanaged `ConfigMap`/`Secret` objects behind on deletion:** Causes secret sprawl and stale credentials in the cluster. |
| **ADR-047** | **Cluster & Replica Drift Detection** | **Dual-Dimension K8s Drift ($\text{BundleETagDrift} \lor \text{ReplicaReadinessDrift}$)** | In Kubernetes, a rollout is only truly healthy when *both* the Pod template carries the expected `bundle_etag` AND `status.updatedReplicas == spec.replicas` and `status.readyReplicas == spec.replicas`. If a new config causes a `CrashLoopBackOff`, `readyReplicas < desiredReplicas` immediately flags the rollout as `DRIFTED`! | **Checking only whether the `ConfigMap` was updated:** A broken config that crashes Pods on startup would falsely report "100% Updated" if Pod readiness were ignored. |
| **ADR-048** | **Operator Testing Strategy** | **Controller Unit Tests (`fake.Client`) + `kind` End-to-End Reconciliation Verification** | Combining fast in-memory `controller-runtime` fake client tests (`reconciler_test.go`) with a real `kind` deployment test gives <1s unit feedback while proving real Kubernetes `Deployment` rolling updates work end to end. | **Testing only with mocks:** Misses Kubernetes RBAC (`ClusterRole` / `Role`) permission issues. |

---

## 4. Phase 5 DDD Bounded Contexts & Operator Reconciliation Flows

### 4.1 Phase 5 Cloud-Native Architecture & Reconciliation Topology

```
flowchart TD
    subgraph K8sCluster["Kubernetes Cluster (kind Local / Production EKS/GKE)"]
        subgraph IconfiglyNS["Namespace: iconfigly-system (Installed via Helm)"]
            WebPod["Deployment: iconfigly-web\n(2 Replicas)"]
            APIPod["Deployment: iconfigly-api\n(2 Replicas - cmd/server)"]
            WrkPod["Deployment: iconfigly-worker\n(2 Replicas - cmd/worker)"]
            PGPod[("StatefulSet: iconfigly-postgres\n(PostgreSQL 18 + PVC)")]
            BaoPod["StatefulSet: iconfigly-openbao\n(OpenBao Server)"]
            OpPod["Deployment: iconfigly-operator\n(Reconciles ServiceConfigBindings)"]
        end

        subgraph AppNS["Namespace: payments-uat (Target Microservice Workloads)"]
            CRD["CRD: ServiceConfigBinding\n(payment-service-uat)"]
            CM["ConfigMap: payment-service-config\n(Managed by Operator)"]
            Sec["Secret: payment-service-secrets\n(Managed by Operator)"]
            AppDep["Deployment: payment-service\n(3 Pod Replicas mounting CM & Secret)"]
        end
    end

    WebPod -->|"Internal K8s Service\nhttp://iconfigly-api:8080"| APIPod
    APIPod --> PGPod
    APIPod --> BaoPod
    WrkPod --> PGPod
    WrkPod --> BaoPod

    OpPod -->|"1. Watches CRD & Deployment"| CRD
    OpPod -->|"2. GET /api/v1/runtime/bundle\n(If-None-Match: ETag)"| APIPod
    OpPod -->|"3. Upserts ConfigMap & Secret\n(OwnerReference = CRD)"| CM
    OpPod -->|"3. Upserts Secret"| Sec
    OpPod -->|"4. Patches Pod Template Annotation\n(iconfigly.dev/bundle-etag)"| AppDep
    AppDep -->|"Mounts"| CM
    AppDep -->|"Mounts"| Sec
    OpPod -->|"5. POST /api/v1/k8s/reconcile-report\n(Replica & Pod Rollout State)"| APIPod
```

### 4.2 Sequence Flow: Change Request Applied $\rightarrow$ Operator Syncs `ConfigMap`/`Secret` $\rightarrow$ Rolling Restart & Convergence

```
sequenceDiagram
    actor Lead as Service Lead (Browser)
    participant API as iconfigly-api (change + runtime + k8s)
    participant Op as iconfigly-operator (Reconciler)
    participant K8s as Kubernetes API Server
    participant Pods as payment-service Pods (3 Replicas)

    Lead->>API: 1. POST /change-requests/{id}/apply (Rotates payments-db secret v1 -> v2 in UAT)
    API->>API: Rotate in OpenBao, update secret_refs (v2), initialize service_rollouts (status=IN_PROGRESS)
    API-->>Lead: 200 OK (New Bundle ETag = "sha256:9f8e...")

    loop Every 15s (or Webhook/Watch Trigger)
        Op->>K8s: Read ServiceConfigBinding "payment-service-uat"
        Op->>API: 2. GET /api/v1/runtime/bundle?project=core-banking&service=payment-service&env=uat&resolve_secrets=true (If-None-Match: "sha256:old...")
        API-->>Op: 200 OK (New Bundle ETag="sha256:9f8e...", Configs, Resources, Secrets v2)

        Op->>K8s: 3. CreateOrUpdate ConfigMap "payment-service-config" & Secret "payment-service-secrets"
        K8s-->>Op: Updated (Annotated with iconfigly.dev/bundle-etag="sha256:9f8e...")

        Op->>K8s: 4. Patch Deployment "payment-service" spec.template.metadata.annotations["iconfigly.dev/bundle-etag"] = "sha256:9f8e..."
        K8s->>Pods: Trigger Rolling Update (Terminates v1 Pods 1-by-1, starts v2 Pods)

        Op->>K8s: 5. Inspect Deployment Status (desired=3, updated=2, ready=2)
        Op->>API: POST /api/v1/k8s/reconcile-report (synced_etag="sha256:9f8e...", desired=3, updated=2, ready=2)
        API->>API: Update kubernetes_workload_bindings & service_rollouts (2 / 3 instances updated = 66%)
    end

    Note over K8s,Pods: All 3 Pods reach Ready state with ETag "sha256:9f8e..."
    Op->>API: 6. POST /api/v1/k8s/reconcile-report (desired=3, updated=3, ready=3)
    API->>API: Mark service_rollouts status = 'COMPLETED' (100%) & kubernetes_workload_bindings status = 'SYNCED'
```

---

## 5. Complete Phase 5 Folder & File Evolution Across Active Repositories

### 5.1 `iconfigly-infra` File Additions & Updates

```
iconfigly-infra/
├── compose.yaml                              # [UPDATED] Adds k8s-tools profile container (kubectl, helm, kind) for zero-install CLI execution
├── compose.prod.yaml                         # [NEW] Production Docker Compose file using compiled multi-stage images (server, worker, web, postgres, openbao)
├── kind/
│   └── kind-cluster.yaml                     # [NEW] 2-node local Kubernetes cluster config with ingress port mappings (80/443 -> host)
└── helm/
    └── iconfigly/
        ├── .helmignore                       # [NEW] Ignores temporary test files during helm package
        ├── Chart.yaml                        # [NEW] Helm Chart v2 manifest (name: iconfigly, version: 0.5.0, appVersion: 0.5.0)
        ├── values.yaml                       # [NEW] Default configuration values for replicas, resources, images, ingress, postgres, openbao, operator
        └── templates/
            ├── _helpers.tpl                  # [NEW] Reusable Helm naming, label, and selector templates
            ├── configmap.yaml                # [NEW] Non-secret environment configuration for api, worker, and web
            ├── secret.yaml                   # [NEW] Master key, DB credentials, and OpenBao token Kubernetes Secret
            ├── statefulset-postgres.yaml     # [NEW] PostgreSQL 18 StatefulSet + PVC + ClusterIP Service
            ├── statefulset-openbao.yaml      # [NEW] OpenBao Server StatefulSet + init Job + ClusterIP Service
            ├── job-migrate.yaml              # [NEW] Helm hook (pre-install, pre-upgrade) running golang-migrate
            ├── deployment-api.yaml           # [NEW] iconfigly-api Deployment (/app/server) with /health and /ready probes
            ├── deployment-worker.yaml        # [NEW] iconfigly-worker Deployment (/app/worker) scaling background outbox/drift jobs
            ├── deployment-web.yaml           # [NEW] iconfigly-web Deployment (Next.js standalone)
            ├── service-api.yaml              # [NEW] ClusterIP Service exposing port 8080 internally
            ├── service-web.yaml              # [NEW] ClusterIP Service exposing port 3000 internally
            ├── ingress.yaml                  # [NEW] Kubernetes Ingress routing /api/v1 and / to web/api
            └── operator-rbac.yaml            # [NEW] ServiceAccount, ClusterRole, ClusterRoleBinding & Deployment for iconfigly-operator
```

### 5.2 `iconfigly-api` File Additions & Updates

```
iconfigly-api/
├── Dockerfile                                # [UPDATED] Multi-stage build compiling BOTH /app/server (cmd/server) and /app/worker (cmd/worker) into a minimal bookworm-slim image
├── api/
│   └── openapi.yaml                          # [UPDATED] Adds /api/v1/projects/{projectID}/k8s/* and /api/v1/k8s/reconcile-report schemas & endpoints
├── migrations/
│   ├── 000001..000019                        # Unchanged Phase 1–4 migrations
│   ├── 000020_create_kubernetes_clusters_and_bindings.up.sql
│   ├── 000020_create_kubernetes_clusters_and_bindings.down.sql
│   ├── 000021_add_k8s_rollout_replica_metrics.up.sql
│   └── 000021_add_k8s_rollout_replica_metrics.down.sql
└── internal/
    ├── server/
    │   ├── server.go                         # [UPDATED] Wires k8s.Repository, k8s.Service, and k8s.Handler routes
    │   └── server_test.go                    # [UPDATED] Verifies Phase 5 Kubernetes route registration
    ├── access/
    │   ├── authorizer.go                     # [UPDATED] Adds k8s.manage and k8s.reconcile permission verbs
    │   └── authorizer_test.go                # [UPDATED] Tests Operator token permissions for reconcile reporting
    └── k8s/
        ├── domain.go                         # [NEW] KubernetesCluster, WorkloadBinding, WorkloadKind, K8sSyncStatus, ReconcileReportCmd
        ├── manifest.go                       # [NEW] Pure generator rendering ready-to-apply ServiceConfigBinding CRD YAML
        ├── repository.go                     # [NEW] K8sRepository interface
        ├── postgres_repo.go                  # [NEW] PostgreSQL implementation for kubernetes_clusters & kubernetes_workload_bindings
        ├── service.go                        # [NEW] RegisterCluster, ListClusters, UpsertWorkloadBinding, ProcessReconcileReport, GenerateCRDManifest
        ├── handler.go                        # [NEW] HTTP handlers for /api/v1/projects/{projectID}/k8s/* and /api/v1/k8s/reconcile-report
        └── service_test.go                   # [NEW] Table-driven tests for replica drift evaluation, rollout convergence, and YAML generation
```

### 5.3 `iconfigly-operator` Complete File Tree (Newly Activated 9th Repository)

```
iconfigly-operator/
├── .gitignore                                # Ignores bin/, dist/, coverage.out, kubeconfig
├── Dockerfile                                # Multi-stage Go 1.27.2 build producing static /manager binary on gcr.io/distroless/static:nonroot
├── go.mod                                    # Module github.com/PathumSandeepa/iconfigly-operator (Go 1.27.2, controller-runtime, k8s.io/api, k8s.io/apimachinery)
├── go.sum
├── cmd/
│   └── manager/
│       └── main.go                           # Operator entrypoint initializing controller-runtime Manager, health probes (:8081), and Reconciler
├── api/
│   └── v1alpha1/
│       ├── groupversion_info.go              # Registers Group="k8s.iconfigly.dev", Version="v1alpha1"
│       ├── serviceconfigbinding_types.go     # Go structs for ServiceConfigBinding, ServiceConfigBindingSpec, ServiceConfigBindingStatus
│       └── zz_generated.deepcopy.go          # runtime.Object DeepCopy implementations for Kubernetes API machinery
├── config/
│   ├── crd/
│   │   └── k8s.iconfigly.dev_serviceconfigbindings.yaml # Complete OpenAPI v3 structural CRD manifest for kubectl apply
│   ├── rbac/
│   │   └── role.yaml                         # Least-privilege RBAC rules (serviceconfigbindings, configmaps, secrets, deployments, pods)
│   └── samples/
│       └── core_banking_payment_service_uat.yaml        # Sample ServiceConfigBinding manifest for local kind demo
└── internal/
    ├── controlplane/
    │   ├── client.go                         # Typed HTTP client calling iconfigly-api (/api/v1/runtime/bundle with ETag & /api/v1/k8s/reconcile-report)
    │   └── client_test.go                    # httptest unit tests for 200 OK bundle parsing, 304 Not Modified, and reconcile report POST
    └── controller/
        ├── serviceconfigbinding_controller.go # Core Reconcile(ctx, req) loop syncing ConfigMap, Secret, Deployment annotations & Status
        ├── syncer.go                          # Pure helper functions building deterministic K8s ConfigMap and Secret objects from RuntimeBundle
        ├── rollout_inspector.go               # Inspects target Deployment/StatefulSet replica counts and Pod template ETag annotations
        └── controller_test.go                 # Table-driven unit tests using controller-runtime fake.NewClientBuilder()
```

### 5.4 `iconfigly-web` File Additions & Updates

```
iconfigly-web/
├── Dockerfile                                # [NEW] Multi-stage production Dockerfile (deps -> builder -> standalone runner on port 3000)
├── next.config.ts                            # [UPDATED] Enables output: "standalone" for lean container packaging
└── src/
    ├── app/
    │   └── (dashboard)/
    │       ├── projects/
    │       │   └── [projectId]/
    │       │       ├── services/
    │       │       │   └── [serviceSlug]/
    │       │       │       └── page.tsx      # [UPDATED] Adds "Kubernetes Workloads" tab showing synced ConfigMap/Secret, Pod replicas & CRD generator
    │       │       └── changes/
    │       │           └── [changeId]/
    │       │               └── page.tsx      # [UPDATED] Enhances Rollout Progress Card with Kubernetes Pod Replica readiness (e.g. "3/3 Pods Ready")
    │       └── settings/
    │           └── clusters/
    │               └── page.tsx              # [NEW] Kubernetes Clusters registry, Operator connection status badge, and Helm install snippet
    ├── features/
    │   └── k8s/
    │       ├── ClusterListTable.tsx          # [NEW] Displays registered K8s clusters, Operator version, last seen timestamp, and health status
    │       ├── WorkloadBindingCard.tsx       # [NEW] Shows bound Deployment/StatefulSet, target ConfigMap/Secret names, ETag sync badge, and Ready/Desired replicas
    │       ├── CrdManifestModal.tsx          # [NEW] Displays copy-ready ServiceConfigBinding YAML and kubectl apply command
    │       └── useK8s.ts                     # [NEW] TanStack Query hooks for clusters, workload bindings, and CRD YAML previews
    └── lib/
        └── types.ts                          # [UPDATED] Adds KubernetesCluster, WorkloadBinding, and ReconcileReport interfaces
```

---

## 6. Sub-Phase 5.0: Multi-Stage Production Dockerfiles & Local `kind` Cluster (`iconfigly-infra`)

### 6.1 Goal & Engineering Rationale

In Phases 1–4, `compose.yaml` ran `go run ./cmd/server` and `npm run dev` on bind-mounted source folders for instant hot-reloading. To deploy `iconfigly` into a Kubernetes cluster (`kind`), we first package `iconfigly-api`, `iconfigly-web`, and `iconfigly-operator` into lean, secure, multi-stage production Docker images and load them directly into `kind` (`kind load docker-image ...`) without needing any paid external container registry!

### 6.2 Production Container & `kind` Specifications

| File Path | Action | Detailed Specification |
| :--- | :--- | :--- |
| `iconfigly-api/Dockerfile` | **Create / Update** | **Stage 1 (`builder` — `golang:1.27.2-bookworm`):** Copies `go.mod` and `go.sum`, runs `go mod download`, copies `cmd/` and `internal/`, and compiles two static binaries with `CGO_ENABLED=0`:<br>• `go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server`<br>• `go build -trimpath -ldflags="-s -w" -o /out/worker ./cmd/worker`<br>**Stage 2 (`runtime` — `debian:bookworm-slim`):** Installs `ca-certificates` and `tzdata`, creates non-root user `iconfigly` (`UID 10001`), copies `/out/server`, `/out/worker`, and `/migrations`, sets `USER 10001`, exposes `8080`, and defaults `ENTRYPOINT ["/app/server"]` (while allowing `helm` to override `command: ["/app/worker"]` for the worker Deployment!). |
| `iconfigly-web/Dockerfile` | **Create** | **Stage 1 (`deps` — `node:26-bookworm-slim`):** Runs `npm ci`.<br>**Stage 2 (`builder`):** Runs `npm run build` producing `.next/standalone` and `.next/static`.<br>**Stage 3 (`runner` — `node:26-bookworm-slim`):** Runs as non-root `node` user (`UID 1000`), copies standalone bundle, exposes `3000`, and runs `node server.js`. |
| `iconfigly-operator/Dockerfile` | **Create** | **Stage 1 (`builder` — `golang:1.27.2-bookworm`):** Compiles `cmd/manager/main.go` with `CGO_ENABLED=0 GOOS=linux` into `/out/manager`.<br>**Stage 2 (`runtime` — `gcr.io/distroless/static:nonroot`):** Copies `/out/manager`, runs as `65532:65532`, and executes `["/manager"]`. Total image size is $< 25\text{ MB}$! |
| `iconfigly-infra/kind/kind-cluster.yaml` | **Create** | Defines a 2-node `kind` cluster (`kind: Cluster`, `apiVersion: kind.x-k8s.io/v1alpha4`, name `iconfigly-local`):<br>• 1 `control-plane` node with `kubeadmConfigPatches` (`node-labels: "ingress-ready=true"`) and `extraPortMappings` forwarding container ports `80` $\rightarrow$ `127.0.0.1:8090` and `443` $\rightarrow$ `127.0.0.1:8443` so it never conflicts with Docker Compose ports `3000`/`8080`.<br>• 1 `worker` node running application workloads. |

---

## 7. Sub-Phase 5.1: Relational Data Model & Database Migrations (`000020`–`000021`)

### 7.1 Phase 5 Entity-Relationship Additions

Phase 5 adds **2 new tables (`kubernetes_clusters` and `kubernetes_workload_bindings`)** in migration `000020` and expands `service_rollouts` in migration `000021` so the control plane tracks Kubernetes replica readiness alongside configuration versions.

```
erDiagram
    organizations ||--o{ kubernetes_clusters : "registers_clusters"
    environments ||--o{ kubernetes_clusters : "maps_default_env"
    kubernetes_clusters ||--o{ kubernetes_workload_bindings : "hosts_workloads"
    services ||--o{ kubernetes_workload_bindings : "deployed_as"
    environments ||--o{ kubernetes_workload_bindings : "in_environment"
    change_requests ||--o{ service_rollouts : "tracks_pod_convergence"
```

### 7.2 Complete Migration & Table Specification (`iconfigly-api/migrations/`)

#### Migration `000020_create_kubernetes_clusters_and_bindings`

* **Table `kubernetes_clusters`:** Represents a Kubernetes cluster connected to `iconfigly` via `iconfigly-operator`.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `slug`: `TEXT NOT NULL` (e.g., `kind-local-uat`, `eks-us-east-prod`)
  * `name`: `TEXT NOT NULL`
  * `default_environment_id`: `UUID NULL REFERENCES environments(id) ON DELETE SET NULL`
  * `kube_version`: `TEXT NOT NULL DEFAULT ''` (Reported by operator, e.g., `v1.32.0`)
  * `operator_version`: `TEXT NOT NULL DEFAULT ''` (e.g., `0.5.0`)
  * `status`: `TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONNECTED', 'DEGRADED', 'OFFLINE'))`
  * `last_reconciled_at`: `TIMESTAMPTZ NULL`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:* `UNIQUE (organization_id, slug)`.

* **Table `kubernetes_workload_bindings`:** Tracks each `ServiceConfigBinding` CRD active in a Kubernetes cluster and its live synchronization and replica status.
  * `id`: `UUID PRIMARY KEY DEFAULT uuidv7()`
  * `organization_id`: `UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE`
  * `project_id`: `UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE`
  * `environment_id`: `UUID NOT NULL REFERENCES environments(id) ON DELETE CASCADE`
  * `service_id`: `UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE`
  * `cluster_id`: `UUID NOT NULL REFERENCES kubernetes_clusters(id) ON DELETE CASCADE`
  * `namespace`: `TEXT NOT NULL` (e.g., `payments-uat`)
  * `crd_name`: `TEXT NOT NULL` (e.g., `payment-service-uat`)
  * `workload_kind`: `TEXT NOT NULL DEFAULT 'Deployment' CHECK (workload_kind IN ('Deployment', 'StatefulSet', 'DaemonSet'))`
  * `workload_name`: `TEXT NOT NULL` (e.g., `payment-service`)
  * `target_configmap_name`: `TEXT NOT NULL` (e.g., `payment-service-config`)
  * `target_secret_name`: `TEXT NOT NULL DEFAULT ''` (e.g., `payment-service-secrets`)
  * `auto_rollout_restart`: `BOOLEAN NOT NULL DEFAULT TRUE`
  * `synced_bundle_etag`: `TEXT NOT NULL DEFAULT ''`
  * `synced_config_version`: `INT NOT NULL DEFAULT 0`
  * `desired_replicas`: `INT NOT NULL DEFAULT 1`
  * `updated_replicas`: `INT NOT NULL DEFAULT 0` (Pods running the latest PodTemplate spec)
  * `ready_replicas`: `INT NOT NULL DEFAULT 0` (Pods passing Kubernetes readiness probes)
  * `unavailable_replicas`: `INT NOT NULL DEFAULT 0`
  * `sync_status`: `TEXT NOT NULL DEFAULT 'PENDING' CHECK (sync_status IN ('PENDING', 'SYNCED', 'OUT_OF_SYNC', 'ROLLING_OUT', 'REPLICA_DRIFT', 'ERROR'))`
  * `last_error`: `TEXT NOT NULL DEFAULT ''`
  * `last_synced_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * `created_at`, `updated_at`: `TIMESTAMPTZ NOT NULL DEFAULT NOW()`
  * *Constraints & Indexes:*
    * `UNIQUE (cluster_id, namespace, crd_name)`
    * `idx_k8s_bindings_service_env` on `(service_id, environment_id)`

#### Migration `000021_add_k8s_rollout_replica_metrics`

* Alters `service_rollouts` to add:
  * `desired_k8s_replicas`: `INT NOT NULL DEFAULT 0`
  * `ready_k8s_replicas`: `INT NOT NULL DEFAULT 0`
  * Allows `service_rollouts` to display both SDK heartbeat instances and Kubernetes Pod replica convergence on the same Change Request rollout bar!

---

## 8. Sub-Phase 5.2: Kubernetes Cluster & Workload Bounded Context (`internal/k8s`)

### 8.1 Multi-Dimensional Kubernetes Workload Sync & Drift Evaluation

When `iconfigly-operator` sends a reconciliation report (`POST /api/v1/k8s/reconcile-report`), `internal/k8s/service.go` evaluates the workload's health by comparing the **Expected Control Plane State** (`expectedETag`, `expectedVersionVector`) against the **Reported Kubernetes State**:

1. **`ERROR`:** Operator encountered an error writing the `ConfigMap`/`Secret` or patching the `Deployment` (`report.ErrorMessage != ""`).
2. **`OUT_OF_SYNC`:** `report.SyncedBundleETag != expectedETag` (the `ConfigMap`/`Secret` has not yet updated to the latest Change Request).
3. **`ROLLING_OUT`:** `report.SyncedBundleETag == expectedETag`, and `report.UpdatedReplicas < report.DesiredReplicas` (Kubernetes is actively cycling old Pods to new Pods).
4. **`REPLICA_DRIFT`:** `report.UpdatedReplicas == report.DesiredReplicas`, but `report.ReadyReplicas < report.DesiredReplicas` (e.g., Desired is `3`, but only `2` Pods are ready because 1 Pod is in `CrashLoopBackOff` or failing readiness probes!).
5. **`SYNCED`:** `report.SyncedBundleETag == expectedETag` $\land$ `report.UpdatedReplicas == report.DesiredReplicas` $\land$ `report.ReadyReplicas == report.DesiredReplicas`.

### 8.2 File & Function Breakdown (`internal/k8s/`)

| File Path | Structs / Functions | Detailed Execution Flow & Business Rules |
| :--- | :--- | :--- |
| `internal/k8s/domain.go` | Structs: `KubernetesCluster`, `WorkloadBinding`, `ReconcileReportCmd`<br>Func: `EvaluateWorkloadStatus(expectedETag string, cmd ReconcileReportCmd) K8sSyncStatus` | Pure domain evaluation function implementing the 5-state sync classification (`SYNCED`, `ROLLING_OUT`, `REPLICA_DRIFT`, `OUT_OF_SYNC`, `ERROR`). |
| `internal/k8s/manifest.go` | Func: `RenderServiceConfigBindingYAML(params CRDTemplateParams) string` | Generates a clean, commented `ServiceConfigBinding` (`apiVersion: k8s.iconfigly.dev/v1alpha1`) YAML manifest pre-populated with the exact `projectSlug`, `serviceSlug`, `environmentSlug`, `targetConfigMapName`, `targetSecretName`, and `workloadRef` so engineers can copy-paste or `kubectl apply` it with zero typos. |
| `internal/k8s/service.go` | `RegisterCluster(ctx, actor, cmd) (*KubernetesCluster, error)`<br>`ListClusters(ctx, actor) ([]*KubernetesCluster, error)`<br>`ProcessReconcileReport(ctx, actor, cmd ReconcileReportCmd) (*WorkloadBinding, error)`<br>`ListServiceWorkloads(ctx, actor, projectID, serviceSlug, envSlug) ([]*WorkloadBinding, error)`<br>`GenerateBindingManifest(ctx, actor, projectID, serviceSlug, envSlug, opts) (string, error)` | **`ProcessReconcileReport`:** Requires `k8s.reconcile` permission. Updates `kubernetes_clusters.last_reconciled_at` and `status = 'CONNECTED'`, fetches the current expected `RuntimeBundle` `ETag` from `runtime.Service`, computes `K8sSyncStatus`, upserts `kubernetes_workload_bindings`, and also updates `instance_heartbeats` (`client_type = 'K8S_OPERATOR'`) and `service_rollouts` (`desired_k8s_replicas`, `ready_k8s_replicas`) so Change Request rollout progress bars update automatically! |
| `internal/k8s/handler.go` | `HandleRegisterCluster`, `HandleListClusters`, `HandleReconcileReport`, `HandleListServiceWorkloads`, `HandleGenerateManifest` | Exposes REST routes under `/api/v1/k8s/*` and `/api/v1/projects/{projectID}/k8s/*`. |

---

## 9. Sub-Phase 5.3: Production Helm Chart Architecture (`iconfigly-infra/helm/iconfigly`)

### 9.1 Goal & Engineering Rationale

To fulfill the "Jenkins / GitLab / Argo CD self-hosted install experience" for Kubernetes users, `iconfigly-infra/helm/iconfigly` packages the entire platform into a single Helm chart that can be installed with one command:

`helm upgrade --install iconfigly ./helm/iconfigly --namespace iconfigly-system --create-namespace`

### 9.2 Helm Chart Template Breakdown (`iconfigly-infra/helm/iconfigly/`)

| Template File | Kubernetes Kind(s) | Detailed Configuration & Probes |
| :--- | :--- | :--- |
| `Chart.yaml` & `values.yaml` | Chart Metadata & Defaults | Configures default replica counts (`api.replicas: 2`, `worker.replicas: 1`, `web.replicas: 2`, `operator.enabled: true`), image tags (`pullPolicy: IfNotPresent` for local `kind`), resource requests/limits (`cpu: 100m`, `memory: 128Mi`), and Ingress host (`iconfigly.local`). |
| `templates/job-migrate.yaml` | `Job` (`helm.sh/hook: pre-install,pre-upgrade`) | Runs `migrate/migrate` against `iconfigly-postgres:5432` before the `api` and `worker` Deployments roll out, guaranteeing the database schema (`000001`–`000021`) is always up to date before new application Pods start. |
| `templates/deployment-api.yaml` | `Deployment` | Runs `/app/server` with `ICONFIGLY_RUN_EMBEDDED_WORKER: "false"` (since `deployment-worker` runs the workers separately in Kubernetes!). Configures `livenessProbe` on `GET /health:8080` and `readinessProbe` on `GET /ready:8080`. |
| `templates/deployment-worker.yaml` | `Deployment` | Uses the exact same `iconfigly-api` image with `command: ["/app/worker"]`, scaling `OutboxWorker`, `ExpiryWorker`, and `DriftWorker` independently of HTTP traffic. |
| `templates/deployment-web.yaml` | `Deployment` | Runs the Next.js standalone image on port `3000` with `API_URL: "http://iconfigly-api:8080"`. |
| `templates/operator-rbac.yaml` | `ServiceAccount`, `ClusterRole`, `ClusterRoleBinding`, `Deployment` | Deploys `iconfigly-operator` with least-privilege permissions to watch `serviceconfigbindings.k8s.iconfigly.dev`, manage `configmaps` and `secrets`, and patch/read `deployments` and `statefulsets`. |

---

## 10. Sub-Phase 5.4: Custom Resource Definition (`ServiceConfigBinding`) & Operator Bootstrap (`iconfigly-operator`)

### 10.1 The `ServiceConfigBinding` CRD Schema (`api/v1alpha1/serviceconfigbinding_types.go`)

Every `ServiceConfigBinding` resource applied to Kubernetes contains a declarative **`spec`** (desired state) and a controller-managed **`status`** (observed state):

| Section | Field Path | Type & Validation | Purpose |
| :--- | :--- | :--- | :--- |
| **Metadata** | `apiVersion` | `k8s.iconfigly.dev/v1alpha1` | API group and version registered with the Kubernetes API server. |
| **Metadata** | `kind` | `ServiceConfigBinding` | Custom Resource Kind name (short-name alias `scb` so users can run `kubectl get scb`). |
| **`spec`** | `clusterSlug` | `string` (Required) | Identifier of the Kubernetes cluster registered in `iconfigly` (e.g., `kind-local-uat`). |
| **`spec`** | `projectSlug` | `string` (Required) | Target project slug in `iconfigly` (e.g., `core-banking`). |
| **`spec`** | `serviceSlug` | `string` (Required) | Target microservice slug (e.g., `payment-service`). |
| **`spec`** | `environmentSlug` | `string` (Required) | Target environment slug (`dev`, `qa`, `uat`, `prod`). |
| **`spec`** | `authSecretRef` | `{ name: string, key: string }` | Name of the Kubernetes `Secret` in the namespace holding the `icfg_pat_...` token used to authenticate with `iconfigly-api`. |
| **`spec`** | `targetConfigMapName` | `string` (Required) | Name of the Kubernetes `ConfigMap` the Operator will create/update with plain `config_items` and bound resource connection metadata (`PAYMENTS_DB_HOST`, etc.). |
| **`spec`** | `targetSecretName` | `string` (Optional) | Name of the Kubernetes `Secret` (`type: Opaque`) the Operator will create/update with resolved OpenBao secrets (`DB_PASSWORD`, etc.). If empty, secrets are not synced. |
| **`spec`** | `workloadRef` | `{ kind: string, name: string, autoRolloutRestart: bool }` | Target `Deployment` or `StatefulSet` (`payment-service`). When `autoRolloutRestart == true`, the Operator triggers a rolling restart whenever the bundle `ETag` changes. |
| **`spec`** | `pollIntervalSeconds` | `int` (Default `30`, Min `10`) | How frequently the Operator polls `iconfigly-api` (`GET /api/v1/runtime/bundle` with `If-None-Match`). |
| **`status`** | `syncedBundleETag` | `string` | The SHA-256 `ETag` of the `RuntimeBundle` currently written to the `ConfigMap` and `Secret`. |
| **`status`** | `activeConfigVersion` | `int` | The `config_items` version currently synced into the cluster. |
| **`status`** | `desiredReplicas` / `readyReplicas` | `int32` | Live replica readiness read from the target `Deployment` (`3 / 3`). |
| **`status`** | `syncState` | `string` | `SYNCED`, `ROLLING_OUT`, `REPLICA_DRIFT`, or `ERROR`. |
| **`status`** | `conditions` | `[]metav1.Condition` | Standard Kubernetes status conditions (`Type: "Ready"`, `Type: "BundleSynced"`, `Type: "WorkloadHealthy"`). |

---

## 11. Sub-Phase 5.5: Operator Reconciliation Loop, `ConfigMap`/`Secret` Sync & Rolling Restarts

### 11.1 Deterministic Reconciliation Decision Tree (`serviceconfigbinding_controller.go`)

```
flowchart TD
    Start(["Reconcile(ctx, req) Triggered\n(CRD Change, Deployment Change, or Poll Timer)"])
    FetchCRD["1. Fetch ServiceConfigBinding CRD\n(Return nil if NotFound / Deleted)"]
    ReadToken["2. Read PAT Token from spec.authSecretRef"]
    CallBundle["3. Call iconfigly-api GET /api/v1/runtime/bundle\nwith Header If-None-Match: status.syncedBundleETag"]
    Check304{"HTTP 304\nNot Modified?"}
    UpsertK8s["4a. HTTP 200 OK (New Bundle!):\n• Build ConfigMap (Configs + Resource Env)\n• Build Secret (Resolved OpenBao Secrets)\n• SetControllerReference(CRD)\n• CreateOrUpdate ConfigMap & Secret"]
    CheckRestart{"spec.workloadRef\n.autoRolloutRestart?"}
    PatchDep["4b. Patch Target Deployment PodTemplate:\nannotations['iconfigly.dev/bundle-etag'] = bundle.ETag"]
    InspectDep["5. Read Target Deployment Status:\ndesiredReplicas, updatedReplicas, readyReplicas"]
    ReportAPI["6. POST /api/v1/k8s/reconcile-report to iconfigly-api\n& Update CRD Status Conditions"]
    Requeue(["7. Return ctrl.Result{RequeueAfter: pollInterval ± 15% Jitter}"])

    Start --> FetchCRD
    FetchCRD --> ReadToken
    ReadToken --> CallBundle
    CallBundle --> Check304
    Check304 -->|"No (200 OK)"| UpsertK8s
    UpsertK8s --> CheckRestart
    CheckRestart -->|"Yes"| PatchDep
    CheckRestart -->|"No"| InspectDep
    PatchDep --> InspectDep
    Check304 -->|"Yes (304)"| InspectDep
    InspectDep --> ReportAPI
    ReportAPI --> Requeue
```

### 11.2 File & Function Breakdown (`iconfigly-operator/internal/`)

| File Path | Structs / Functions | Detailed Execution Flow & Kubernetes Best Practices |
| :--- | :--- | :--- |
| `internal/controlplane/client.go` | Struct: `ControlPlaneClient`<br>Methods:<br>• `FetchRuntimeBundle(ctx, token, query, ifNoneMatch) (*RuntimeBundle, bool, error)`<br>• `SendReconcileReport(ctx, token, report ReconcileReport) error` | Uses Go's standard library `net/http` with a 10-second timeout. Sends `If-None-Match` on `FetchRuntimeBundle` so steady-state 30s checks receive `304 Not Modified` with zero OpenBao overhead. |
| `internal/controller/syncer.go` | Func: `BuildDesiredConfigMap(crd, bundle) *corev1.ConfigMap`<br>Func: `BuildDesiredSecret(crd, bundle) *corev1.Secret` | **Separation of Configs vs. Secrets in K8s:**<br>• `BuildDesiredConfigMap` populates `Data map[string]string` with all plain `bundle.Configs` (`LOG_LEVEL`, `PAYMENT_RETRY_COUNT`) and normalized bound resource connection metadata (`PAYMENTS_DB_HOST`, `PAYMENTS_DB_PORT`), and stamps annotations `iconfigly.dev/bundle-etag: bundle.ETag` and `iconfigly.dev/config-version: strconv.Itoa(bundle.VersionVector.ConfigVersion)`.<br>• `BuildDesiredSecret` populates `StringData`/`Data` strictly with `bundle.Secrets` (`DB_PASSWORD`, `REDIS_AUTH_TOKEN`) so sensitive credentials reside only inside a Kubernetes `Secret` object, never inside a `ConfigMap`! |
| `internal/controller/rollout_inspector.go` | Func: `InspectAndTriggerWorkload(ctx, k8sClient, crd, desiredETag string) (*WorkloadRolloutState, error)` | 1. Fetches the target `appsv1.Deployment` (or `StatefulSet`) in `crd.Namespace`.<br>2. Checks `deployment.Spec.Template.Annotations["iconfigly.dev/bundle-etag"]`.<br>3. If `crd.Spec.WorkloadRef.AutoRolloutRestart == true` and the annotation does not match `desiredETag`, patches the PodTemplate annotation to `desiredETag` and `iconfigly.dev/restarted-at: time.Now().Format(time.RFC3339)`.<br>4. Reads `DesiredReplicas`, `UpdatedReplicas`, `ReadyReplicas`, and `UnavailableReplicas` from `deployment.Status` and returns `WorkloadRolloutState`. |
| `internal/controller/serviceconfigbinding_controller.go` | Struct: `ServiceConfigBindingReconciler`<br>Method: `Reconcile(ctx context.Context, req ctrl.Request) (ctrl.Result, error)`<br>Method: `SetupWithManager(mgr ctrl.Manager) error` | Orchestrates the reconciliation loop above, sets `controllerutil.SetControllerReference` on the managed `ConfigMap` and `Secret`, updates `crd.Status` via `r.Status().Update(ctx, &crd)`, reports status to `iconfigly-api`, and schedules the next check with $\pm 15\%$ random jitter. |

---

## 12. Sub-Phase 5.6: Next.js Web Dashboard Architecture & UI (`iconfigly-web` Phase 5)

### 12.1 Complete Phase 5 UI Screen & Component Specifications

| Route Path | File Path in `iconfigly-web/src/app/` | Key Components & User Interactions |
| :--- | :--- | :--- |
| `/settings/clusters` | `app/(dashboard)/settings/clusters/page.tsx` | **Kubernetes Clusters & Operator Hub (`ClusterListTable`):**<br>1. Lists all registered Kubernetes clusters (`kind-local-uat`, `eks-prod`), showing Status Badge (`CONNECTED` green, `DEGRADED` amber, `OFFLINE` gray), Kubernetes version (`v1.32.0`), Operator version (`v0.5.0`), Active Workload Bindings count, and Last Reconciled time (`6s ago`).<br>2. **`+ Connect Cluster` Modal:** Registers a cluster slug and displays the 1-line `helm upgrade --install` command to deploy `iconfigly-operator` into that cluster. |
| `/projects/[projectId]/services/[serviceSlug]` | `app/(dashboard)/projects/[projectId]/services/[serviceSlug]/page.tsx` | **Service Context — `Kubernetes Workloads` Tab (`WorkloadBindingCard` & `CrdManifestModal`):**<br>1. Displays all Kubernetes workloads bound to this service in the selected environment (`Deployment/payment-service` in namespace `payments-uat`).<br>2. Shows Managed Objects (`ConfigMap: payment-service-config`, `Secret: payment-service-secrets`), Sync Status Badge (`SYNCED`, `ROLLING_OUT`, `REPLICA_DRIFT`), Synced ETag, and **Live Pod Replicas (`3 / 3 Ready`)**.<br>3. **`Generate CRD YAML` Button (`CrdManifestModal`):** Opens a modal with the exact `ServiceConfigBinding` YAML pre-filled for this service and environment, ready to apply via `kubectl apply -f -`. |
| `/projects/[projectId]/changes/[changeId]` | `app/(dashboard)/projects/[projectId]/changes/[changeId]/page.tsx` | **Enhanced Change Request Rollout Card:**<br>Alongside SDK instance heartbeats, displays Kubernetes Pod rollout convergence (`Deployment payment-service: 3 / 3 Pods Updated & Ready`) and highlights any `REPLICA_DRIFT` if a newly applied configuration causes a Pod to fail its Kubernetes readiness probe! |

---

## 13. Sub-Phase 5.7: Comprehensive Testing Strategy & Phase 5 Verification Checklist

### 13.1 Complete Phase 5 REST API Endpoint Catalog (Additions to Phases 1–4)

| Method | Endpoint Path | Required Permission | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/k8s/clusters` | `catalog.read` | Lists all registered Kubernetes clusters in the organization and their connection health. |
| `POST` | `/api/v1/k8s/clusters` | `k8s.manage` | Registers a new Kubernetes cluster (`slug`, `name`, `default_environment_id`). |
| `POST` | `/api/v1/k8s/reconcile-report` | `k8s.reconcile` (Operator PAT) | Ingests a reconciliation status report from `iconfigly-operator` (`cluster_slug`, `namespace`, `crd_name`, `synced_bundle_etag`, `desired_replicas`, `updated_replicas`, `ready_replicas`), updating workload bindings, heartbeats, and active `service_rollouts`. |
| `GET` | `/api/v1/projects/{projectID}/services/{serviceSlug}/k8s-workloads` | `catalog.read` | Lists all `kubernetes_workload_bindings` and live replica statuses for a service in `?env={envSlug}`. |
| `GET` | `/api/v1/projects/{projectID}/services/{serviceSlug}/k8s-manifest` | `catalog.read` | Generates and returns a ready-to-apply `ServiceConfigBinding` CRD YAML manifest for `?env={envSlug}&cluster={clusterSlug}&namespace={ns}`. |

### 13.2 Phase 5 Testing Matrix

| Test Layer | Target Repository & Files | What Is Tested & Verified |
| :--- | :--- | :--- |
| **1. K8s Sync & Replica Drift Unit Tests** | `iconfigly-api/internal/k8s/service_test.go` | Table-driven tests verifying `EvaluateWorkloadStatus` across `SYNCED`, `OUT_OF_SYNC`, `ROLLING_OUT` (`updated < desired`), `REPLICA_DRIFT` (`ready < desired`), and `ERROR`; tests CRD YAML manifest generation. |
| **2. Operator Control-Plane Client Tests** | `iconfigly-operator/internal/controlplane/client_test.go` | Verifies `If-None-Match` header transmission, `304 Not Modified` handling, `200 OK` bundle deserialization, and reconcile report serialization. |
| **3. Operator Reconciler Unit Tests (`fake.Client`)** | `iconfigly-operator/internal/controller/controller_test.go` | Uses `sigs.k8s.io/controller-runtime/pkg/client/fake` to verify that reconciling a `ServiceConfigBinding` creates the target `ConfigMap` (plain configs + resource metadata) and `Secret` (OpenBao secrets), sets `OwnerReference`, patches the target `Deployment` annotation `iconfigly.dev/bundle-etag`, and updates `status.conditions`. |
| **4. Helm Chart Lint & Template Verification** | `iconfigly-infra/helm/iconfigly/` | Runs `helm lint ./helm/iconfigly` and `helm template iconfigly ./helm/iconfigly` inside the `k8s-tools` container to verify 100% valid Kubernetes YAML rendering across all templates. |
| **5. Local `kind` Cluster End-to-End Test** | `iconfigly-infra/kind/` + `iconfigly-operator/config/samples/` | Deploys the Helm chart and a sample `payment-service` nginx/echo `Deployment` into `kind`, applies `ServiceConfigBinding`, rotates a secret in `iconfigly`, and verifies that Kubernetes automatically updates the `Secret` and completes a rolling restart of all 3 `payment-service` Pods! |

### 13.3 End-to-End Phase 5 Demo Scenario & Definition of Done Checklist

To mark Phase 5 100% complete, the following end-to-end Kubernetes workflow must execute cleanly on your local Windows 11 + WSL2 machine at $\$0$ cost:

* [ ] **Step 1 (Migrations `000020`–`000021` & Helm Lint):** Running the `migrate` tool applies `000020` and `000021` cleanly, and `helm lint ./helm/iconfigly` passes with `0 chart(s) failed`.
* [ ] **Step 2 (Provision Local `kind` Cluster & Load Images):** Run `kind create cluster --config kind/kind-cluster.yaml`, build the production images (`iconfigly-api`, `iconfigly-web`, `iconfigly-operator`), and load them into `kind` via `kind load docker-image`.
* [ ] **Step 3 (Install `iconfigly` & `iconfigly-operator` via Helm):** Run `helm upgrade --install iconfigly ./helm/iconfigly -n iconfigly-system --create-namespace` and apply `config/crd/k8s.iconfigly.dev_serviceconfigbindings.yaml`. Verify `kubectl get pods -n iconfigly-system` shows `api`, `worker`, `web`, `postgres`, `openbao`, and `operator` Pods `Running` and `1/1 Ready`.
* [ ] **Step 4 (Deploy Sample Workload & Apply `ServiceConfigBinding`):** In namespace `payments-uat`, create a 3-replica `Deployment` named `payment-service` and apply the `ServiceConfigBinding` YAML generated from the `iconfigly-web` UI (`payment-service` in `UAT`).
* [ ] **Step 5 (Verify Automatic `ConfigMap` & `Secret` Creation):** Run `kubectl get scb,configmap,secret -n payments-uat`. Verify that `iconfigly-operator` automatically created `ConfigMap/payment-service-config` (containing `PAYMENT_RETRY_COUNT` and `PAYMENTS_DB_HOST`) and `Secret/payment-service-secrets` (containing the resolved OpenBao `DB_PASSWORD`), and that the `iconfigly-web` **`Kubernetes Workloads`** tab displays `Status: SYNCED` and `3 / 3 Pods Ready`.
* [ ] **Step 6 (Apply Change Request $\rightarrow$ Zero-Touch K8s Rolling Restart):** Approve and apply a Change Request rotating `payments-db` credentials (`v2` $\rightarrow$ `v3`) or updating `PAYMENT_RETRY_COUNT` in `UAT`. Observe `iconfigly-operator` detect the new `ETag`, update the Kubernetes `ConfigMap`/`Secret`, patch the `payment-service` `Deployment` annotation, trigger a rolling restart of the 3 Pods, and transition the Change Request Rollout Bar in `iconfigly-web` from `ROLLING_OUT` $\rightarrow$ `COMPLETED (3/3 Pods Ready)`!
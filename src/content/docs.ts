import type {
  CodeReferenceSpec,
  DocCategory,
  OSPlatformGuide,
  TestSuiteCommand,
} from "@/domain/docs";

export const osPlatformGuides: readonly OSPlatformGuide[] = [
  {
    os: "mac",
    name: "macOS (Apple Silicon & Intel)",
    badge: "Darwin / ARM64 & x86_64",
    prerequisites: [
      "macOS Ventura (13.0+) or macOS Sonoma (14.0+) / Sequoia (15.0+)",
      "Docker Desktop for Mac 4.25+ (Enable VirtioFS and Rosetta 2 for accelerated container I/O)",
      "Alternative: Colima 0.6+ with docker CLI (colima start --cpu 4 --memory 8)",
      "Homebrew package manager with Git installed (brew install git)",
    ],
    bootstrapCommands: `# 1. Clone repository (or navigate to workspace)
cd iconfigly-infra

# 2. Boot the entire containerized stack in background
docker compose up -d

# 3. Apply PostgreSQL versioned database migrations
docker compose --profile tools run --rm migrate

# 4. Verify healthy container status
docker compose ps

# 5. Access services in browser:
# Control Plane Console: http://localhost:3000
# Documentation & Product Site: http://localhost:3001
# Backend Go REST API: http://localhost:8080/health`,
    testCommands: `# Execute all Go unit & PostgreSQL integration tests
docker exec -it iconfigly-api go test -v ./...

# Run Go race detector tests
docker exec -it iconfigly-api go test -race ./...

# Run Web TypeScript check & ESLint
docker exec -it iconfigly-web npm run lint

# Run Playwright End-to-End browser test suite
docker exec -it iconfigly-web npx playwright test

# Verify Documentation site build & typecheck
docker exec -it iconfigly-docs npm run typecheck
docker exec -it iconfigly-docs npm run build`,
    architectureNotes: [
      "Native ARM64 container execution on Apple Silicon (M1/M2/M3/M4) delivers near-bare-metal Go and Node performance.",
      "VirtioFS file sharing in Docker Desktop ensures file watcher hot-reloading works seamlessly on host mounts.",
      "Ports 3000, 3001, 8080, and 5432 bind directly to 127.0.0.1, preventing local loopback collisions.",
    ],
  },
  {
    os: "linux",
    name: "Linux (Ubuntu / Debian / Fedora / Arch)",
    badge: "GNU / Linux x86_64 & aarch64",
    prerequisites: [
      "Kernel 5.15+ with cgroups v2 enabled",
      "Docker Engine 25.0+ and Docker Compose Plugin (docker-compose-v2)",
      "User added to the docker group: sudo usermod -aG docker $USER (log out and back in)",
      "Systemd service enabled: sudo systemctl enable --now docker",
    ],
    bootstrapCommands: `# 1. Navigate to infra directory
cd iconfigly-infra

# 2. Launch container stack
docker compose up -d

# 3. Run initial schema migrations
docker compose --profile tools run --rm migrate

# 4. Confirm container health status
docker compose ps

# 5. Verify local endpoints
curl -s http://localhost:8080/health
curl -s http://localhost:3000 | head -n 5
curl -s http://localhost:3001 | head -n 5`,
    testCommands: `# Run all Go tests with coverage report
docker exec -t iconfigly-api go test -coverprofile=coverage.out ./...

# Run Go memory race condition detector
docker exec -t iconfigly-api go test -race ./...

# Run Next.js control plane test suite
docker exec -t iconfigly-web npm test

# Run Next.js production build check
docker exec -t iconfigly-web npm run build

# Run Docs site typecheck & lint
docker exec -t iconfigly-docs npm run typecheck
docker exec -t iconfigly-docs npm run lint`,
    architectureNotes: [
      "Direct Linux epoll socket architecture provides lowest latency (< 0.2ms) for Go API calls.",
      "Native Linux filesystem performance eliminates bind-mount overhead completely.",
      "UFW / iptables firewall rules should allow localhost traffic on ports 3000, 3001, 8080, 5432.",
    ],
  },
  {
    os: "windows",
    name: "Windows 11 / 10 (WSL2 & PowerShell)",
    badge: "Windows NT / WSL2 Linux Subsystem",
    prerequisites: [
      "Windows 11 64-bit (Build 22000+) or Windows 10 (Build 19044+)",
      "WSL2 installed with default Ubuntu distribution (wsl --install)",
      "Docker Desktop for Windows with WSL2 Backend Engine enabled in Settings",
      "PowerShell 7+ or Windows Terminal with bash / PowerShell profiles",
    ],
    bootstrapCommands: `# In PowerShell (or inside WSL2 terminal):
cd iconfigly-infra

# Start all containers in detached mode
docker compose up -d

# Run database migrations
docker compose --profile tools run --rm migrate

# Check container status
docker compose ps

# Test endpoints via PowerShell:
(Invoke-WebRequest -Uri 'http://127.0.0.1:3000' -UseBasicParsing).StatusCode
(Invoke-WebRequest -Uri 'http://127.0.0.1:3001' -UseBasicParsing).StatusCode
(Invoke-WebRequest -Uri 'http://127.0.0.1:8080/health' -UseBasicParsing).StatusCode`,
    testCommands: `# Run Go unit & PostgreSQL integration tests
docker exec -it iconfigly-api go test ./...

# Run Go tests with race detection
docker exec -it iconfigly-api go test -race ./...

# Run Playwright E2E browser tests in web container
docker exec -it iconfigly-web npx playwright test

# Run TypeScript compile validation in docs container
docker exec -it iconfigly-docs npm run typecheck
docker exec -it iconfigly-docs npm run build`,
    architectureNotes: [
      "Docker named volumes (web_node_modules, docs_node_modules, postgres_data) prevent slow cross-OS NTFS file translation.",
      "WATCHPACK_POLLING=true is configured in compose.yaml to ensure Next.js Turbopack watches Windows host changes accurately.",
      "CRLF line endings in Git should be normalized: git config --global core.autocrlf input.",
    ],
  },
];

export const testSuiteCommands: readonly TestSuiteCommand[] = [
  {
    name: "Go Unit & Integration Test Suite",
    target: "api",
    command: "docker exec -it iconfigly-api go test ./...",
    purpose:
      "Runs all 20 internal Go packages covering Auth, Access RBAC, Audit hash chains, Catalogs, and Domain Value Objects.",
    expectation: "ok github.com/PathumSandeepa/iconfigly-api/internal/... across all packages (0 failures).",
  },
  {
    name: "Go Race Condition Detector",
    target: "api",
    command: "docker exec -it iconfigly-api go test -race ./...",
    purpose:
      "Instruments Go binaries with thread-sanitizer to catch concurrent goroutine memory access bugs.",
    expectation: "Passes with zero race reports across database connection pools and HTTP handlers.",
  },
  {
    name: "Go Test Coverage Profile",
    target: "api",
    command:
      "docker exec -it iconfigly-api go test -coverprofile=coverage.out ./... && docker exec -it iconfigly-api go tool cover -func=coverage.out",
    purpose:
      "Calculates exact statement test coverage percentages across all domain entities and repositories.",
    expectation: "Detailed function-by-function coverage table with > 90% coverage in core domain engines.",
  },
  {
    name: "Playwright End-to-End Browser Suite",
    target: "web",
    command: "docker exec -it iconfigly-web npx playwright test",
    purpose:
      "Launches headless Chromium to test the complete user lifecycle: cluster setup wizard, user login, project creation, cataloging, and audit log inspection.",
    expectation: "Phase 1 Foundation E2E Workflow passes in ~12-18 seconds.",
  },
  {
    name: "Frontend Static Code Analysis (ESLint)",
    target: "web",
    command: "docker exec -it iconfigly-web npm run lint",
    purpose:
      "Executes ESLint across all TypeScript App Router pages, components, and domain adapters.",
    expectation: "Zero errors, zero warnings.",
  },
  {
    name: "TypeScript Compiler Verification",
    target: "web",
    command: "docker exec -it iconfigly-web npx tsc --noEmit",
    purpose:
      "Strict typecheck validating all React 19 JSX components, domain models, and API proxy contracts.",
    expectation: "Exits cleanly with exit code 0.",
  },
  {
    name: "Database Migration Integrity Check",
    target: "infra",
    command: "docker compose --profile tools run --rm migrate version",
    purpose:
      "Validates current PostgreSQL schema migration version against disk migration scripts.",
    expectation: "Outputs active migration version (000001_initial_schema).",
  },
];

export const codeReferenceSpecs: readonly CodeReferenceSpec[] = [
  {
    layer: "API Backend (Go 1.27)",
    packageOrModule: "internal/auth",
    symbol: "HandleLogin",
    kind: "Handler",
    signature: "func (h *Handler) HandleLogin(w http.ResponseWriter, r *http.Request)",
    description:
      "Authenticates user credentials using Argon2id verification, provisions an encrypted server-side PostgreSQL session, and attaches an HttpOnly SameSite=Lax cookie.",
    details: [
      "Decodes JSON LoginRequest payload containing email and plaintext password.",
      "Invokes AuthService.Authenticate(ctx, email, password) to verify credentials.",
      "Sets sliding session cookie: iconfigly_session=<token>; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800.",
      "Audits the authentication event into the append-only audit ledger.",
    ],
  },
  {
    layer: "API Backend (Go 1.27)",
    packageOrModule: "internal/auth",
    symbol: "HandleSetup",
    kind: "Handler",
    signature: "func (h *Handler) HandleSetup(w http.ResponseWriter, r *http.Request)",
    description:
      "Executes first-time cluster initialization, creating the root Organization and Super Admin user within a single atomic PostgreSQL transaction.",
    details: [
      "Enforces that cluster setup can only run once; rejects subsequent requests with 409 Conflict.",
      "Generates native UUIDv7 IDs for Organization and Super Admin principal.",
      "Hashes initial administrator password using Argon2id with 64MB memory and 3 passes.",
      "Signs in the administrator immediately upon completion, returning an authenticated session.",
    ],
  },
  {
    layer: "API Backend (Go 1.27)",
    packageOrModule: "internal/access",
    symbol: "Can",
    kind: "Service",
    signature:
      "func (e *Evaluator) Can(ctx context.Context, actor *auth.Actor, action string, scope Scope) (bool, error)",
    description:
      "Core authorization engine evaluating hierarchical Role-Based Access Control (RBAC) with ancestor scope inheritance and deny-by-default security.",
    details: [
      "Resolves scope tree: Organization -> Project -> Environment -> Service / Resource.",
      "Evaluates direct user role bindings, team-inherited bindings, and parent scope grants.",
      "Checks time-boxed temporary access expiration timestamps; expires overdue leases dynamically.",
      "Returns true if an explicit permission grant is verified; otherwise denies access.",
    ],
  },
  {
    layer: "API Backend (Go 1.27)",
    packageOrModule: "internal/audit",
    symbol: "Record",
    kind: "Service",
    signature:
      "func (r *Recorder) Record(ctx context.Context, tx pgx.Tx, evt Event) (*AuditEvent, error)",
    description:
      "Appends a tamper-evident event to the audit ledger by computing a SHA-256 cryptographic hash linking the new event to its predecessor.",
    details: [
      "Locks the audit chain head within the active database transaction to guarantee sequential ordering.",
      "Computes record_hash = SHA256(previous_hash || actor_id || action || payload || timestamp).",
      "Executes SQL insert; database triggers prevent any subsequent UPDATE or DELETE statements.",
      "Enables continuous mathematical proof of tamper resistance.",
    ],
  },
  {
    layer: "API Backend (Go 1.27)",
    packageOrModule: "internal/shared/crypto",
    symbol: "HashPasswordArgon2id",
    kind: "Service",
    signature: "func HashPasswordArgon2id(password string) (string, error)",
    description:
      "Hashes plaintext passwords using the memory-hard Argon2id algorithm adhering to OWASP cryptographic guidelines.",
    details: [
      "Generates cryptographically secure 16-byte random salt using crypto/rand.",
      "Configured parameters: Memory = 64MB, Iterations = 3, Parallelism = 2 threads, Key Length = 32 bytes.",
      "Outputs standard PHC encoded string: $argon2id$v=19$m=65536,t=3,p=2$<salt>$<hash>.",
    ],
  },
  {
    layer: "Web Frontend (Next.js 16)",
    packageOrModule: "src/app/api/v1/[...path]",
    symbol: "BFFProxyRouteHandler",
    kind: "Route Handler",
    signature:
      "export async function GET(request: NextRequest, { params }: { params: { path: string[] } })",
    description:
      "Next.js Server-Side Same-Origin BFF Proxy forwarding requests to the upstream Go API over the internal Docker network.",
    details: [
      "Eliminates CORS complexity and enables SameSite=Lax HttpOnly cookie forwarding.",
      "Sanitizes authentication headers; strips stale session cookies on public login and setup routes.",
      "Injects request tracing headers (X-Request-Id, X-Forwarded-For) into upstream requests.",
      "Translates upstream RFC 9457 Problem Details responses transparently to client components.",
    ],
  },
  {
    layer: "Web Frontend (Next.js 16)",
    packageOrModule: "src/components/layout",
    symbol: "Sidebar",
    kind: "Component",
    signature: "export function Sidebar({ className }: { className?: string })",
    description:
      "Responsive navigation sidebar rail supporting collapsed and expanded states with domain-aware route highlighting.",
    details: [
      "Renders primary navigation groups: Overview, Catalog, Dependency Graph, RBAC, Audit, and Settings.",
      "Features quick project switcher and environment tier selector (DEV, QA, UAT, PROD).",
      "Persists user collapse preference via localStorage.",
    ],
  },
  {
    layer: "Web Frontend (Next.js 16)",
    packageOrModule: "src/domain/access",
    symbol: "resolveEffectivePermissions",
    kind: "Service",
    signature:
      "export function resolveEffectivePermissions(bindings: RoleBinding[], targetScope: string): EffectivePermission",
    description:
      "Client-side permission evaluator computing UI element visibility based on hierarchical role bindings.",
    details: [
      "Parses scope hierarchies and checks whether current user possesses ADMIN or WRITE permissions.",
      "Enables proactive disabling of mutation buttons (e.g. Delete Service, Attach Resource) for VIEWER users.",
    ],
  },
];

export const documentationCategories: readonly DocCategory[] = [
  {
    id: "getting-started",
    title: "1. Cluster Deployment & Initial Setup",
    summary:
      "Deploy the full iconfigly platform locally in minutes using Docker Compose with zero cloud cost.",
    sections: [
      {
        id: "prerequisites",
        title: "Prerequisites & Stack Overview",
        description:
          "The platform runs entirely containerized under Docker Desktop, Colima, or native Linux Docker Engine. No cloud accounts, external databases, or paid license keys are required.",
        codeExample: "docker --version && docker compose version",
        bulletPoints: [
          "Docker Desktop 4.25+ or Docker Engine 25+ with Compose v2",
          "Host port 3000 allocated for the Next.js Developer Control Plane (iconfigly-web)",
          "Host port 3001 allocated for the Documentation & Product Site (iconfigly-docs)",
          "Host port 8080 allocated for the Go REST API engine (iconfigly-api)",
          "Host port 5432 allocated for PostgreSQL 18 with native uuidv7() support",
        ],
      },
      {
        id: "bootstrap",
        title: "Starting the Infrastructure",
        description:
          "From the iconfigly-infra directory, initialize all containers in detached mode. The healthcheck gate ensures PostgreSQL is accepting connections before the API boots.",
        codeExample:
          "cd iconfigly-infra\ndocker compose up -d\ndocker compose --profile tools run --rm migrate",
        bulletPoints: [
          "docker compose up -d starts iconfigly-postgres, iconfigly-api, iconfigly-web, and iconfigly-docs",
          "The migrate profile executes versioned SQL migrations (000001_initial_schema.up.sql)",
          "Initial cluster setup wizard becomes available at http://localhost:3000/setup",
          "API health and readiness probes can be verified at http://localhost:8080/health and /ready",
        ],
      },
    ],
  },
  {
    id: "catalog-management",
    title: "2. Service & Infrastructure Catalog",
    summary:
      "Manage projects, multi-tier environments, microservices, and infrastructure resources with declarative bindings.",
    sections: [
      {
        id: "environment-tiers",
        title: "Environment Tiers & Lifecycle Isolation",
        description:
          "iconfigly enforces first-class environment tiers (DEV, QA, UAT, PROD) within each Project aggregate. Each environment maintains strict boundaries and independent infrastructure bindings.",
        bulletPoints: [
          "DEV: Developer sandbox tier with permissive write permissions for squads",
          "QA: Integration testing tier with automated test bindings and mock endpoints",
          "UAT: Staging and user-acceptance tier mirroring production configurations",
          "PROD: Production tier guarded by multi-approver policies and immutable audit logs",
        ],
      },
      {
        id: "resources-and-bindings",
        title: "Infrastructure Resources & Binding Matrix",
        description:
          "Register shared infrastructure resources (PostgreSQL, Redis, Kafka, S3, External APIs) and bind them to microservices per environment with environment-specific connection handles.",
        bulletPoints: [
          "Resource types: POSTGRES, REDIS, KAFKA, S3, EXTERNAL_API",
          "Many-to-many service_resource_bindings prevent duplicate infrastructure definitions",
          "service_dependencies track direct RPC and event consumer relationships between microservices",
          "Single-Pane Context Aggregator renders the complete dependency topology in a unified graph",
        ],
      },
    ],
  },
  {
    id: "rbac-governance",
    title: "3. Scoped RBAC & Access Evaluation",
    summary:
      "Granular hierarchical authorization model enforcing deny-by-default access control across the entire platform.",
    sections: [
      {
        id: "scope-tree",
        title: "Hierarchical Scope Resolution",
        description:
          "Permissions are evaluated across an ancestor scope tree: Organization -> Project -> Environment -> Service / Resource. A grant at a parent scope automatically propagates downward unless explicitly overridden.",
        bulletPoints: [
          "SUPER_ADMIN: Global cluster administrator with bypass authority across all organizations",
          "ADMIN: Full administrative authority within a specific organization or project scope",
          "OPERATOR: Deploy and configure permissions across non-production and staging environments",
          "DEVELOPER: Read and write permissions for assigned services and sandbox environments",
          "VIEWER: Read-only access to catalog definitions and topological graphs",
        ],
      },
      {
        id: "who-has-access",
        title: "Reverse-Lookup Access Inspector",
        description:
          "The Who Has Access inspector computes effective permissions in real time by joining direct user role bindings, team memberships, and ancestor scope inheritance into an unambiguous matrix.",
        bulletPoints: [
          "Instantly answers who can read or mutate a specific production database or microservice",
          "Detects conflicting permission grants and flags unexpected privilege escalation paths",
          "Supports both permanent role bindings and time-boxed temporary access grants",
        ],
      },
    ],
  },
  {
    id: "audit-trail",
    title: "4. Cryptographic Immutable Audit Trail",
    summary:
      "Tamper-evident audit logging engine backed by database triggers and SHA-256 cryptographic hash chains.",
    sections: [
      {
        id: "hash-chain",
        title: "Append-Only Hash Chaining Algorithm",
        description:
          "Every mutation across organizations, users, roles, services, and environments records an immutable audit entry. The current entry's record_hash is computed as the SHA-256 digest of the previous record's hash concatenated with the current event payload.",
        codeExample: "record_hash = SHA256(previous_hash || actor_id || action || payload || timestamp)",
        bulletPoints: [
          "PostgreSQL trigger enforces append-only semantics, rejecting any UPDATE or DELETE operations",
          "Any out-of-band manipulation of past audit records breaks the cryptographic hash sequence",
          "The /api/v1/audit/verify endpoint verifies the entire cryptographic chain on demand",
          "Real-time integrity status indicator in the control plane dashboard confirms ledger validity",
        ],
      },
    ],
  },
  {
    id: "api-reference",
    title: "5. REST API & Error Contracts",
    summary:
      "Machine-readable RFC 9457 Problem Details error specification and canonical REST endpoints.",
    sections: [
      {
        id: "problem-details",
        title: "RFC 9457 Structured Error Contract",
        description:
          "All API errors return application/problem+json with structured, predictable machine-readable error codes rather than generic unstructured messages.",
        codeExample:
          '{\n  "type": "https://iconfigly.dev/errors/unauthorized",\n  "title": "Unauthorized",\n  "status": 401,\n  "detail": "Invalid or expired session cookie.",\n  "instance": "/api/v1/auth/me",\n  "request_id": "019488d5-1c3a-78f0-b9df-2cf39810a901"\n}',
        bulletPoints: [
          "Consistent error format across browser UI, CLI, and future language SDKs",
          "request_id correlation header propagated across all Go middleware and PostgreSQL queries",
          "Granular field-level validation error maps returned for malformed payloads",
        ],
      },
    ],
  },
];

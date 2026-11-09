# iconfigly-docs

Public product website, architectural documentation, and phase engineering blueprints for **iconfigly**, the self-hosted Internal Developer Platform. Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4.

---

## Overview

`iconfigly-docs` serves as the public product showcase, architectural reference, and engineering blueprint repository. It presents the Phase 1 General Availability milestone, details active Phase 2 engineering initiatives, documents key Architectural Decision Records (ADRs), and hosts the complete Phase 1 through Phase 9 engineering blueprints in `phases/`.

| Service | Port | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| `iconfigly-docs` | `3001` | http://localhost:3001 | Product showcase, release notes & architecture |
| `iconfigly-web` | `3000` | http://localhost:3000 | Developer control plane console |
| `iconfigly-api` | `8080` | http://localhost:8080 | Go REST API control plane engine |
| `iconfigly-postgres` | `5432` | `127.0.0.1:5432` | PostgreSQL 18 with native `uuidv7()` |

---

## Repository Structure

```
phases/                    Formal engineering blueprints (Phase 1 through Phase 9)
src/
├── domain/                Domain contracts and models (release notes, architecture, roadmap)
├── content/               Structured engineering copy, ADRs, milestones, and samples
├── components/
│   ├── ui/                Atomic UI primitives (ButtonLink, Badge, Card, Separator)
│   ├── brand/             Logo, arrow badges, and geometric accent decorations
│   ├── icons/             Registry mapping domain IconName to Lucide icons
│   ├── layout/            Page frame, site header, section heading, site footer
│   └── sections/          Hero, showcase, capabilities, architecture, release notes, roadmap, quick start
└── app/                   Next.js App Router root layout, home page, 404, and icon
```

---

## Engineering Highlights & Release Notes

- **v1.0.0 (General Availability)**: Full release notes for all 10 Phase 1 sub-phases:
  - 100% containerized Docker Compose stack (zero cloud cost)
  - Go 1.27.2 modular monolith API using standard library `net/http` router
  - PostgreSQL 18 with native time-ordered `uuidv7()` primary keys and `pgx/v5` connection pooling
  - Argon2id password hashing, server-side revocable sessions, and prefix-indexed PATs
  - Scoped hierarchical RBAC with ancestor inheritance and "Who Has Access?" reverse lookup
  - Append-only PostgreSQL triggers and SHA-256 cryptographic hash-chained audit ledger
  - Next.js 16.4.5 control plane console with same-origin BFF proxying
- **v2.0.0 (In Active Development)**:
  - Automated graph-based blast-radius impact analysis
  - Versioned configuration item core with visual diffing and point-in-time rollbacks
  - Multi-approver change request governance
  - Time-boxed temporary access approval with automatic lease expiry
  - Transactional outbox engine with Mailpit background notifications and webhooks

---

## Commands

### Docker Compose (Recommended)

Run from `iconfigly-infra`:

```bash
# Start the documentation and product site
docker compose up -d docs

# Inspect real-time container logs
docker logs -f iconfigly-docs

# Stop the container
docker compose stop docs
```

The container runs on port `3001` with the repository bind-mounted, enabling Turbopack fast refresh at http://localhost:3001.

### Quality & Build Verification

Execute commands inside the container:

```bash
docker exec iconfigly-docs npm run typecheck
docker exec iconfigly-docs npm run lint
docker exec iconfigly-docs npm run build
```

---

## Environment Variables

| Variable | Default | Description |
| :--- | :--- | :--- |
| `PORT` | `3001` | Listening port for the Next.js server |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Target URL for the Launch Console button |

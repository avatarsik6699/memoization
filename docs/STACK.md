# Stack Guide

> **Source of truth for this project's concrete technologies, tools, and conventions.**
>
> The SDD pipeline (phases, gates, skills, contracts) is stack-agnostic. This file is the only
> place where the workflow learns what to actually run. The `phase-gate` playbook reads
> [`Gate Commands`](#gate-commands) below verbatim — keep that table accurate.
>
> **Stack status:** CONFIGURED

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy async, Alembic, Pydantic v2 |
| Frontend | React 19, React Router SSR, Vite, TypeScript, Tailwind |
| Database | PostgreSQL 18 |
| Cache | Redis 8 |
| Infra | Docker Compose, Nginx |
| Package managers | uv (backend), pnpm (frontend) |
| CI | Local gate commands; CI provider TBD |

---

## Frontend Libraries

| Concern | Library / tool |
|---------|----------------|
| Rich text editor | Tiptap open-source editor on ProseMirror |
| Local IndexedDB | Dexie.js |
| Server state | TanStack Query |
| Global UI/app state | Zustand |
| Drag and drop | dnd-kit |
| PWA / service worker | vite-plugin-pwa with Workbox |
| Syntax highlighting | lowlight / highlight.js |
| Tree virtualization | @tanstack/virtual |
| i18n | react-i18next with lazy-loaded locale JSON |
| Theme state | Existing React/Tailwind theme utilities or a small local hook |

Use current stable package versions available at implementation time, with `pnpm-lock.yaml`
capturing exact versions.

Do not use Tiptap Platform, Tiptap Cloud, paid Pro extensions, managed collaboration, AI services,
or paid import/export features without a separate architecture decision.

---

## Frontend Module Boundaries

Keep these modules separable so the document workspace can later be embedded in other applications:

| Module | Owns | Must not depend on |
|--------|------|--------------------|
| `editor` | Tiptap setup, extensions, slash menu, editor chrome, serialization | Standalone app shell routes |
| `document-tree` | Tree UI, ordering, drag/drop, selection | Auth screens or deployment domain |
| `storage` | `StorageAdapter`, `LocalAdapter`, `CloudAdapter`, migration helpers | React layout/sidebar components |
| `publication` | Read-only document rendering, share/publish UI | Private app navigation |
| `app-shell` | Current `memoization.ru` layout and navigation | Reusable document internals |

Design services and APIs around document/workspace concepts, not only "my notes" UI labels.
`user_id` ownership is sufficient for MVP, but avoid backend boundaries that would block a future
`workspace_id`.

---

## Prerequisites

```bash
docker --version
docker compose version
uv --version
node --version
pnpm --version
```

---

## Initial setup

```bash
cp .env.example .env
uv sync --dev
cd frontend && pnpm install
cd ..
docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --build
```

---

## Gate Commands

This section is the human-readable command source for the [`phase-gate`](playbooks/phase-gate.md)
workflow. Fill every row that applies to this project. Mark `n/a` for rows that do not apply
(e.g. no frontend → frontend rows are `n/a`). The phase-gate playbook will report `SKIPPED — n/a in
STACK.md` for those.

| Gate check | Command | Preconditions / notes |
|------------|---------|-----------------------|
| Infrastructure / bootstrap | `cp .env.example .env && docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --build` | Run from repo root; waits through Docker healthchecks. |
| Migrations | `uv run alembic upgrade head` | Run from repo root after infrastructure is up. |
| Backend / unit tests | `uv run pytest tests/ -v` | Run from repo root. |
| Frontend prep | `cd frontend && pnpm install` | Install frontend dependencies before frontend checks. |
| Frontend type-check | `cd frontend && pnpm typecheck` | |
| Frontend unit tests | `cd frontend && pnpm test` | |
| E2E lint / determinism | `n/a` | |
| E2E | `cd frontend && pnpm test:e2e:chromium` | Requires app reachable at `localhost:3000` and API at `localhost:8000`. |
| Smoke | `curl -f http://localhost:8000/api/v1/health && curl -f http://localhost:3000/` | Requires Docker Compose stack from infrastructure gate. |

If the project ships a helper script, declare it:

```bash
# none
```

---

## Testing

### Backend

```bash
uv run alembic upgrade head
uv run pytest tests/ -v
```

### Frontend (if applicable)

```bash
cd frontend && pnpm typecheck
cd frontend && pnpm test
cd frontend && pnpm test:e2e:chromium
```

---

## Project structure

```
.
├── docs/                   # SPEC, CONTEXT, STATE, CHANGELOG, PHASE_XX, STACK (this file), playbooks
├── .claude/skills/         # Claude Code skill wrappers
├── plugins/sdd-workflow/   # Codex plugin (skills, commands, MCP, hooks)
├── app/                    # FastAPI backend
├── alembic/                # Database migrations
├── frontend/               # React Router frontend
├── tests/                  # Backend tests
├── nginx/                  # Nginx config
└── AGENTS.md / CLAUDE.md   # AI agent rules
```

---

## Common operations

```bash
# Start the stack
docker compose -f docker-compose.yml -f docker-compose.ci.yml up -d --build

# Stop everything
docker compose -f docker-compose.yml -f docker-compose.ci.yml down

# Add a new migration / schema change
uv run alembic revision --autogenerate -m "describe change"

# Format / lint
uv run ruff check . && uv run ruff format --check .
cd frontend && pnpm lint
```

## Collaboration

Human collaboration and Git flow rules live in [`docs/CONTRIBUTING.md`](CONTRIBUTING.md).
Agent operating rules live in [`AGENTS.md`](../AGENTS.md).

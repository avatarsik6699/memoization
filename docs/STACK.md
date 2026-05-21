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

## Frontend Code Organization

- Components are arrow-function components. When props are accepted, type them as `React.FC<Props>`.
- Keep one primary component per file. Extract repeated or responsibility-specific JSX into
  colocated `components/` files under the owning module or root component.
- Local state/effect clusters belong in focused colocated hooks under `hooks/`; name effect bodies
  with an `Fx` suffix, for example `useEffect(function syncRouteFx() {}, [])`.
- Use `type` for object types. Do not introduce handwritten `interface` types except generated
  OpenAPI output or declaration merging files that require interfaces.
- Module-wide reusable types belong in `module-name.types.ts` and should be exported from a
  namespace such as `DocumentTreeTypes` or `RichTextEditorTypes`.
- Keep module utilities in `utils/`, constants and static configs in `constants/`, and contexts in
  `context/`. Promote code to `shared`, `entities`, or `features` only when it is reused outside
  the owning module.
- App code must use `@/shared/lib/router` `useRouter` for route params, navigation, browser
  history actions, location state, and route path builders. Direct React Router routing hooks stay
  inside that wrapper.
- App code must use `@/shared/lib/search-params` `useSearchParams` for URL search params. Each
  caller must provide a Zod schema and fallback value; direct React Router `useSearchParams` stays
  inside that wrapper.
- Do not destructure component props, method arguments, custom hook params, or object-returning hook
  results in implementation code. Components use `props.field`, custom hooks use `params.field`,
  and methods use `args.field`; assign hook results to one named variable and read through dot
  notation.
- App-owned localStorage and app-owned JSON parsing/stringifying must go through
  `@/shared/lib/safe-ls` and `@/shared/lib/safe-json`. Protocol serialization in API clients and
  tests may use native JSON APIs where the browser/fetch contract requires it.
- Date/time work must go through `@/shared/lib/date` so timestamps, epoch reads, and duration
  presets stay consistent.

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

Host `uv sync` and `pnpm install` are dependency setup commands only. Backend services, migrations,
seeds, backend tests, PostgreSQL, Redis, and FastAPI must run through Docker Compose.

Playwright E2E is the one documented exception to the Docker-only rule: browsers are installed once
on the developer host and E2E tests run from the host against the frontend exposed at
`http://localhost:3000`.

---

## Gate Commands

This section is the human-readable command source for the [`phase-gate`](playbooks/phase-gate.md)
workflow. Fill every row that applies to this project. Mark `n/a` for rows that do not apply
(e.g. no frontend → frontend rows are `n/a`). The phase-gate playbook will report `SKIPPED — n/a in
STACK.md` for those.

| Gate check | Command | Preconditions / notes |
|------------|---------|-----------------------|
| Infrastructure / bootstrap | `cp .env.example .env && docker compose up -d --build` | Run from repo root; uses the development override and waits through Docker healthchecks. |
| Migrations | `docker compose exec backend uv run alembic upgrade head` | Run from repo root after infrastructure is up. |
| Backend / unit tests | `docker compose exec backend uv run pytest tests/ -v` | Run from repo root after infrastructure is up. |
| Frontend prep | `docker compose exec frontend pnpm install` | Install frontend dependencies in the frontend container before frontend checks. |
| Frontend API types | `docker compose exec frontend pnpm generate:api` | Required after API changes; commit the generated `frontend/app/shared/types/schema.ts`. |
| Frontend type-check | `docker compose exec frontend pnpm typecheck` | |
| Frontend unit tests | `docker compose exec frontend pnpm test` | |
| E2E lint / determinism | `n/a` | |
| E2E | `cd frontend && pnpm test:e2e:local` | Manual local exception to Docker-only. First-time setup: `cd frontend && pnpm test:e2e:install`. Requires Docker stack reachable at `localhost:3000` and API at `localhost:8000`. |
| Smoke | `curl -f http://localhost:8000/api/v1/health && curl -f http://localhost:3000/` | Requires Docker Compose stack from infrastructure gate. |

If the project ships a helper script, declare it:

```bash
# none
```

---

## Testing

### Backend

```bash
docker compose exec backend uv run alembic upgrade head
docker compose exec backend uv run pytest tests/ -v
```

### Frontend (if applicable)

```bash
docker compose exec frontend pnpm generate:api
docker compose exec frontend pnpm typecheck
docker compose exec frontend pnpm test
cd frontend && pnpm test:e2e:install # first local setup only
cd frontend && pnpm test:e2e:local
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
docker compose up --build

# Stop everything
docker compose down

# Add a new migration / schema change
docker compose exec backend uv run alembic revision --autogenerate -m "describe change"

# Format / lint
docker compose exec backend uv run ruff check . && docker compose exec backend uv run ruff format --check .
docker compose exec frontend pnpm lint

# Regenerate frontend API types after API changes
docker compose exec frontend pnpm generate:api

# Seed development data
docker compose exec backend uv run python scripts/seed.py --list
docker compose exec backend uv run python scripts/seed.py --seeder demo_data
```

## API Types

`frontend/app/shared/types/schema.ts` is generated from FastAPI OpenAPI output with
`openapi-typescript`. It is the only source of truth for frontend API request/response types.

After changing any FastAPI endpoint, request schema, response schema, status code response shape, or
OpenAPI-visible Pydantic model, run:

```bash
docker compose exec frontend pnpm generate:api
```

Commit the generated `schema.ts` diff with the backend API change. Do not hand-write duplicate
frontend API types.

## Seed Data

Seeders run inside the backend container:

```bash
docker compose exec backend uv run python scripts/seed.py --list
docker compose exec backend uv run python scripts/seed.py --dry-run
docker compose exec backend uv run python scripts/seed.py --seeder demo_data
```

Seeders must be idempotent. Re-running the same seeder must not duplicate rows.

## Collaboration

Human collaboration and Git flow rules live in [`docs/CONTRIBUTING.md`](CONTRIBUTING.md).
Agent operating rules live in [`AGENTS.md`](../AGENTS.md).

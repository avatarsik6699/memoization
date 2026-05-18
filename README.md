# Template App

Reusable starter based on the current stack:
- Backend: FastAPI, SQLAlchemy async, Alembic, Pydantic v2
- Frontend: React 19, React Router SSR, Vite, TypeScript, Tailwind
- Infra: PostgreSQL, Redis, Docker Compose, Nginx

## Prerequisites

- `docker` + `docker compose`
- `uv`
- `node` + `pnpm`

## Run

```bash
cp .env.example .env
docker compose up --build
```

## Backend checks

```bash
docker compose exec backend uv run alembic upgrade head
docker compose exec backend uv run pytest tests/ -v
```

## Frontend checks

```bash
docker compose exec frontend pnpm generate:api
docker compose exec frontend pnpm typecheck
docker compose exec frontend pnpm test
docker compose exec frontend pnpm build
```

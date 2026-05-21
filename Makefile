.PHONY: dev down install migrate seed seed-demo seed-all migrate-seed lint test e2e-install e2e deploy deploy-logs deploy-ps

dev:
	docker compose up --build

down:
	docker compose down

install:
	uv sync --dev

migrate:
	docker compose exec backend uv run alembic upgrade head

seed:
	docker compose exec backend uv run python scripts/seed.py --seeder demo_data

seed-demo:
	docker compose exec backend uv run python scripts/seed.py --seeder demo_data

seed-all:
	docker compose exec backend uv run python scripts/seed.py

migrate-seed: migrate seed

lint:
	docker compose exec backend uv run ruff check . && docker compose exec backend uv run ruff format --check .

test:
	docker compose exec backend uv run pytest

e2e-install:
	cd frontend && pnpm test:e2e:install

e2e:
	cd frontend && pnpm test:e2e:local

# ── VPS deploy ─────────────────────────────────────────────────────────────
# Usage: make deploy VPS_USER=ubuntu VPS_HOST=1.2.3.4 PROJECT_DIR=/opt/my-project
VPS_USER    ?= deploy
VPS_HOST    ?= $(shell grep ^DOMAIN .env 2>/dev/null | cut -d= -f2)
PROJECT_DIR ?= /opt/$(shell basename $(CURDIR))

deploy:
	ssh $(VPS_USER)@$(VPS_HOST) \
	  "cd $(PROJECT_DIR) && \
	   git pull && \
	   docker compose -f docker-compose.yml -f docker-compose.prod.yml \
	     up -d --build --remove-orphans"

deploy-logs:
	ssh $(VPS_USER)@$(VPS_HOST) \
	  "cd $(PROJECT_DIR) && docker compose logs -f backend frontend nginx"

deploy-ps:
	ssh $(VPS_USER)@$(VPS_HOST) \
	  "cd $(PROJECT_DIR) && docker compose ps"

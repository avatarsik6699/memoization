# Decisions Log (ADRs)

> Architectural decisions for this project. Lightweight ADR format — capture the trade-off,
> not implementation detail. Newest entry on top.

---

### [2026-05-19] — Docker-only development and generated API types

**Status**: accepted
**Context**: Host-run FastAPI, PostgreSQL, or Redis can compete with Docker services and hide code-version drift. Handwritten frontend API types can drift from FastAPI contracts.
**Decision**: Run backend services, migrations, backend tests, and seeders through Docker Compose. Generate `frontend/app/shared/types/schema.ts` from FastAPI OpenAPI with `pnpm generate:api` after API changes. Use generated `paths` and `components` types in frontend API wrappers.
**Alternatives considered**: Allow host service commands for convenience; rejected because the project prioritizes reproducibility and avoiding hidden competing instances.
**Consequences**: Contributors must keep Docker running for normal backend work and commit generated schema diffs with API changes.
**Links**: [`docs/STACK.md`](STACK.md), [`AGENTS.md`](../AGENTS.md)

---

### [2026-05-19] — Reusable idempotent seeders

**Status**: accepted
**Context**: Development and testing need quick repeatable data setup without manual database edits.
**Decision**: Add a Docker-run seed runner with registered idempotent seeders. Start with `demo_data` for the existing memoization user model and extend it with document/page records when those models land.
**Alternatives considered**: Ad hoc SQL fixtures or copying patient-tracker domain data; rejected because seed data must match this project's domain and current schema.
**Consequences**: New seed data must be added through `app/seeders` and must be safe to run repeatedly.
**Links**: [`scripts/seed.py`](../scripts/seed.py)

---

### [2026-05-19] — Parallel phase-scoped Git flow

**Status**: accepted
**Context**: The project will be developed by an architect and a student in parallel. The original single `feat/phase-N` branch rule would make concurrent work conflict-prone and unclear.
**Decision**: Use phase-scoped task branches such as `feat/phase-01-auth`, `fix/phase-01-settings`, and `docs/phase-01-contracts`. Merge work through reviewed PRs into the integration branch. Keep one PR focused on one phase checklist item or a small related group.
**Alternatives considered**: A single shared branch per phase was simpler but made ownership, review, and conflict handling weaker for two developers.
**Consequences**: Contributors must explicitly claim tasks, keep file ownership narrow, and coordinate high-conflict files such as phase docs, migrations, and API contracts.
**Links**: [`docs/CONTRIBUTING.md`](CONTRIBUTING.md), [`AGENTS.md`](../AGENTS.md)

---

<!--
### [YYYY-MM-DD] — [Short title]

**Status**: proposed | accepted | superseded | deprecated
**Context**: [What forced the decision? What constraints applied?]
**Decision**: [What was decided?]
**Alternatives considered**: [What else was on the table and why it was rejected?]
**Consequences**: [What changes because of this — good and bad?]
**Links**: [optional — PR, issue, external reference]
-->

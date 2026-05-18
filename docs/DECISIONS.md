# Decisions Log (ADRs)

> Architectural decisions for this project. Lightweight ADR format — capture the trade-off,
> not implementation detail. Newest entry on top.

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

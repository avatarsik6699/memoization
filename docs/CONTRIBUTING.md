# Contributing Guide

This project is developed by an architect and a student in parallel. The goal of this guide is to keep work reviewable, avoid branch conflicts, and preserve the SDD phase workflow.

## Branch Model

Use phase-scoped feature branches:

```bash
feat/phase-01-auth
fix/phase-01-db-settings
docs/phase-01-contracts
test/phase-01-healthcheck
refactor/phase-01-api-layout
```

Do not push directly to `main` or `develop`. If `develop` does not exist yet, open PRs into the current protected integration branch chosen by the architect.

Do not work in another developer's branch unless they explicitly hand it off or invite collaboration.

## Starting Work

1. Pull the latest integration branch.
2. Pick one unchecked task or a small related group from `docs/PHASE_XX.md`.
3. Claim the task in GitHub Issues, a draft PR, or `docs/PHASE_XX_NOTES.md` if no issue exists yet.
4. Create a new phase-scoped branch.

```bash
git checkout develop
git pull
git checkout -b feat/phase-01-auth
```

If the project only has `main` at the moment, replace `develop` with `main` until the architect creates `develop`.

## Working Rules

- One branch should represent one logical task.
- Keep commits atomic and use conventional commit messages.
- Avoid unrelated refactors in feature branches.
- Keep file ownership narrow. If two people need the same file, coordinate before editing.
- Pull latest before editing phase docs or other high-conflict files.
- Do not mark a phase checklist item complete until the implementation exists and relevant checks pass.

High-conflict files:

- `docs/SPEC.md`
- `docs/CONTEXT.md`
- `docs/STATE.md`
- `docs/PHASE_XX.md`
- `docs/PHASE_XX_NOTES.md`
- Alembic migration files
- shared API type/schema files

Only one person should create or edit database migrations at a time.

## Contract Changes

Ask the architect before changing:

- `docs/SPEC.md`
- API contracts
- database schema
- auth/security behavior
- deployment topology
- package manager or stack choices

When `docs/SPEC.md` changes, follow the Spec Change Sync Protocol in `AGENTS.md`.

## Pull Requests

Open a PR as soon as the shape of the work is clear. Draft PRs are acceptable.

Each PR should include:

- phase number and task IDs or checklist items;
- short summary of behavior changed;
- files or modules touched;
- gate commands run and their result;
- screenshots for visible UI changes;
- notes about migrations, env vars, or API changes.

Before requesting review:

```bash
git fetch origin
git merge origin/develop
```

If `develop` does not exist yet, merge the current integration branch instead.

Run the phase gate before merge. A green test run is not enough if `Architect Review Notes` still contains unchecked items.

## Review Rules

- Every PR should be reviewed by the other human developer.
- Agent-generated code still needs human review.
- Review should focus on correctness, phase scope, missing tests, security, and maintainability.
- Resolve review comments with additional commits. Do not rewrite shared branch history.

## Merge And Phase Completion

Merge PRs into `develop` after review and passing gates.

After all tasks in a phase are merged:

1. Run `phase-gate N`.
2. Resolve all unchecked `Architect Review Notes`.
3. Run `context-update N`.
4. Tag the phase after the phase branch or integration branch is merged:

```bash
git tag -a v0.N.0 -m "Phase N: [title]"
git push origin v0.N.0
```

## Conflict Handling

When conflicts happen:

- Prefer small conflict-resolution commits.
- Do not delete another developer's work to make the merge easy.
- If the conflict changes behavior or contracts, ask the architect before resolving.
- If a branch becomes stale, merge the integration branch into it instead of rebasing shared history.

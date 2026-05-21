# CHANGELOG — Spec & Architecture History

> Records changes to `docs/SPEC.md` and `docs/CONTEXT.md`. This is **NOT** a git commit log.
> Purpose: capture *why* the contract changed and which phases were affected.
> Format: newest entry at top.

---

## [2026-05-21] — Phase 01 complete

**Type**: phase-completion
**Author**: AI (context-update)
**Triggered by**: PHASE_01 gate passed

### Changes
- Built the anonymous offline editor workspace for `/` and `/:nodeId`.
- Added Dexie-backed local persistence, document tree operations, Tiptap editing/autosave, i18n, theme support, storage visibility, PWA manifest/service worker behavior, and offline fallback.

### Affected Phases
- None (additive change)

### Contract Updates
- Added IndexedDB database `notesapp_v1` with `nodes`, `pages`, `uploads`, and `pending_changes` stores.
- Added frontend contracts/types for `StorageAdapter`, `LocalAdapter`, `Page`, `TreeNode`, `CreateNodeInput`, local Dexie records, `TiptapDocumentJSON`, `ThemeMode`, and `LanguageCode`.
- Added active UI routes `/` and `/:nodeId`.
- No new PostgreSQL tables, backend API endpoints, or environment variables.

### Notes
- Anonymous uploads remain base64 in IndexedDB until a future cloud migration phase uploads images through `/api/upload/image`.

## [2026-05-20] — Root Workspace Route

**Type**: spec-change
**Author**: AI (spec-sync)
**Triggered by**: Architect requested removing template chrome and making the workspace the root app surface.

### Changes
- `SPEC.md` §2.2, §5.1, and §5.6 now define the anonymous workspace at `/`, selected pages at `/:nodeId`, and PWA `start_url=/`.

### Affected Phases
- PHASE_01 — anonymous workspace routing and PWA manifest behavior changed from `/app` to `/`.

### Contract Updates
- No backend API, database, generated type, or environment contract change.

### Notes
- `CONTEXT.md` was left unchanged because active UI pages are not yet captured there.

---

## v1.0 — 2026-05-18 — Initial Setup

**Type**: initial-setup
**Author**: v.godlevskiy
**Triggered by**: Project initialization with SDD workflow

### Changes
- `SPEC.md` created: project goals, roles, data model, API/contract, phase plan
- `CONTEXT.md` v1.0 created: initial stack snapshot
- `STACK.md` populated with build/test/run commands

### Affected Phases
- None (initial state)

### Contract Updates
- `CONTEXT.md` initialized at `v1.0`

---

<!--
ENTRY TEMPLATE — copy this block when adding a new entry:

## [CONTEXT_VERSION] — [YYYY-MM-DD] — [Short Title]

**Type**: spec-change | arch-decision | breaking-change | phase-completion | addendum
**Author**: [name / AI skill]
**Triggered by**: [What caused this? User request, bug discovery, new requirement, etc.]

### Changes
- [bullet: what specifically changed in SPEC.md or the architecture]

### Affected Phases
- PHASE_XX — [why it is affected]

### Contract Updates
- `CONTEXT.md` bumped from `vX.Y` to `vX.Z`
- [list schema / endpoint / type changes]

### Notes
[Trade-offs, decisions, context not captured elsewhere]

-->

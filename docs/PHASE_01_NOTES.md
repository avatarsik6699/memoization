# PHASE 01 — Implementation Notes

<!--
  WHAT to build → docs/PHASE_01.md  (contracts, scope checklist)
  HOW it was built → this file      (plans, decisions, rationale)

  Ownership rules:
  - ### Exploration          — written by agent (/phase-explore). Optional; skip for simple tasks.
  - ### Implementation Plan  — written by agent (/impl-brief). Agent may update only this section.
  - ### Decisions & Notes    — written by human. NEVER overwritten by agent.

  Sync rule: task IDs (B1, F1, I1 …) must match the Scope checklist in PHASE_01.md.
  To add an unplanned task discovered mid-phase, run /phase-add-task 01 "description" — it
  assigns the next ID, derives contracts, and generates explore + impl-brief automatically.
  To mark a removed task: prefix its heading with ~~, e.g. ## ~~B3~~ (removed). Do not delete.
-->

_Phase:_ `01` · _Generated:_ `2026-05-20`

---

## D1 — Implement Dexie local schema
**Depends on:** —

### Exploration
<!-- Optional. Run `/phase-explore 01 D1` to populate.
     When filled, impl-brief uses this instead of re-reading the codebase from scratch.
     Leave empty for simple additive tasks. -->

### Implementation Plan
<!-- Run `/impl-brief 01 D1` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F1 — Build anonymous app shell
**Depends on:** —

### Exploration
<!-- Optional. Run `/phase-explore 01 F1` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F1` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F2 — Implement StorageAdapter and LocalAdapter
**Depends on:** D1

### Exploration
<!-- Optional. Run `/phase-explore 01 F2` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F2` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F3 — Build local file tree
**Depends on:** F2

### Exploration
<!-- Optional. Run `/phase-explore 01 F3` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F3` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F4 — Build Tiptap editor and autosave
**Depends on:** F2

### Exploration
<!-- Optional. Run `/phase-explore 01 F4` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F4` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F5 — Add i18n and theme support
**Depends on:** F1

### Exploration
<!-- Optional. Run `/phase-explore 01 F5` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F5` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F6 — Add anonymous storage panel
**Depends on:** F2

### Exploration
<!-- Optional. Run `/phase-explore 01 F6` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F6` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F7 — Add PWA and offline fallback
**Depends on:** F1

### Exploration
<!-- Optional. Run `/phase-explore 01 F7` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F7` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## F8 — Verify responsive workspace behavior
**Depends on:** F1, F3, F4

### Exploration
<!-- Optional. Run `/phase-explore 01 F8` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 F8` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

## I1 — Ensure frontend gate coverage
**Depends on:** F7

### Exploration
<!-- Optional. Run `/phase-explore 01 I1` to populate. -->

### Implementation Plan
<!-- Run `/impl-brief 01 I1` to generate. Output includes: Done when / Follows pattern / steps. -->

### Decisions & Notes
<!-- Document implementation decisions, deviations from plan, and lessons learned. -->

---

## Review Notes Fixes

### [R8] — Refactor frontend component architecture conventions
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/offline-workspace.tsx` — combines route access, storage orchestration, editor title UI, sidebar JSX, install prompt state, and date formatting in one component.
- `frontend/app/modules/document-tree/document-tree.tsx` — declares `TreeItem` inside the same file as the root tree component.
- `frontend/app/modules/editor/rich-text-editor.tsx` — combines command metadata, Tiptap setup, menu keyboard handling, drag handle state, selection toolbar JSX, and command menu JSX in one component.

**Observed issue:**
- Several files contain multiple functional components or large JSX/state clusters that can be split by responsibility into local `components/`, `hooks/`, `utils/`, `constants/`, and module type files.

**Risk areas:**
- Refactor must preserve existing editor/tree behavior and Playwright selectors.

#### Implementation Plan

**Done when:** Phase 01 frontend modules use one primary component per file where practical, local JSX sections are extracted into named components, related state/effects move into local hooks, and docs capture the new component conventions.

**Files:**
- `frontend/app/modules/app-shell/**`
- `frontend/app/modules/document-tree/**`
- `frontend/app/modules/editor/**`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Split app-shell UI into workspace/sidebar/topbar/editor-canvas components with a local workspace hook.
2. Split document-tree root/actions/item files and module-level types.
3. Split editor command metadata, menus, drag handle, and keyboard/state hooks out of the rich text component.
4. Document the conventions in `docs/STACK.md` and mark the review note fixed after focused checks pass.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:lint`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/app-shell/**` — split workspace UI into colocated components, hooks, constants, utils, and `offline-workspace.types.ts`.
- `frontend/app/modules/document-tree/**` — split tree root, action bar, tree item, drag hook, and `document-tree.types.ts`.
- `frontend/app/modules/editor/**` — moved command metadata, slash-trigger helpers, drag-handle visibility, JSON content comparison, and menu components out of the editor component.
- `frontend/app/shared/ui/**`, `frontend/app/root.tsx`, `frontend/app/routes/*.tsx` — converted user-facing components to arrow-function components with `React.FC` typing where applicable.
- `docs/STACK.md` — added durable frontend code-organization rules.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- The editor component still owns Tiptap instance creation and keyboard orchestration because those callbacks are tightly coupled to editor refs; the visible JSX and reusable helpers were extracted without changing behavior.

### [R9] — Require safe localStorage and JSON wrappers
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/shared/lib/safe-json.ts` — existing guarded JSON wrapper.
- `frontend/app/shared/lib/safe-ls.ts` — existing versioned localStorage wrapper.
- `frontend/app/modules/app-shell/offline-workspace.tsx` — reads and writes `window.localStorage` directly for workspace name.
- `frontend/app/modules/editor/rich-text-editor.tsx` — compares Tiptap JSON by calling `JSON.stringify` directly.

**Observed issue:**
- Phase 01 code still uses raw localStorage and JSON serialization outside the shared wrappers.

**Risk areas:**
- API client request serialization and tests may legitimately need JSON APIs; this fix targets app persistence/typed local state rather than replacing protocol serialization.

#### Implementation Plan

**Done when:** typed local persistence uses `safe-ls`, non-protocol JSON comparisons use `safe-json`, and docs explicitly require wrappers for app localStorage and app-owned JSON persistence/parsing.

**Files:**
- `frontend/app/modules/app-shell/constants/storage.ts`
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts`
- `frontend/app/modules/editor/utils/editor-content.ts`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Add a typed workspace-name storage key and guard.
2. Replace direct workspace-name localStorage calls with `safeLs.get/set`.
3. Add a small Tiptap JSON equality helper using `safeJson.stringify`.
4. Document the wrapper rule and mark the review note fixed after checks.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/app-shell/constants/storage.ts` — added a versioned typed workspace-name storage key.
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — replaced direct workspace-name localStorage calls with `safeLs.get` and `safeLs.set`.
- `frontend/app/modules/editor/utils/editor-content.ts` — compares editor JSON through `safeJson.stringify` instead of raw stringify calls in the component.
- `docs/STACK.md` — documented the wrapper rule and the API-client/test exception for protocol JSON.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- Native JSON remains in API protocol serialization and tests by design; app-owned persistence and comparison code now uses the wrappers.

### [R10] — Add a typed routing entry point
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/offline-workspace.tsx` — imports `useParams` and `useNavigate` directly.
- `frontend/app/routes/_index.tsx` and `frontend/app/routes/$nodeId.tsx` — route files render the workspace without local route logic.

**Observed issue:**
- Route navigation and params are accessed ad hoc instead of through a single typed project hook.

**Risk areas:**
- React Router primitives should remain encapsulated in the shared hook; route modules themselves may still be framework entry points.

#### Implementation Plan

**Done when:** app code uses `useRouter` for Phase 01 navigation/params, direct `useParams`/`useNavigate` are absent outside the shared routing wrapper, and docs record the routing rule.

**Files:**
- `frontend/app/shared/lib/router.ts`
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Add a typed `useRouter` hook that exposes current `nodeId`, typed page navigation, root navigation, and search param helpers.
2. Migrate app-shell logic from direct React Router hooks to `useRouter`.
3. Document that app code should use `useRouter` rather than separate React Router hooks.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`

#### Implementation Notes

**Files changed:**
- `frontend/app/shared/lib/router.ts` — added typed `useRouter` with route params, node/root navigation, and search param access.
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — migrated workspace route params and navigation to `useRouter`.
- `docs/STACK.md` — documented that app code should use `useRouter`, with direct React Router hooks isolated to the wrapper.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed

**Residual risk:**
- `useRouter` currently covers Phase 01 route needs; future routes should extend this wrapper rather than importing React Router hooks directly in feature code.

### [R11] — Add shared date utilities
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/offline-workspace.tsx` — parses ISO timestamps and calculates relative minutes with raw `Date`.
- `frontend/app/modules/storage/local-adapter.ts` — creates timestamps and fallback IDs with raw `Date`.

**Observed issue:**
- Date and time operations are duplicated directly in feature modules.

**Risk areas:**
- Keep helpers minimal so Phase 01 behavior does not change.

#### Implementation Plan

**Done when:** Phase 01 code uses `shared/lib/date.ts` for ISO timestamps, epoch reads, current epoch reads, and minute/hour/day presets used by relative labels.

**Files:**
- `frontend/app/shared/lib/date.ts`
- `frontend/app/modules/app-shell/utils/format-relative-update.ts`
- `frontend/app/modules/storage/local-adapter.ts`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Add a small `appDate` wrapper with timestamp and duration helpers.
2. Move relative update formatting to an app-shell utility that uses `appDate`.
3. Replace storage timestamp/fallback ID raw date calls with `appDate`.
4. Document the date utility rule.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`

#### Implementation Notes

**Files changed:**
- `frontend/app/shared/lib/date.ts` — added `appDate` helpers for ISO timestamps, epoch reads, parsing, and duration constants.
- `frontend/app/modules/app-shell/utils/format-relative-update.ts` — moved relative update formatting out of the workspace component and onto `appDate`.
- `frontend/app/modules/storage/local-adapter.ts` — replaced direct timestamp and fallback-ID time reads with `appDate`.
- `docs/STACK.md` — documented the shared date utility rule.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed

**Residual risk:**
- `appDate` is intentionally small for Phase 01; future formatting/localization presets can be added there as repeated usage appears.

### [R12] — Extract state/effect clusters into focused hooks
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/offline-workspace.tsx` — mixes workspace lifecycle, autosave, route sync, tree operations, install prompt, and mobile drawer state.
- `frontend/app/modules/editor/rich-text-editor.tsx` — mixes slash menu refs, active command index, drag handle state, Tiptap external content sync, and flush-on-unmount effects.
- `frontend/app/modules/document-tree/document-tree.tsx` — keeps drag state in the root component while item rendering lives in the same file.

**Observed issue:**
- Related state/effects are spread through large components instead of grouped in custom hooks by responsibility.

**Risk areas:**
- Hook extraction should preserve callback identities where existing debounced autosave and editor event listeners depend on them.

#### Implementation Plan

**Done when:** workspace orchestration, editor command-menu state, editor drag-handle state, and tree drag state live in focused local hooks, leaving components mostly declarative.

**Files:**
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts`
- `frontend/app/modules/app-shell/hooks/use-install-prompt.ts`
- `frontend/app/modules/editor/hooks/use-command-menu.ts`
- `frontend/app/modules/editor/hooks/use-drag-handle-state.ts`
- `frontend/app/modules/document-tree/hooks/use-tree-drag.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Move app-shell state/effects/actions into `useOfflineWorkspace` and install prompt into `useInstallPrompt`.
2. Move editor menu and drag-handle state/ref synchronization into local editor hooks.
3. Move document-tree drag state into `useTreeDrag`.
4. Mark the review note fixed after checks pass.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — owns workspace lifecycle, route sync, tree operations, autosave, active page state, and workspace name persistence.
- `frontend/app/modules/app-shell/hooks/use-install-prompt.ts` — owns PWA install prompt event binding and prompt execution.
- `frontend/app/modules/document-tree/hooks/use-tree-drag.ts` — owns document-tree drag state.
- `frontend/app/modules/editor/rich-text-editor.tsx` — effect bodies were named with `Fx` suffix and JSX responsibility moved to menu components; tightly coupled Tiptap keyboard state remains colocated with the editor instance.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- Further editor keyboard extraction is possible, but the current split avoids changing Tiptap event ordering while removing the largest mixed-responsibility JSX and utility code.

### [R13] — Ban destructuring in frontend implementation code
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/offline-workspace.tsx` — destructured translation/install hooks and kept sidebar JSX in a local variable.
- `frontend/app/modules/app-shell/components/*.tsx` — accepted props through destructured component parameters.
- `frontend/app/modules/document-tree/**/*.tsx` — destructured hook return values and tree item props.
- `frontend/app/modules/editor/rich-text-editor.tsx` — destructured props, hook return objects, and Tiptap callback params.
- `frontend/app/shared/ui/*.tsx` and `frontend/app/root.tsx` — contained destructured props and translation/theme hook results.

**Observed issue:**
- Phase 01 frontend implementation code still used destructuring in components and hook results, which obscured the source object for values the architect wants read through dot notation.

**Risk areas:**
- Existing third-party UI primitives and generated/declaration files were not broadened in this note; the fix focuses on the Phase 01 app modules and shared app wrappers touched by the current workflow.

#### Implementation Plan

**Done when:** Phase 01 app-shell, document-tree, editor, root, and shared app UI files consume component props, hook results, and callback params through named variables plus dot notation, and `docs/STACK.md` records the rule for future code.

**Files:**
- `frontend/app/modules/app-shell/**`
- `frontend/app/modules/document-tree/**`
- `frontend/app/modules/editor/**`
- `frontend/app/shared/lib/app-provider.tsx`
- `frontend/app/shared/lib/query-provider.tsx`
- `frontend/app/shared/ui/**`
- `frontend/app/root.tsx`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Replace destructured component params with `props` dot access.
2. Replace object-returning hook destructuring with named controller variables.
3. Replace destructured callback params in editor integrations with `params` dot access.
4. Document the convention in `docs/STACK.md` and verify with typecheck/tests.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/app-shell/**` — replaced props/hook destructuring, removed sidebar JSX variable recreation, and kept workspace search routed through a controller object.
- `frontend/app/modules/document-tree/**` — replaced tree drag and item prop destructuring with dot notation.
- `frontend/app/modules/editor/**` — replaced editor props, menu/drag hook return destructuring, and Tiptap callback destructuring with named controllers and `params` access.
- `frontend/app/shared/lib/app-provider.tsx`, `frontend/app/shared/lib/query-provider.tsx`, `frontend/app/shared/ui/**`, `frontend/app/root.tsx` — replaced shared app prop/hook destructuring.
- `frontend/app/components/ui/**` and `frontend/app/shared/api/auth.ts` — replaced remaining destructured primitive props and object hook result destructuring.
- `docs/STACK.md` — added the durable no-destructuring convention.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm playwright test tests/e2e/offline-workspace.spec.ts --project=chromium -g "renames workspace"` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed
- `rg "const \{[^}]+\}|let \{[^}]+\}|var \{[^}]+\}|\([^)]*\{[^}]+\}[^)]*\)\s*=>|function [^(]+\([^)]*\{[^}]+\}" frontend/app/modules frontend/app/shared frontend/app/root.tsx frontend/app/components/ui -n` — PASS, no matches

**Residual risk:**
- This is a convention-level sweep rather than an ESLint rule; future automation can make the rule mechanically enforceable.

### [R14] — Add typed Zod-validated search params hook
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — kept sidebar search in local `useState` and trimmed raw strings inside workspace effects.
- `frontend/app/shared/lib/router.ts` — previously exposed raw React Router search params from the routing wrapper.
- `frontend/package.json` — did not declare `zod` as a direct app dependency.

**Observed issue:**
- URL search params had no dedicated typed abstraction, no schema validation, and search state could drift from the URL.

**Risk areas:**
- Search params are UI state only for Phase 01; the implementation must not alter backend/API contracts.

#### Implementation Plan

**Done when:** app code uses a shared `useSearchParams` wrapper with Zod schema/fallback validation and declarative `get`, `getAll`, `has`, `set`, `add`, `remove`, `replace`, and `clear` methods; workspace search state is driven by the `q` URL param.

**Files:**
- `frontend/app/shared/lib/search-params.ts`
- `frontend/app/modules/app-shell/constants/search-params.ts`
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts`
- `frontend/package.json`
- `frontend/pnpm-lock.yaml`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Add direct `zod` dependency.
2. Implement a shared search-param wrapper around React Router's hook.
3. Define the workspace `q` schema/fallback and move sidebar search into the URL.
4. Document that direct React Router search-param access is confined to the wrapper.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/shared/lib/search-params.ts` — added the Zod-validated search-param wrapper and declarative mutation methods.
- `frontend/app/modules/app-shell/constants/search-params.ts` — added the workspace `q` schema and fallback.
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — moved tree search from local state to validated URL search params.
- `frontend/package.json` / `frontend/pnpm-lock.yaml` — added direct `zod` dependency.
- `docs/STACK.md` — documented the dedicated search-param wrapper rule.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm playwright test tests/e2e/offline-workspace.spec.ts --project=chromium -g "renames workspace"` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- Phase 01 currently has only one search param (`q`); the wrapper is generic and ready for additional schemas, but broader route-specific search schemas will be added as pages need them.

### [R15] — Rebuild typed router wrapper without search params
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/shared/lib/router.ts` — mixed route params, raw search params, and editor-specific `toNode`/`toRoot` helpers.
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — called the editor-specific router helpers directly.

**Observed issue:**
- The shared router wrapper did not provide a general typed navigation/history API and still bundled search params with routing concerns.

**Risk areas:**
- Route IDs are intentionally limited to Phase 01's `/` and `/:nodeId` routes; future phases can extend route builders without exposing raw React Router hooks.

#### Implementation Plan

**Done when:** `useRouter` exposes typed params, location, navigation type, route builders, `push`, `replace`, `go`, `back`, `forward`, and `isRoute`, while search params live only in the separate search-param wrapper.

**Files:**
- `frontend/app/shared/lib/router.ts`
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts`
- `docs/STACK.md`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Replace editor-specific navigation helpers with generic route builders and navigation methods.
2. Remove search-param state from `useRouter`.
3. Update app-shell route calls to use `router.routes.*` with `push`/`replace`.
4. Document the router/search separation.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/shared/lib/router.ts` — added typed route builders, location/navigation state, and generic history/navigation methods; removed search params and editor-specific helpers.
- `frontend/app/modules/app-shell/hooks/use-offline-workspace.ts` — updated page selection, initial redirect, deletion fallback, and creation navigation to the generic router API.
- `docs/STACK.md` — documented that routing and search params use separate shared hooks.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm playwright test tests/e2e/offline-workspace.spec.ts --project=chromium -g "renames workspace"` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- The route map is intentionally small for Phase 01; future phase routes should extend the wrapper rather than bypass it.

### [R16] — Stop save-status rerender loop
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — the flush-on-unmount effect depended on the full `props` object, so its cleanup ran on every parent render and repeatedly called `props.onFlush()`.
- `frontend/app/modules/storage/local-adapter.ts` — optimistic page creation could autosave a page before `createNode()` persisted the matching node, then `pages.add()` failed on the duplicate key and left the page without a tree node.
- `frontend/app/modules/app-shell/components/workspace-topbar.tsx` — only displayed `saveStatus`; the churn originated upstream in editor flush/persistence behavior.

**Observed issue:**
- The save status repeatedly entered saving/error states, and the focused nested-folder E2E left the active context at `Architecture` because the optimistic page failed to persist as a tree node.

**Risk areas:**
- Autosave and page creation share the same local IndexedDB records; the fix must preserve page-switch flush behavior while making optimistic create idempotent.

#### Implementation Plan

**Done when:** editor flush runs on actual unmount rather than every render, optimistic page creation tolerates a prior autosave, nested page creation activates the new page, and the save status settles under the existing E2E suite.

**Files:**
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/app/modules/storage/local-adapter.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Narrow the editor flush-on-unmount effect dependency to the stable `props.onFlush` callback.
2. Make local `createNode()` use idempotent `put()` persistence and preserve an existing optimistic page record.
3. Re-run typecheck, unit tests, the focused nested-folder E2E, and the full local E2E suite before closing the note.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm playwright test tests/e2e/offline-workspace.spec.ts --project=chromium -g "renames workspace"`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — stopped the flush effect from cleaning up on every render by depending on `props.onFlush` instead of the whole props object.
- `frontend/app/modules/storage/local-adapter.ts` — made create persistence idempotent with `nodes.put()` and `pages.put()`, preserving an existing optimistic page record when autosave wins the race.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm playwright test tests/e2e/offline-workspace.spec.ts --project=chromium -g "renames workspace"` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- None identified for the Phase 01 local autosave path.

### [R1] — Stabilize editor slash commands and broaden e2e coverage
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-20` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx:34` — slash menu state is derived from `editor.getText().endsWith('/')`, so any slash at the end of the whole document can reopen the menu unpredictably.
- `frontend/app/modules/editor/rich-text-editor.tsx:62` — slash command actions run formatting commands without deleting the `/` trigger first.
- `frontend/tests/e2e/offline-workspace.spec.ts:3` — current e2e coverage only verifies the shell renders on desktop/mobile and does not exercise editor commands, autosave, tree actions, theme/language, or storage UI.

**Observed issue:**
- Choosing an item from the slash menu leaves `/` in the editor content, and menu visibility can become stale because it is keyed to full-document text instead of the active textblock near the cursor.

**Risk areas:**
- Playwright e2e runs on the host against the Docker-exposed frontend per `docs/STACK.md`; focused checks should use `cd frontend && pnpm test:e2e:local` when the stack is available.

#### Implementation Plan

**Done when:** selecting a slash-menu command removes the trigger, applies the chosen block command, and typing `/` again opens the menu again; e2e tests cover this plus representative Phase 01 editor/tree/storage/theme/mobile workflows.

**Files:**
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Replace full-document slash detection with cursor-block trigger detection and close the menu on escape/command selection.
2. Run slash commands through a helper that deletes the trigger character before applying the selected Tiptap command.
3. Add e2e helpers and tests for slash command reuse, autosave/page switching, tree create/rename/delete, storage modal, theme/language, and mobile drawer behavior.
4. Run e2e lint and focused frontend checks; if the local app stack is unavailable, document the blocked e2e run explicitly.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:lint`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — slash menu state now tracks the active cursor trigger, command clicks preserve editor selection, and the selected command deletes the trigger before applying the block command.
- `frontend/tests/e2e/offline-workspace.spec.ts` — expanded Chromium e2e coverage for slash command reuse, page-switch autosave, page create/rename/delete, storage modal, language/theme controls, and mobile drawer behavior.
- `docs/PHASE_01.md` — checked off the resolved architect review note.
- `docs/PHASE_01_NOTES.md` — recorded exploration, plan, and implementation metadata.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 5 Chromium tests passed

**Residual risk:**
- Full cross-browser e2e (`chromium`, `firefox`, `webkit`) was not run; Phase 01 gate only documents local Chromium e2e as the normal local target.

### [R2] — Improve slash command keyboard UX
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-20` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx:64` — editor keyboard handling only closes the menu on Escape.
- `frontend/app/modules/editor/rich-text-editor.tsx:102` — command metadata has labels/icons/actions but no keyboard labels, active item state, or shortcut mapping.
- `frontend/app/modules/editor/rich-text-editor.tsx:141` — slash menu renders plain buttons without menu roles or keyboard selection state.
- `frontend/tests/e2e/offline-workspace.spec.ts:21` — e2e coverage verifies click reuse but not Arrow/Enter navigation or direct shortcuts.

**Observed issue:**
- The menu cannot be navigated with ArrowUp/ArrowDown/Enter, and there is no keyboard-only way to open the command menu or apply block actions without first typing `/`.

**Risk areas:**
- Keyboard shortcuts must avoid changing backend/API contracts and stay local to editor UI behavior.

#### Implementation Plan

**Done when:** the slash menu supports ArrowUp/ArrowDown/Home/End/Enter/Escape, `Ctrl/Cmd+/` opens it at the cursor, number shortcuts run visible menu items, and direct editor shortcuts apply core commands without typing `/`.

**Files:**
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/app/styles/app.css`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Promote slash commands to typed metadata with stable IDs, labels, icons, shortcut labels, and run handlers.
2. Track active menu index and handle menu navigation/selection in `editorProps.handleKeyDown`.
3. Add direct shortcuts for paragraph, heading, list, code, bold, italic, and horizontal rule commands.
4. Add e2e coverage for keyboard menu navigation and shortcut-driven command execution.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:lint`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — slash commands now use stable command metadata, active menu state, menu focus, ArrowUp/ArrowDown/Home/End/Enter handling, number selection, `Ctrl/Cmd+/` menu opening, and direct block shortcuts.
- `frontend/app/styles/app.css` — slash menu now has active-item styling and shortcut columns.
- `frontend/app/shared/lib/i18n.ts` — added divider and command-menu labels in Russian and English.
- `frontend/tests/e2e/offline-workspace.spec.ts` — added coverage for keyboard menu navigation, direct shortcuts, divider insertion, and deterministic PWA cache cleanup.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 6 Chromium tests passed

**Residual risk:**
- Full cross-browser e2e (`firefox`, `webkit`) was not run; local Phase 01 gate uses Chromium.

### [R6] — Stabilize editor block drag handle behavior
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-20` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx:142` — `StarterKit` registers Tiptap's default dropcursor, which renders as an unstyled dark drag insertion line.
- `frontend/app/modules/editor/rich-text-editor.tsx:533` — `DragHandle` is mounted without filtering, so it can target empty/trailing editor nodes.
- `frontend/app/modules/editor/rich-text-editor.tsx:555` — selection `BubbleMenu` can appear while drag-handle pointer interactions are active.
- `frontend/tests/e2e/offline-workspace.spec.ts:111` — existing e2e only verifies a basic draggable handle, not empty-block suppression or toolbar/dropcursor regressions.

**Observed issue:**
- The drag handle can appear for visually empty content, pointer-down on the handle can coexist with floating command UI, and the default dropcursor reads as a black divider during drag.

**Risk areas:**
- ProseMirror drag/drop is browser-driven; e2e should assert stable UI states and absence of persisted divider artifacts without overfitting to final native drag ordering.

#### Implementation Plan

**Done when:** the drag handle appears only for meaningful visible editor blocks, pressing the handle does not open command menus, drag feedback is styled as an intentional transient insertion marker, and e2e covers these regressions.

**Files:**
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/app/styles/app.css`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Configure `StarterKit.dropcursor` with a local class and non-black styling hook.
2. Track drag-handle target nodes and hide the handle for empty/trailing paragraphs.
3. Suppress selection/slash menus while drag-handle pointer interactions are active.
4. Add e2e assertions for empty-line handle suppression, no menu on handle press, and no persisted black divider after drag.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — configured a styled Tiptap dropcursor, hid drag handles for empty/trailing blocks, and suppresses slash/selection menus while the drag handle is pressed.
- `frontend/app/styles/app.css` — added hidden drag-handle and intentional dropcursor styles.
- `frontend/tests/e2e/offline-workspace.spec.ts` — expanded the drag-handle test to cover empty-block suppression, no command menu on handle press, and no persisted divider artifact after drag; scoped the page-create action to the sidebar to avoid an ambiguous duplicate button selector.
- `docs/PHASE_01.md` — normalized and checked off the resolved architect review note.
- `docs/PHASE_01_NOTES.md` — recorded exploration, plan, and implementation metadata.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:local` — PASS, 8 Chromium tests passed

**Residual risk:**
- Full cross-browser e2e (`firefox`, `webkit`) was not run; local Phase 01 gate uses Chromium.

### [R4] — Add Notion-style block drag handles
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-20` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx:3` — Tiptap drag-handle integration can be added through the maintained React extension.
- `frontend/app/modules/editor/rich-text-editor.tsx:532` — editor content renders in a positioned frame that can host floating block controls.
- `frontend/app/styles/app.css:330` — selected ProseMirror nodes can be highlighted without changing persisted document JSON.

**Observed issue:**
- Editor blocks had no visible drag anchor or drag feedback, so block reordering had to rely on plain text editing only.

**Risk areas:**
- Browser drag/drop behavior is ProseMirror/Tiptap-owned; e2e should verify deterministic handle visibility and drag affordance, while manual verification should confirm native reorder feel.

#### Implementation Plan

**Done when:** hovering editor blocks shows a left-side handle labeled `Drag to move`, the handle is draggable, the dragged block receives visual feedback, and focused e2e covers the affordance.

**Files:**
- `frontend/package.json`
- `frontend/pnpm-lock.yaml`
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/app/styles/app.css`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Add `@tiptap/extension-drag-handle-react` and wire it into the editor frame.
2. Render a compact grip handle with the required `Drag to move` tooltip and drag-active state.
3. Style ProseMirror selected nodes and the handle's `data-dragging` state.
4. Add e2e coverage for handle visibility, draggable state, and a drag gesture.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:lint`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/package.json` / `frontend/pnpm-lock.yaml` — added the maintained Tiptap React drag-handle extension.
- `frontend/app/modules/editor/rich-text-editor.tsx` — added the drag handle portal, grip icon, tooltip, and drag-active state handling.
- `frontend/app/styles/app.css` — added block handle, active drag, and selected-node highlight styles.
- `frontend/tests/e2e/offline-workspace.spec.ts` — added coverage for visible draggable block handles and a drag gesture.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 8 Chromium tests passed

**Residual risk:**
- Playwright's synthetic drag did not produce a stable final ProseMirror reorder assertion, so the e2e test verifies the maintained drag handle affordance and drag gesture without asserting final block order. Full cross-browser e2e (`firefox`, `webkit`) was not run; local Phase 01 gate uses Chromium.

### [R5] — Add selected-text command toolbar
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-20` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx:51` — slash commands already define the editor actions users need to discover.
- `frontend/app/modules/editor/rich-text-editor.tsx:555` — Tiptap `BubbleMenu` can show contextual UI for non-empty selections.
- `frontend/tests/e2e/offline-workspace.spec.ts:95` — e2e can select text and apply toolbar actions through visible buttons.

**Observed issue:**
- Selected text could be formatted through keyboard shortcuts, but there was no explicit UI for users who did not remember the shortcuts.

**Risk areas:**
- Divider insertion is intentionally excluded from the selection toolbar because it is a block insertion command, not a selected-text formatting action.

#### Implementation Plan

**Done when:** selecting text opens a floating toolbar with visible commands from the slash-command set, clicking those commands applies formatting to the selection, and e2e covers bold/italic selection formatting.

**Files:**
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/app/shared/lib/i18n.ts`
- `frontend/app/styles/app.css`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Extend command metadata with a `selectionMenu` flag so slash and selection UI share one command source.
2. Render Tiptap `BubbleMenu` only for non-empty selections and hide it while the slash menu is open.
3. Add localized toolbar labels and compact floating-menu styles.
4. Add e2e coverage for applying bold and italic through the visible selection UI.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:lint`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — added shared command metadata and a Tiptap `BubbleMenu` selection toolbar.
- `frontend/app/shared/lib/i18n.ts` — added selection-toolbar and drag-handle labels.
- `frontend/app/styles/app.css` — added compact floating toolbar styles with active command state.
- `frontend/tests/e2e/offline-workspace.spec.ts` — added selected-text toolbar formatting coverage.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 8 Chromium tests passed

**Residual risk:**
- Full cross-browser e2e (`firefox`, `webkit`) was not run; local Phase 01 gate uses Chromium.

### [R3] — Remove editor action strip and add divider command
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-20` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/editor/rich-text-editor.tsx:111` — renders the action toolbar directly below the document title.
- `frontend/app/styles/app.css:289` — `.editor-toolbar` adds sticky positioning and border separators that create the extra lines called out in the review note.
- `frontend/app/modules/editor/rich-text-editor.tsx:102` — slash commands do not include horizontal divider insertion.

**Observed issue:**
- The editor shows redundant action controls and divider lines under the title; command actions should live in the slash menu instead, including a divider command.

**Risk areas:**
- Removing the toolbar should not remove access to bold/italic; those commands need to remain available through the slash menu and keyboard shortcuts.

#### Implementation Plan

**Done when:** no `.editor-toolbar` renders under the title, slash commands include a divider/horizontal rule action, and tests prove the toolbar is absent while divider insertion still works.

**Files:**
- `frontend/app/modules/editor/rich-text-editor.tsx`
- `frontend/app/styles/app.css`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Remove the editor toolbar markup and unused toolbar styles.
2. Add a slash menu command that calls Tiptap `setHorizontalRule()`.
3. Move bold and italic into the slash menu so formatting remains discoverable without the action strip.
4. Add focused e2e assertions for toolbar removal and divider insertion.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:lint`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/editor/rich-text-editor.tsx` — removed the under-title toolbar, moved bold/italic into the slash menu, and added a divider command via Tiptap `setHorizontalRule()`.
- `frontend/app/styles/app.css` — removed `.editor-toolbar` border/sticky styles and widened the command menu layout.
- `frontend/tests/e2e/offline-workspace.spec.ts` — asserts the toolbar is absent and verifies divider insertion from the command menu.
- `docs/PHASE_01.md` — checked off the resolved architect review note.

**Checks run:**
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 6 Chromium tests passed

**Residual risk:**
- Full cross-browser e2e (`firefox`, `webkit`) was not run; local Phase 01 gate uses Chromium.

### [R7] — Fix workspace labels, tree search, and nested folders
**Source:** `docs/PHASE_01.md` § Architect Review Notes
**Status:** fixed

#### Exploration

_Explored:_ `2026-05-21` · _Verdict:_ `ready`

**Relevant code:**
- `frontend/app/modules/app-shell/offline-workspace.tsx:212` — sidebar workspace name is hardcoded as `MY NOTES`.
- `frontend/app/modules/app-shell/offline-workspace.tsx:217` — search input is rendered without state and never filters the tree.
- `frontend/app/modules/app-shell/offline-workspace.tsx:311` — document header displays a hardcoded category translation instead of the page's tree location.
- `frontend/app/modules/document-tree/document-tree.tsx:35` — only root-level folder creation is exposed in the toolbar.
- `frontend/app/modules/document-tree/document-tree.tsx:119` — folder rows expose an add-page action but no add-subfolder action.
- `frontend/app/modules/storage/local-adapter.ts:32` — the default anonymous workspace seed uses an `Architecture` folder, but storage already supports arbitrary parent IDs.

**Observed issue:**
- The UI exposes fixed labels that do not reflect user-controlled workspace or tree state, search is non-functional, and users cannot create nested folders through the tree controls even though the storage model supports them.

**Risk areas:**
- Existing anonymous IndexedDB data should remain compatible; the fix should stay in local UI/storage behavior and avoid backend/API/schema changes.

#### Implementation Plan

**Done when:** the sidebar workspace label can be renamed locally, sidebar search filters pages/folders while preserving visible ancestors, the document header shows the active page's tree path instead of a hardcoded category, folder rows can create subfolders, and e2e covers those workflows.

**Files:**
- `frontend/app/modules/app-shell/offline-workspace.tsx`
- `frontend/app/modules/document-tree/document-tree.tsx`
- `frontend/app/shared/lib/i18n.ts`
- `frontend/app/styles/app.css`
- `frontend/tests/e2e/offline-workspace.spec.ts`
- `docs/PHASE_01.md`
- `docs/PHASE_01_NOTES.md`

**Steps:**
1. Add local workspace-name state persisted in `localStorage`, rendered as an editable controlled input.
2. Add controlled search state and derive a filtered tree that includes matching nodes plus ancestor folders.
3. Derive the active page's folder path from the full tree and render it in the document title block instead of the static category string.
4. Add an add-subfolder action to folder rows and expand the parent after creation.
5. Add focused e2e coverage for workspace rename, tree search, nested folder creation, and active page path display.

**Checks:**
- `docker compose exec frontend pnpm typecheck`
- `docker compose exec frontend pnpm test`
- `cd frontend && pnpm test:e2e:local`

#### Implementation Notes

**Files changed:**
- `frontend/app/modules/app-shell/offline-workspace.tsx` — added persisted editable workspace naming, controlled tree search with ancestor-preserving filtering, active page folder-path display, and accessible mobile drawer labels.
- `frontend/app/modules/document-tree/document-tree.tsx` — added per-folder subfolder creation while preserving existing page creation.
- `frontend/app/shared/lib/i18n.ts` — added workspace-name, drawer, and subfolder action labels in Russian and English; removed the fixed category label.
- `frontend/app/styles/app.css` — styled the editable workspace label to match the existing sidebar density.
- `frontend/tests/e2e/offline-workspace.spec.ts` — added coverage for workspace rename, search filtering, nested folder creation, and active page path display; tightened mobile drawer selection to accessible button labels.
- `docs/PHASE_01.md` — checked off the resolved architect review note.
- `docs/PHASE_01_NOTES.md` — recorded implementation metadata.

**Checks run:**
- `cp .env.example .env && docker compose up -d --build` — PASS
- `docker compose exec frontend pnpm typecheck` — PASS
- `docker compose exec frontend pnpm test` — PASS, 11 tests passed
- `cd frontend && pnpm test:e2e:lint` — PASS
- `cd frontend && pnpm test:e2e:local` — PASS, 9 Chromium tests passed

**Residual risk:**
- Full cross-browser e2e (`firefox`, `webkit`) was not run; local Phase 01 gate uses Chromium.

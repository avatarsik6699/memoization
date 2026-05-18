# TECHNICAL SPECIFICATION (SPEC.md): `memoization`

> **For AI agent**: Read this file in full before starting any phase.
> Confirm understanding of constraints and the phased development model.
> When this file changes after phase files exist, run `/spec-sync [description of change]`
> immediately.

## Metadata

| Field | Value |
|-------|-------|
| Document Version | `v1.0` |
| Date | `2026-05-18` |
| Architect / Owner | `v.godlevskiy` |
| Contract Version | `v1.0` (see `docs/CONTEXT.md`) |
| Stack | See [docs/STACK.md](./STACK.md) |
| Domain | Offline-first Notion-like notes editor with optional cloud sync |
| Source Brief | `tmp/SPEC.md`, version 1.1, MVP status |

---

## 1. Project Overview and Goals

### 1.1 Problem

Users need a fast personal notes workspace that works without registration, without network access,
and on mobile as an installable PWA. Registration must be optional and should only be required for
cross-device synchronization, public sharing, and cloud storage.

### 1.2 Goal and Success Metrics

Build an MVP Notion-like block editor for notes with these verifiable outcomes:

- Anonymous users can create, edit, move, delete, and persist folders/pages entirely in IndexedDB.
- The app remains usable offline after being installed as a PWA or loaded with cached assets.
- Registered users can migrate local notes to the cloud, sync them through the backend, and log in
  from another device to retrieve the cloud state.
- Public pages are available as read-only SSR routes at `/p/:slug`.
- The product supports Russian and English UI, light/dark/system themes, image uploads, storage
  quota visibility, and MVP block editing features.
- The document/editor/tree/storage core is modular enough to later power embedded knowledge-base
  scenarios in other applications without rewriting the MVP data model.

### 1.3 Project Boundaries

| Included | Excluded |
|----------|----------|
| Offline-first anonymous editor with IndexedDB | Real-time multi-user collaboration |
| Optional account, email verification, cloud sync | Teams, workspaces, sharing permissions beyond public read-only pages |
| Local-to-cloud migration | Bidirectional merge of two non-empty workspaces during MVP |
| PWA install/offline cache | Native mobile apps |
| VPS deployment with Nginx, Docker Compose, monitoring, analytics, backups | Multi-region deployment or horizontal scaling before MVP |
| Modular document engine prepared for future embedding/API reuse | Full multi-tenant platform, SDK distribution, or medical compliance in MVP |

---

## 2. Domain Context

### 2.1 Roles and Permissions

| Role | Capabilities | Restrictions |
|------|--------------|--------------|
| `Anonymous_User` | Uses the full local editor, stores notes/images in IndexedDB, installs PWA | No cloud sync, no server-side public page publishing |
| `Registered_Unverified_User` | Logs in, migrates local data, reads and writes cloud notes until verification deadline | After 7 days without email verification: read-only access; no create/edit/publish |
| `Registered_Verified_User` | Full cloud notes CRUD, image upload, public page publish/unpublish, sync across devices | Cannot access other users' private data |
| `Public_Visitor` | Reads public pages via `/p/:slug` | No auth, no private metadata, no editing |
| `Admin_Operator` | Operates VPS, backups, monitoring, analytics, deploys | Product admin UI is not in MVP |
| `AI_Agent` | Implements phases, runs gate checks, updates SDD docs as instructed | No push to main/develop; no invented behavior outside phase contracts |

### 2.2 Core Journeys

| Journey | Flow |
|---------|------|
| Anonymous local editing | Open `/app`, create folders/pages, edit content, autosave to IndexedDB, view storage usage |
| Register and migrate | Register with email/password, stay logged in immediately, choose whether to migrate local notes, upload local images, import nodes/pages, clear IndexedDB after success |
| Existing user on new device | Log in with empty IndexedDB, fetch cloud tree/pages, use `CloudAdapter` |
| Publish page | Mark page public, receive `/p/<slug>`, render read-only SSR page without auth |
| Offline cloud user | Queue edits in IndexedDB `pending_changes`, replay when online, latest `updated_at` wins on conflict |

### 2.3 Key Entities

`User -> Session -> EmailVerificationToken`

`User -> Node(folder|page) -> Page -> TiptapDocumentJSON`

`Page -> Upload/Image`

`Local IndexedDB -> Migration -> Cloud PostgreSQL`

Future cloud evolution reserves `Workspace -> Node -> Page` as the target ownership model. MVP may
store user-owned nodes directly, but table/API designs must avoid assumptions that would prevent
adding `workspace_id` later.

---

## 3. Data Model

### 3.1 PostgreSQL

The backend stores cloud-mode data in PostgreSQL.

```sql
users(
  id uuid primary key,
  email text unique not null,
  password_hash text not null,
  email_verified boolean not null default false,
  email_verified_at timestamptz,
  email_verify_deadline timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null
)

email_verification_tokens(
  token text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz
)

sessions(
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  token_hash text unique not null,
  expires_at timestamptz not null,
  created_at timestamptz not null,
  last_seen_at timestamptz not null
)

nodes(
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  parent_id uuid references nodes(id) on delete cascade,
  type text not null check (type in ('folder', 'page')),
  title text not null default 'Untitled',
  icon text,
  order_index float not null default 0,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null,
  updated_at timestamptz not null
)

pages(
  id uuid primary key references nodes(id) on delete cascade,
  content jsonb not null default '[]',
  cover_url text,
  is_public boolean not null default false,
  public_slug text unique,
  updated_at timestamptz not null
)

uploads(
  id uuid primary key,
  user_id uuid not null references users(id) on delete cascade,
  page_id uuid references pages(id) on delete set null,
  url text unique not null,
  storage_path text unique not null,
  content_type text not null,
  size_bytes integer not null,
  created_at timestamptz not null,
  deleted_at timestamptz
)
```

Required indexes:

- `idx_sessions_user_id` on `sessions(user_id)`
- `idx_nodes_user_id` on `nodes(user_id)`
- `idx_nodes_parent_id` on `nodes(parent_id)`
- `idx_pages_public_slug` on `pages(public_slug)` where `public_slug is not null`
- `idx_uploads_user_id` on `uploads(user_id)`
- `idx_uploads_page_id` on `uploads(page_id)`

### 3.2 IndexedDB

Anonymous mode and offline queue use Dexie.js over IndexedDB.

```typescript
const db = new Dexie("notesapp_v1");
db.version(1).stores({
  nodes: "id, parentId, type, orderIndex, updatedAt, isDeleted",
  pages: "id, updatedAt",
  uploads: "id, pageId",
  pending_changes: "id, createdAt",
});
```

`uploads` stores base64 images for anonymous mode. During migration, images upload through
`/api/upload/image`; returned URLs replace base64 references in Tiptap document JSON.

### 3.3 Storage Adapter Contract

Editor and file tree components must not know whether data is local or cloud-backed.

```typescript
interface StorageAdapter {
  mode: "local" | "cloud";

  getPage(id: string): Promise<Page>;
  savePage(page: Page): Promise<void>;
  deletePage(id: string): Promise<void>;

  getTree(): Promise<TreeNode[]>;
  createNode(input: CreateNodeInput): Promise<TreeNode>;
  moveNode(id: string, newParentId: string | null): Promise<void>;
  renameNode(id: string, title: string): Promise<void>;
  deleteNode(id: string): Promise<void>;
}
```

### 3.4 Future Integration Model

The MVP is a standalone notes app, but its core should evolve into a reusable document workspace
engine. The intended future integration modes are:

| Mode | Meaning | MVP requirement |
|------|---------|-----------------|
| Standalone app | `memoization.ru` hosts the full notes product | Required |
| Embedded read-only KB | Another app embeds published documents or collections | Keep public document routes/API clean and auth-free |
| Embedded editable module | Another app mounts the editor/tree UI for authenticated users | Keep editor/tree/storage code modular and app-shell independent |
| Headless API | Another backend/frontend consumes documents, tree, search, and publication APIs | Keep API contracts explicit and not coupled to the current React UI |

Implementation constraints:

- Keep editor, document tree, storage adapters, Tiptap schema/extensions, and publication rendering
  in separable frontend modules.
- Do not hardcode `memoization.ru`, route names, or singleton user assumptions inside core document
  logic.
- Keep Tiptap JSON as the portable document format between local storage, API, public rendering, and
  future embeds.
- Use `user_id` as the MVP owner, but design backend service boundaries so `workspace_id` can be
  introduced later without rewriting document CRUD.
- Medical-site integration is allowed as a future knowledge-base use case for articles/reference
  documents. Patient data, diagnoses, treatment records, audit logs, regulated medical workflows,
  and compliance guarantees are out of MVP scope and require a dedicated architecture phase.

---

## 4. API / Backend Contract

All `/api/*` routes require JWT except `/api/auth/register`, `/api/auth/login`, and public read
routes. Every private data query must scope by `user_id`.

### 4.1 Authentication

| Method | Path | Auth | Contract |
|--------|------|------|----------|
| `POST` | `/api/auth/register` | none | Body `{ email, password }`; password min 8 chars and at least one digit or special char; creates user with `email_verify_deadline = now() + 7 days`; sends verification email only when email delivery is configured; returns `{ access_token, user }` and starts a session |
| `POST` | `/api/auth/login` | none | Body `{ email, password }`; verifies bcrypt hash; creates session; returns `{ access_token }` and `Set-Cookie: refresh_token` |
| `POST` | `/api/auth/refresh` | refresh cookie | Rotates refresh token; returns new access token and cookie |
| `POST` | `/api/auth/logout` | refresh cookie | Deletes session, clears cookie, returns `204` |
| `GET` | `/api/auth/me` | JWT | Returns `{ id, email, email_verified, email_verify_deadline }` |
| `POST` | `/api/auth/resend-verification` | JWT | Available only when email delivery is configured; otherwise returns `409 email_delivery_not_configured`; when enabled, rate limit 1 request per 5 minutes per user via Redis |
| `GET` | `/auth/verify-email?token=<TOKEN>` | none, SSR loader | Validates token, marks email verified, redirects to `/app` with success toast |

Access tokens are JWTs with payload `{ sub: user_id, email_verified: bool }` and TTL 15 minutes.
Refresh tokens are random 64-character hex values stored only as SHA-256 hashes in `sessions`, sent
as `httpOnly`, `Secure`, `SameSite=Lax`, `MaxAge=30d` cookies.

### 4.2 Email Verification Write Policy

Email verification is an optional feature until the final deployment/polish phase. The backend must
ship the schema, token generation, verification route, and UI hooks early, but production write
blocking is controlled by `EMAIL_VERIFICATION_ENFORCED`.

| Environment / phase | Email delivery | Write blocking |
|---------------------|----------------|----------------|
| Development before Resend config | Disabled; tokens may be logged or exposed only in development responses | Disabled |
| MVP phases before final deployment config | Optional; missing sender config must not block auth/cloud work | Disabled |
| Final production deployment | Resend configured with the approved sender domain | Enabled |

| Action | Before deadline, unverified | After deadline, unverified | Verified |
|--------|-----------------------------|----------------------------|----------|
| Read notes | allowed | allowed | allowed |
| Edit existing notes | allowed | denied `403 email_not_verified_deadline_passed` | allowed |
| Create pages/folders | allowed | denied `403 email_not_verified_deadline_passed` | allowed |
| Publish pages | allowed | denied `403 email_not_verified_deadline_passed` | allowed |

Frontend must show a persistent countdown banner while the user is unverified:
`Осталось N дней до блокировки. Подтвердите email [Отправить повторно]`.

When email delivery is not configured, the banner must show that verification is not available yet
and must not threaten account lockout.

### 4.3 Nodes, Pages, Uploads, Migration, Public API

| Method | Path | Auth | Contract |
|--------|------|------|----------|
| `GET` | `/api/nodes` | JWT | Returns `TreeNode[]` for current user |
| `POST` | `/api/nodes` | write access | Body `{ parentId?, type, title, orderIndex }`; returns `TreeNode` |
| `PATCH` | `/api/nodes/:id` | write access | Body `{ title?, icon?, parentId?, orderIndex?, isDeleted? }`; returns `TreeNode` |
| `DELETE` | `/api/nodes/:id` | write access | Soft-deletes the node and descendants for 30 days by setting `is_deleted=true` and `deleted_at=now()`; returns `204` |
| `GET` | `/api/pages/:id` | JWT | Returns `{ id, content, coverUrl, isPublic, publicSlug }` |
| `PUT` | `/api/pages/:id` | write access | Body `{ content: TiptapDocumentJSON, coverUrl? }`; returns `Page` |
| `POST` | `/api/pages/:id/publish` | write access | Generates nanoid 10-char slug; returns `{ publicSlug, url }` |
| `DELETE` | `/api/pages/:id/publish` | write access | Sets `is_public=false`; slug remains stored; returns `204` |
| `POST` | `/api/upload/image` | write access | Multipart `{ file }`; max 10 MB; jpeg/png/webp/gif; stores under `/var/www/uploads/<user_id>/<uuid>.<ext>`; creates `uploads` metadata; returns `{ url }` |
| `POST` | `/api/migrate` | JWT/write access | Body `{ nodes: LocalNode[], pages: LocalPage[] }`; returns `{ imported, idMapping }` |
| `GET` | `/api/public/:slug` | none | Returns `{ title, content: TiptapDocumentJSON, coverUrl }` or `404`; no user private data |

Standard errors: `400` invalid input, `401` unauthenticated/token expired, `403` email verification
write block, `404` missing resource, `409` email already used, `429` rate limit, `500` server error.

### 4.4 Delete and Upload Lifecycle

- Normal tree/page queries exclude `is_deleted=true` nodes.
- Deleting a folder soft-deletes its full subtree; deleting a page also makes any public slug return
  `404`.
- Restore is allowed for 30 days by setting `is_deleted=false` and `deleted_at=null` on a node or
  subtree; if no dedicated trash UI exists yet, restore may remain an internal/API capability.
- A cleanup job may permanently purge nodes/pages after 30 days.
- Upload records are soft-deleted when no remaining page content references their URL. The physical
  file is removed during cleanup after the 30-day recovery window.
- Backups include both PostgreSQL upload metadata and `/var/www/uploads/`; restore must keep them in
  sync.

### 4.5 Future External API Constraints

The API is initially consumed by the bundled frontend, but endpoint design must remain suitable for
external clients:

- Responses use stable JSON contracts and avoid leaking frontend-only state.
- Private endpoints always scope by authenticated owner now and must be compatible with future
  `workspace_id` scoping.
- Public document endpoints return renderable document data without private owner/session metadata.
- Future embed clients should be able to consume public read-only documents without sharing the main
  app shell.

---

## 5. Frontend / Client Contract

### 5.1 Pages and Routes

| Route | Mode | Purpose | Indexing |
|-------|------|---------|----------|
| `/` | SSR | Landing page | index |
| `/login` | SSR | Login form | noindex |
| `/register` | SSR | Registration form | noindex |
| `/auth/verify-email` | SSR loader | Email verification redirect | noindex |
| `/app` | CSR app shell | Notes workspace | noindex |
| `/app/:nodeId` | CSR app shell | Selected page | noindex |
| `/p/:slug` | SSR + HTTP cache | Public read-only page | index |

Public pages use `Cache-Control: public, max-age=60, stale-while-revalidate=300`.

### 5.2 Main UI Surfaces

| Surface | Requirements |
|---------|--------------|
| App shell | Sidebar with file tree, editor area, header with save status and theme switcher |
| File tree | Create page/folder, rename by double click/context menu, delete with confirmation, move by drag and drop, expand/collapse folders |
| Editor | Tiptap editor, autosave, image upload, syntax-highlighted code blocks, read-only mode for public pages |
| Auth | Register/login forms, email verification banner, resend verification action |
| Migration modal | Trigger after login/register if IndexedDB has local data; options: migrate to cloud or discard local data |
| Storage panel | Anonymous-mode footer panel showing usage, quota, pages/folders count, image count/size, last save time |
| PWA install banner | Soft prompt after 3 visits using `beforeinstallprompt` |
| Settings | Language switcher and theme switcher |

### 5.3 Visual Design Contract

The MVP must follow this durable visual contract, derived from the provided reference:

- Quiet Notion-like document editor with a muted warm neutral canvas, narrow left sidebar, and
  centered readable document column.
- Sidebar includes uppercase workspace label, search input, grouped navigation headings, active row
  indicator, bottom `NEW PAGE` action, storage usage, and cloud sync status.
- Top bar includes breadcrumb/title context on the left and compact `Share`/`Publish` actions on
  the right.
- Document area uses editorial typography with a large serif page title, small uppercase section
  labels, timestamp metadata, horizontal dividers, and table-like API rows.
- Approximate layout: fixed left sidebar around 260 px on desktop, full-height app shell, top bar
  around 48 px, centered content column around 680 px, generous vertical document rhythm, and no
  boxed card around the primary editor.
- Approximate palette: warm off-white page background, slightly darker beige sidebar, dark charcoal
  text, muted gray secondary text, subtle beige borders, black primary publish action.
- Typography: restrained sans-serif for navigation and metadata; expressive serif for document
  titles and major content headings.
- UI should feel dense enough for repeated work, not like a marketing landing page. Cards should be
  avoided except for modals/repeated items where framing is functionally necessary.

### 5.4 Editor Requirements

MVP Tiptap node/mark support:

- Paragraph: `/p`, `/текст`
- Headings: `/h1`, `/h2`, `/h3`
- Bullet list: `/ul`, `/список`
- Numbered list: `/ol`, `/нумер`
- Checklist: `/todo`, `/задача`
- Code block: `/code`, `/код`
- Quote: `/quote`, `/цитата`
- Table: `/table`, `/таблица`
- Image: `/img`, `/фото`
- Divider: `/hr`, `/линия`

Inline formatting: bold, italic, strikethrough, underline, inline code, link, 8 text colors, and
8 background colors. Code highlighting uses `lowlight`/highlight.js integration.

Implementation contract:

- Use open-source Tiptap editor packages and ProseMirror JSON as the persisted page format.
- Configure React with `useEditor` / `EditorContent`; use `editor.getJSON()` for autosave and API
  writes.
- Build the Notion-like slash menu, block controls, and editor chrome locally in the app UI.
- Do not use Tiptap Platform, Tiptap Cloud, paid Pro extensions, AI services, managed
  collaboration, or paid import/export features in the MVP without a separate architecture
  decision.

Autosave rules:

- Editor `onChange` writes through a 1500 ms debounce.
- Page switch forces an immediate flush.
- Header save indicator states: `Сохранено`, `Сохранение…`, `⚠ Ошибка [Повторить]`.

### 5.5 Local Storage UX

Use `navigator.storage.estimate()` to show quota and usage. Anonymous-mode warnings:

- Above 80% quota: orange indicator and toast prompting account creation/cloud migration.
- Above 95% quota: red indicator and save is blocked with an explicit message.

The storage details modal breaks down text pages, base64 images, tree metadata, and total usage.
The clear action offers two choices: delete everything, or delete images only.

### 5.6 PWA, i18n, and Theme

- PWA manifest: `name=Notes App`, `short_name=Notes`, `start_url=/app`, `display=standalone`,
  white background, dark theme color, 192/512/maskable icons.
- Workbox strategies: static assets `CacheFirst`, HTML `NetworkFirst`, `/api/*` `NetworkOnly`,
  `/uploads/*` `StaleWhileRevalidate`, fallback `/offline.html`.
- Supported languages: Russian default (`ru`) and English (`en`), loaded from
  `public/locales/{ru,en}/{common,editor,auth}.json`.
- Language priority: explicit `localStorage.i18n_lang`, then `navigator.language`, then `ru`.
- Theme options: `light`, `dark`, `system`; apply `dark` class to `<html>` and include anti-flash
  inline script before first render.

### 5.7 Frontend Modularity

Frontend implementation must preserve these boundaries:

| Module | Responsibility |
|--------|----------------|
| `editor` | Tiptap setup, extensions, slash menu, editor chrome, serialization |
| `document-tree` | Tree rendering, ordering, drag/drop, selection |
| `storage` | `StorageAdapter`, `LocalAdapter`, `CloudAdapter`, migration helpers |
| `publication` | Read-only rendering and share/publish UI |
| `app-shell` | Current standalone layout, sidebar placement, top bar, auth-aware navigation |

`editor`, `document-tree`, `storage`, and `publication` must not depend on the standalone
`memoization.ru` app shell. This keeps future embedding into other React applications possible.

---

## 6. Infrastructure

### 6.1 Runtime Topology

MVP production target is one Ubuntu 24.04 LTS VPS with 2 vCPU, 4 GB RAM, and 40 GB SSD.

| Component | Contract |
|-----------|----------|
| Nginx | TLS termination, reverse proxy, static `/uploads/`, Netdata protection, Plausible subdomain |
| Frontend | React Router SSR Node process on port 3000 |
| Backend | FastAPI on port 8000 |
| PostgreSQL 18 | Primary relational database |
| Redis 8 | Refresh/session support, rate limiting, offline-adjacent queues where needed |
| Uploads | Host directory `/var/www/uploads/` mounted into backend and served by Nginx |
| Monitoring | Netdata at `/netdata/` behind basic auth |
| Analytics | Self-hosted Plausible exposed at `https://memoization.ru/stats` |
| Backups | Daily `pg_dump` + uploads/config archive + rclone crypt upload to Backblaze B2 |

Host directories:

- `/var/www/uploads/`
- `/var/backups/app/`
- `/opt/app/`
- `/etc/nginx/conf.d/`
- `/etc/letsencrypt/`

### 6.2 Deployment and Operations

- Production runs through Docker Compose.
- Public production app domain is `memoization.ru`; analytics is exposed at `/stats` on the same
  domain.
- Nginx serves `/uploads/` with immutable 30-day caching and directory listing disabled.
- Certbot issues and renews the Let's Encrypt certificate for `memoization.ru`.
- GitHub Actions deploys to the VPS over SSH.
- Netdata alerts should cover RAM > 85% for 5 minutes, disk > 80%, repeated container restarts,
  and PostgreSQL unavailability.
- Backups run daily at 03:00, keep local archives for 14 days, and upload encrypted archives to
  Backblaze B2 through `rclone crypt`.
- Restore script must verify archive integrity, verify `pg_restore --list`, and require `--force`
  before overwriting non-empty uploads.

---

## 7. Non-Functional Requirements

### 7.1 Performance

- Landing FCP: under 1.5 seconds on target production deployment.
- IndexedDB page open: under 200 ms for normal MVP documents.
- Autosave must not rerender the whole tree.
- File tree must use virtualization when node count exceeds 200.

### 7.2 Security and Privacy

- No secrets in git; all secrets live in `.env` or host-only config and are included only in
  encrypted backups.
- All private API data is scoped by authenticated `user_id`.
- Public pages expose only `title`, `content`, and `coverUrl`.
- Upload filenames use UUIDs; server validates extensions and max size.
- Nginx disables upload directory listing.
- Plausible is privacy-first: no cookies, self-hosted analytics data.

### 7.3 Reliability and Failure Modes

- Anonymous/local data remains usable without network.
- If the cloud user goes offline, edits are written to `pending_changes` and replayed on
  `online`; conflict resolution for MVP is latest `updated_at` wins.
- If local-to-cloud migration succeeds, IndexedDB local workspace is cleared and the adapter
  switches to cloud.
- If migration is declined, IndexedDB is cleared and the user starts with cloud state.
- Local data wins during first migration because registration starts with no cloud data.

### 7.4 Scalability After MVP

Post-MVP scaling path:

1. Vertically upgrade the VPS.
2. Move PostgreSQL to a managed instance such as Supabase or Neon.
3. Replace `/var/www/uploads/` with S3/R2 by changing upload service and Nginx/static serving.
4. Introduce workspaces and external embed/API contracts when another product needs a knowledge-base
   integration.

---

## 8. Phased Delivery Plan

| Phase | Title | Goal | Key Outputs |
|-------|-------|------|-------------|
| `01` | Offline Editor | Build the anonymous offline-first editor and PWA foundation | React Router app shell, Dexie local storage, StorageAdapter/LocalAdapter, file tree, Tiptap editor, autosave, i18n, themes, storage panel, PWA manifest/SW/offline page, mobile drawer |
| `02` | Backend Core and Auth | Add cloud account foundation and core private APIs | FastAPI models/migrations, JWT/refresh sessions, optional email verification hooks without enforced blocking, nodes/pages APIs, 30-day soft delete/restore contract |
| `03` | Cloud Sync, Migration, and Uploads | Connect frontend cloud mode and local-to-cloud migration | CloudAdapter, login/register data mode switching, MigrationModal, `/api/migrate`, image upload endpoint, upload metadata and cleanup rules, Nginx static upload serving for app container |
| `04` | VPS Infrastructure | Make the MVP deployable and operable on one VPS | Production Docker Compose for PostgreSQL 18 and Redis 8, Nginx/TLS for `memoization.ru`, Netdata alerts, Plausible at `/stats`, backup/restore scripts, rclone Backblaze B2, GitHub Actions SSH deploy |
| `05` | Public Pages and Sync Hardening | Add public SEO pages and authenticated offline queue | Publish/unpublish API, `/p/:slug` SSR read-only rendering, meta tags/cache headers, `pending_changes` replay and latest-`updated_at` conflict rule |
| `06` | Final Polish, Email, and Coverage | Finish MVP UX, configure production email, and add E2E safety net | Resend sender/domain configuration, enable `EMAIL_VERIFICATION_ENFORCED` in production, page/folder icons, cover images, `Ctrl+K` title search, Playwright tests for registration, editing, publishing, and offline behavior |
| `07` | Integration Readiness | Prepare post-MVP reuse by other applications | Optional follow-up: workspace model, documented external API, read-only embed route/component, package boundary review; no medical compliance claims without a separate phase |

---

## 9. Out of Scope

- Collaborative editing, comments, mentions, and permissions beyond public read-only links.
- Native mobile clients.
- Workspace/team billing or multi-tenant organizations.
- Full embeddable SDK/package distribution during MVP.
- Medical compliance, patient records, audit-grade access logs, or regulated clinical workflows.
- Rich import/export from Notion, Markdown, Google Docs, or Obsidian.
- Tiptap Platform/Cloud, paid Pro extensions, AI editing, managed collaboration, and paid
  import/export services.
- Advanced conflict resolution beyond latest `updated_at` for MVP.
- Managed cloud infrastructure before the single-VPS MVP is complete.

---

## 10. Open Questions

- [NEEDS_CLARIFICATION: Email sender domain and concrete Resend configuration are intentionally
  deferred until the final deployment/polish phase. Until then, email delivery and resend behavior
  remain optional and must not block earlier offline/editor/cloud-storage phases.]

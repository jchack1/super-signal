# Roadmap

Forward-looking build plan for Super Signal. Grounded in [project-overview.md](project-overview.md). Checkboxes track status; completed features also get a dated line in [feature-history.md](feature-history.md), and any feature that needs a detailed spec gets its own doc under [features/](features/).

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done · 🔒 blocked/waiting

**Current focus:** Phase 1 — Core filesystem UI. (Phase 0 complete.)

---

## Phase 0 — Foundation & scaffolding

Get the monorepo, shared config, and the `packages/core` skeleton in place so everything after has a home. No product features yet — this is the structure.

- [x] Monorepo scaffold — pnpm workspaces + Turborepo
- [x] Shared config at root — `tsconfig.base.json` + Prettier (ESLint deferred until there is code to lint; a dedicated `packages/config` deferred until it earns its place)
- [x] `apps/web` scaffold — Vite + React + TypeScript
- [x] Tailwind + shadcn/ui baseline in `packages/ui` (design tokens, `cn`, Button; shadcn CLI/`components.json` wiring deferred to first component add in Phase 1)
- [x] `packages/core` skeleton — `domain/` `ports/` `adapters/` `services/`
- [x] Domain types — `Node` (discriminated union), `Message`, `User`, `Avatar`, `Permission`, `AccessControlEntry`
- [x] Repository interfaces (ports) — `NodeRepository`, `MessageRepository`, `UserRepository`
- [x] Mock adapter + seed data (an example tree: a server, folders, a channel, messages)
- [x] `PermissionService` — effective-permission resolution with inherit-break (covered by vitest tests)
- [x] Wire TanStack Query, TanStack Router, Zustand into `apps/web` (providers + composition root + one demo of each)
- [x] ESLint flat config at root (TypeScript pinned to stable 5.x — TS 7 broke the ESLint toolchain)
- [~] Deploy to Netlify — deferred until there is a UI (user's call)

## Phase 1 — Core filesystem UI (the "Part 1 = UI only" milestone)

The distinctive, demo-able product, built entirely against the mock data layer. Nothing here touches a real backend.

- [x] App shell / layout — calm, minimal, Signal-like
- [x] Tree-navigation sidebar
- [x] Path / address bar + breadcrumbs (derived from the tree) — now read-only orientation (typing moved to the one command line)
- [x] Node routing — stable ID URLs (`/n/:nodeId`), path derived for display
- [ ] Folder view — list children, ordered by `position` (in the center pane; today a folder shows a placeholder, and `ls` lists children in the command-line dropdown)
- [~] Create / rename / move / delete a Node (against mock) — **move (`mv`) and copy (`cp`)** landed via the command line; create / rename / delete still to do
- [ ] Drag-to-reorder (fractional `position`)
- [ ] Context menus (right-click) via Radix/shadcn
- [x] Chat channel view — read message history from mock
- [x] Post a message — with optimistic update
- [ ] Permission-aware UI — view/read/write gating driven by `PermissionService`
- [ ] Identity — pick / switch Avatar (mock), simple presence indicator
- [x] Command line — **one unified bottom prompt**, sigil-disambiguated: `cd` / `ls` / `find` / `mv` / `cp` commands + `@`/`#` messaging in the same input (reverted the earlier two-box split; see [feature-history.md](feature-history.md) 2026-07-21)

## Phase 2 — Real backend (Supabase)

Swap the mock adapter for Supabase behind the repository interfaces. Ideally the UI and services don't change.

- [ ] Supabase project + Postgres schema via SQL migrations (`nodes`, `messages`, `users`, `avatars`, `acl`)
- [ ] RLS policies — enforce inherited permissions in the database (the real security boundary)
- [ ] Supabase repository adapters — flip mock → Supabase
- [ ] Anonymous auth (Supabase Auth) + Avatar management — recovery phrase by default; optional email/phone attached to the User
- [ ] Realtime chat — subscribe and merge into the TanStack Query cache
- [ ] Storage — file uploads for file-type Nodes (metadata + object-storage pointer)
- [ ] Edge Functions (Deno) — invites / webhooks as needed

## Phase 3 — Richer content & collaboration

- [ ] File-type Nodes — documents, images, etc.
- [ ] Roles & membership management UI
- [ ] Voice / video — LiveKit SFU (self-hosted)
- [ ] Real-time co-editing — Yjs (CRDT)
- [ ] Search — `find` at scale

## Phase 4 — Platform & scale

- [ ] Electron desktop wrapper (reuse the web build)
- [ ] Scaling work — permission caching / materialized path, realtime fan-out service, purpose-built message store
- [ ] Feed / shorts stream + algorithm
- [ ] Bots / agents / LLM integration
- [ ] Contexts — Dev, Gaming (2D/3D traversal), Creative, Web

---

## Open questions / decisions still to make

- ORM inside repositories — start with `supabase-js` directly vs. adopt Drizzle (deferred; lives behind the repository so it's swappable)
- Anonymity scope — confirm with the team: "unlinkable to other users" vs. stronger "unlinkable to the host" (the latter is a much bigger architectural conversation)
- Abuse / Sybil resistance for free anonymous accounts — since email/phone are *optional* (no mandatory phone-number gate like Signal), decide the mechanism(s): proof-of-work, invite trees, rate limits, per-community verification levels, moderation tooling. Decided so far: recovery phrase default + optional email/phone on the User (see [project-overview.md](project-overview.md) → Account recovery)
- Which file-type Nodes matter first (Phase 3)
- Unified command line — reverted the "two boxes, two jobs" split to the spec's single sigil-disambiguated prompt (default = command; `@`/`#` = message). Open: whether to add a QoL "plain text = message when inside a channel" so routine chat doesn't need a sigil — being flagged with the spec author.

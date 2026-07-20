# Roadmap

Forward-looking build plan for Super Signal. Grounded in [project-overview.md](project-overview.md). Checkboxes track status; completed features also get a dated line in [feature-history.md](feature-history.md), and any feature that needs a detailed spec gets its own doc under [features/](features/).

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` done · 🔒 blocked/waiting

**Current focus:** Phase 0 — Foundation.

---

## Phase 0 — Foundation & scaffolding

Get the monorepo, shared config, and the `packages/core` skeleton in place so everything after has a home. No product features yet — this is the structure.

- [x] Monorepo scaffold — pnpm workspaces + Turborepo
- [x] Shared config at root — `tsconfig.base.json` + Prettier (ESLint deferred until there is code to lint; a dedicated `packages/config` deferred until it earns its place)
- [x] `apps/web` scaffold — Vite + React + TypeScript
- [x] Tailwind + shadcn/ui baseline in `packages/ui` (design tokens, `cn`, Button; shadcn CLI/`components.json` wiring deferred to first component add in Phase 1)
- [ ] Wire TanStack Query, TanStack Router, Zustand
- [x] `packages/core` skeleton — `domain/` `ports/` `adapters/` `services/`
- [x] Domain types — `Node` (discriminated union), `Message`, `User`, `Avatar`, `Permission`, `AccessControlEntry`
- [x] Repository interfaces (ports) — `NodeRepository`, `MessageRepository`, `UserRepository`
- [x] Mock adapter + seed data (an example tree: a server, folders, a channel, messages)
- [x] `PermissionService` — effective-permission resolution with inherit-break (covered by vitest tests)
- [ ] Wire TanStack Query, TanStack Router, Zustand into `apps/web`
- [ ] ESLint flat config at root (now that there is code to lint)
- [~] Deploy to Netlify — deferred until there is a UI (user's call)

## Phase 1 — Core filesystem UI (the "Part 1 = UI only" milestone)

The distinctive, demo-able product, built entirely against the mock data layer. Nothing here touches a real backend.

- [ ] App shell / layout — calm, minimal, Signal-like
- [ ] Tree-navigation sidebar
- [ ] Path / address bar + breadcrumbs (derived from the tree)
- [ ] Node routing — stable ID URLs (`/n/:nodeId`), path derived for display
- [ ] Folder view — list children, ordered by `position`
- [ ] Create / rename / move / delete a Node (against mock)
- [ ] Drag-to-reorder (fractional `position`)
- [ ] Context menus (right-click) via Radix/shadcn
- [ ] Chat channel view — read message history from mock
- [ ] Post a message — with optimistic update
- [ ] Permission-aware UI — view/read/write gating driven by `PermissionService`
- [ ] Identity — pick / switch Avatar (mock), simple presence indicator
- [ ] Command line — basic `cd` / `ls` / `find` (the distinctive filesystem touch)

## Phase 2 — Real backend (Supabase)

Swap the mock adapter for Supabase behind the repository interfaces. Ideally the UI and services don't change.

- [ ] Supabase project + Postgres schema via SQL migrations (`nodes`, `messages`, `users`, `avatars`, `acl`)
- [ ] RLS policies — enforce inherited permissions in the database (the real security boundary)
- [ ] Supabase repository adapters — flip mock → Supabase
- [ ] Anonymous auth (Supabase Auth) + Avatar management
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
- Which file-type Nodes matter first (Phase 3)

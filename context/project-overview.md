# Purpose

Super Signal is an open-source, privacy-forward, community-first alternative to Discord. It exists as a reaction to platform proposals requiring government-ID verification and to the reality that mainstream community platforms can be gatekept by governments or big tech. The goal is a place to build communities — like a real-life neighbourhood but location-independent (interests, organizing, creativity) — that no central authority can lock people out of.

Core values:

- **Anonymity as a first-class principle** — no email or phone required, pseudonyms and throwaway identities are supported by design.
- **Not government- or big-tech-controlled** — open-source and self-hostable so no single party owns the door.
- **Calm over addictive** — works like Discord, feels like Signal.

Note: end-to-end encryption is *not* a requirement. Standard cloud providers are acceptable; the priority is anonymity and being ungatekeepable, not message secrecy from the host.

# Product Vision

**"Filesystem underneath, Signal/Discord on top."**

Works like Discord (servers/rooms, communities, chat, voice, file sharing); feels like Signal (calm, minimal, uncluttered). What makes it distinctive is the data model surfaced *as* the product: **everything is a Node in a filesystem tree** — folders, channels, files, servers, and users all share one identity and live in a navigable tree, with permissions inherited down the tree (Linux/ACL style). See [original-spec.md](original-spec.md) for the full object model and command-line vision.

# Core User Experience

- **Filesystem-forward, not Discord-clone.** v1 deliberately exposes folders and paths (and eventually a basic command line: `cd`, `ls`, `mv`, `find`, `@user`, `#tag`) rather than hiding the tree behind a Discord-familiar-only shell. This is the differentiator; we lean into it.
- **A navigable path/address bar** with breadcrumbs derived from the tree, so users always know "where" they are.
- **Chat and files as Nodes** in the same tree — a channel, a document, or a shared video are all Destinations you can `cd` into and be present in together.
- **Contexts** (later): the same tree re-skinned for **Dev**, **Gaming** (2D/3D folder traversal with an avatar), **Creative**, and **Web** modes.

# Data Model — Nodes & Permissions

This section explains our core abstraction and how it traces back to [original-spec.md](original-spec.md), so the reasoning is on record.

### Nodes (our name for the spec's "first-class objects")

The original spec lists a set of **"first-class objects"** — Folders, Chat/Voice Channels, the various File types, Servers, Hosts — and states that everything can be *"located within a folder, within a filesystem."* We call the shared identity behind all of those a **Node**.

A Node is the common base: it has an id, a name, an owner, a place in the tree (its parent), and permissions. Each kind of object (folder, chat channel, document, …) is simply a **specific type of Node**. So "everything is a Node" is our way of saying *every first-class object shares one identity and lives in one tree.* ("Node" is our terminology; the spec calls them "first-class objects" — same idea.)

### Identity — Users, Avatars, Presence

The spec defines an **Avatar** as *"a representation of a user and their place within the file system"* — which bundles two separate ideas. We keep them distinct, and identity lives **outside** the content tree (only content is made of Nodes):

- **User** — the account / login. Anonymous sign-in, credentials. This is the real identity boundary and nobody sees it directly.
- **Avatar** — a **pseudonymous persona belonging to a User**; one User can have several. This is the face other people see (name, appearance). Separate Avatars of the same User are unlinkable, which is a core privacy feature (your organizing persona and your gaming persona can't be connected). An Avatar is a *sub-identity*, not a Node.
- **Presence** — the live "where you are right now" pointer: which Node an Avatar is currently in, cursor position, "watching together." This is the *"place within the filesystem"* half of the spec's Avatar definition — modeled as ephemeral runtime state (via Realtime) that *points at* a Node, not as a stored Node itself.

### The tree

Because the spec says everything lives inside folders inside a filesystem, we represent the whole system as a **tree**: each Node knows its parent, and folders contain children. Navigation — the visible path and breadcrumbs, and eventually `cd` / `ls` — is just walking this tree.

### Permissions — "Linux-ACL-style," in plain terms

The spec says folders and commands have *"user permissions"* but doesn't specify a model. We chose the most familiar filesystem-permission approach — the **Unix/Linux** one — as our starting point, then generalized it and swapped Linux's cryptic `read`/`write`/`execute` (`rwx`) for plain-language verbs:

- **view** — you can see that it exists (it appears in the tree)
- **read** — you can see its contents (open a document, read a channel's history)
- **write** — you can add to it (post a message, edit the document, upload a file)
- **manage** — you can administer it (change its permissions, rename, move, delete)

Permissions are granted to a **user**, a **role** (e.g. "moderators"), or **everyone**.

### Inheritance (our addition)

Real Linux permissions don't inherit — each item stands alone. We *added* top-down inheritance because it fits a Discord-like world: set a server private once and everything inside it is private too. By default a Node **inherits its parents' permissions**. A Node can also **break inheritance** and define its own permissions from scratch — which is exactly how you get a **private channel inside a public server**: the channel breaks inheritance and lists only the roles allowed in, so the server's "everyone can read" grant no longer reaches it.

### Messages and other high-volume streams

Not everything belongs in the generic Node tree. **Chat messages** (and later feed / shorts items) are high-volume, append-heavy streams — potentially millions per channel — and don't each need a tree position or their own permissions. So they live in their **own table**, where each message belongs to a channel Node and **inherits that channel's permissions**. The Node tree stays the *structure* (folders, channels, documents); messages are a *stream attached to* a structural Node. This keeps the elegant Node model for what it is good at while keeping the hottest data path fast and purpose-built.

# Technology Stack

Each decision below records **the choice**, **why**, and **at scale** (what we'd do as user count grows). Language throughout is **TypeScript**, so types flow end-to-end across the monorepo.

### Frontend framework — Vite + React SPA
- **Why:** No SSR is needed for a chat app; a static SPA is the simplest thing to deploy to Netlify and the easiest to later wrap in Electron. React keeps us in the JS/TS ecosystem the team knows.
- **At scale:** A static SPA scales trivially on a CDN — user growth is served by the API/data tier, not the frontend. If SEO-facing public pages (community landing pages) ever matter, we add a small SSR/prerender layer for *those* routes only, without moving the app off the SPA.

### Language — TypeScript everywhere
- **Why:** One language across UI, shared logic, and services means domain types (Nodes, permissions) are defined once and reused everywhere, which is the main reason we chose a monorepo.
- **At scale:** Shared types remain the safety net as the number of services grows; no change needed.

### Styling — Tailwind + shadcn/ui (Radix primitives)
- **Why:** Tailwind is fast and the team already knows it; shadcn copies component *source* into our repo (in `packages/ui`) rather than installing a black-box library, so every pixel is editable and Radix gives us accessible menus/dialogs/tree interactions for free — ideal for a menu-heavy filesystem UI.
- **At scale:** Purely build-time CSS with zero runtime cost, so it has no bearing on user scale; it stays as-is.

### Server state — TanStack Query
- **Why:** Most of this app's state is remote (Nodes, channels, messages, members) — async, cached, backend-owned — and TanStack Query handles caching, revalidation, optimistic updates, and realtime merging so we don't hand-roll it. It also calls our `packages/core` interface without caring whether the data is mock or Supabase, which makes the eventual backend swap seamless.
- **At scale:** Client-side caching reduces redundant reads per user; as traffic grows we tune cache/stale times and lean on Supabase Realtime to push updates instead of polling.

### Client state — Zustand (frequent) / Context (static) / useState (local)
- **Why:** Global, frequently-changing UI state (current path, selection, command-palette, layout) belongs in Zustand, which has selective subscriptions and no provider re-render problems; Context is reserved for rarely-changing globals (theme, session), and `useState` for component-local state.
- **At scale:** Client state is per-session and never a scaling bottleneck; no change needed.

### Routing — TanStack Router, with stable ID-based URLs
- **Why:** TanStack Router gives fully type-safe params and schema-validated search params (valuable for storing filesystem view-state in the URL) and integrates with TanStack Query. URLs use **stable Node IDs** (`/n/:nodeId`, optional cosmetic slug) with the human-readable path *derived* from the tree — so renames, moves, and permission changes never break links, while still delivering the filesystem feel.
- **At scale:** Stable permalinks are exactly what you want as content and sharing grow; no change needed.

### Backend core (leaning) — Supabase
- **Why:** Supabase gives Postgres + Auth (with anonymous sign-in, matching our anonymity value) + Realtime + Storage in one open-source, self-hostable, EU-region-capable package; Row-Level Security enforces our inherited tree permissions *in the database*, so the SPA can talk to it directly with little-to-no backend code at first. Postgres fits a relationship-dense tree/permissions/membership model, with `jsonb` absorbing the polymorphic per-Node-type payloads.
- **At scale:** Postgres scales vertically and via read replicas a long way; hot paths (message feed, activity) can move to an additive NoSQL/edge store later, blobs already live in object storage, and because Supabase is open-source we can self-host or migrate the Postgres backbone if a managed tier becomes a cost/scale constraint. (AWS remains on the table given the team's familiarity.)

### Object storage — Supabase Storage or Cloudflare R2
- **Why:** Large files and media never belong in the database; the DB stores metadata + a pointer, and the bytes live in object storage. R2 is attractive for zero egress fees on media.
- **At scale:** Object storage is effectively infinitely scalable and CDN-frontable; media delivery cost/perf is managed at the storage/CDN layer independent of the app.

### Server-side logic — Deno Edge Functions + Postgres SQL functions
- **Why:** Logic that can't live in RLS (invites, webhooks, bot/LLM calls, moderation hooks) runs as Supabase Edge Functions, which execute on Deno (secure-by-default, TypeScript-native, web-standard `fetch`); tree-walking permission logic lives in SQL functions/triggers close to the data.
- **At scale:** Edge Functions scale automatically and run globally close to users; heavy or long-running jobs graduate to dedicated services rather than bloating edge functions.

### Known future services (not day 1)
- **Voice/video:** a WebRTC SFU — **LiveKit** (self-hostable, written in Go; we run it, we don't write it).
- **Real-time co-editing:** a CRDT layer — **Yjs** (JS-native, fits our stack).
- **Search-at-scale, feed/algorithm, bots/LLM:** added as satellite services over time around the Supabase core.
- **Performance escape hatch:** the whole stack is I/O-bound (Node/Deno's strength), so we stay all-TS. If profiling ever reveals a genuinely CPU-bound hot path (media transcode, search ranking), we rewrite **that one service** in **Go** rather than going polyglot pre-emptively.

# Backend & Data-Layer Architecture

### What "backend" means here — no Node.js server in the MVP

Unlike a classic Node.js + Express + Sequelize setup (a server you write and run between the client and the database), **the MVP has no dedicated backend server.** The React SPA talks **directly to Supabase** via `supabase-js`, and security is enforced by **RLS (row-level security) inside Postgres** — RLS is the *real* authority, so any client-side permission check is convenience/UX only. The only server-side code we author early is **SQL** (functions, triggers, policies) and small **Deno Edge Functions** (webhooks, bot/LLM calls). A traditional **Node.js backend tier returns only if/when we extract one for scale** — at which point the client just gets a new "call the API" adapter (see below) and nothing above it changes.

### Supabase = the AWS-services bundle

Conceptually, Supabase fills the slot a team would otherwise assemble from many AWS services: Postgres (~RDS), Auth (~Cognito), Storage (~S3), auto-generated API (~API Gateway/AppSync), Edge Functions (~Lambda, but Deno), Realtime (~AppSync subscriptions), RLS (~IAM-style access). Trade-off: an **integrated bundle** (less wiring, faster) vs. AWS's **toolbox** (more assembly, more ultimate scale/flexibility). Because it is **just Postgres underneath** and open-source/self-hostable, migrating to AWS RDS (or self-hosting) later is realistic — AWS stays on the table.

### The data layer — Ports & Adapters (a lite, pragmatic version)

We keep the provider swappable via one disciplined seam. A Sequelize "Model" secretly did three jobs; we split them:

- **Domain type** (`interface Node {...}`) — what the app reasons about → `packages/core/domain`
- **Repository** — *the database layer*; the only place the provider library (`supabase-js`, or later Drizzle/Prisma) appears; swap providers by swapping this → `packages/core/adapters`
- **Service** — business logic/orchestration (e.g. `createMessage` = permission check + validate + write) → `packages/core/services`
- Physical **schema** lives in SQL migrations (Postgres is the source of truth), not JS models.

```
packages/core/
├─ domain/     # TS types / entities (Node, Message, Permission)
├─ ports/      # repository INTERFACES — the swap seam (what buys provider-independence)
├─ adapters/   # implementations: mock now, supabase later, own-API someday
└─ services/   # business logic — ONLY where real logic exists
```

### "DDD-lite" — how much structure we actually adopt

The co-dev knows Domain-Driven Design; we adopt a **scaled-down** version to avoid over-abstraction:

- **Adopt:** ubiquitous language (code terms == domain terms), Entities/Value Objects (a way of *thinking* about types, not extra layers), Aggregates (design boundaries — e.g. `Node`+its ACL together, `Message` on its own referencing its channel by id), **Repositories** (the one non-negotiable swap seam), and Domain **Services** *only where logic exists*.
- **Defer:** Domain Events (`MessagePosted`, `NodeMoved`) until they earn their place.
- **Skip:** event sourcing, CQRS, heavy factories, multiple bounded contexts on day one.

**Guiding rule:** Repository always; Service only where there's real logic; never write a layer that just forwards a call. Swap-ability rides almost entirely on the repository interface — protect that boundary.

# Visual Design Direction

- **Calm and minimal — "feels like Signal."** Restrained palette, generous spacing, one clear typeface, low visual noise. The opposite of a busy, notification-maximizing interface.
- **Filesystem made legible, not intimidating.** Paths, breadcrumbs, and tree navigation are visible and first-class, but presented cleanly — the power-user command line is available without being mandatory.
- **Design system owned in-repo.** Because shadcn components live in `packages/ui`, the look is centrally defined via Tailwind design tokens and consistently applied across web and (later) desktop.

# Project Structure

Monorepo (chosen so the whole stack lives in one place to work through together), using **pnpm workspaces + Turborepo**.

```
super-signal/
├─ apps/
│  ├─ web/        # Vite + React SPA (deploys static to Netlify)
│  └─ desktop/    # Electron wrapper around the web build (later)
├─ packages/
│  ├─ core/       # Node tree + permissions + data-layer interface + mock data layer
│  ├─ ui/         # Tailwind + shadcn/ui component library (design system)
│  └─ config/     # shared TS/lint/build config
├─ services/      # backend satellite services (voice, co-edit, search, ...) — later
└─ context/       # this documentation
```

**Build order / staging:**

- **Part 1 = UI only**, built against the **mock data layer** in `packages/core` behind a clean, backend-neutral async interface (shaped Postgres-relational + object-storage pointers) so the backend choice can wait and the mock→Supabase swap is invisible to the UI.
- Backend (Supabase), then satellite services, layered in after.

# Success Criteria

- A user can create an anonymous identity with **no email or phone**, and navigate.
- The **filesystem model is visible and usable** — folders/paths/breadcrumbs — not hidden behind a Discord clone.
- Core Discord-like flows work: join a community, browse channels, chat, share a file.
- **Permissions inherit down the tree** correctly and are enforced at the data layer.
- The app **deploys statically to Netlify** and is structured so it can later be wrapped in Electron with no rewrite.
- The Part-1 UI runs entirely on the mock data layer, and swapping in the real backend requires **no changes to UI or query code**.
- The stack stays **cheap at low usage** (free/idle-friendly tiers) while having a clear, documented path to scale.

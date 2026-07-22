# Super Signal

An open-source, privacy-forward, community-first alternative to Discord — **"filesystem underneath, Signal/Discord on top."** It works like Discord (servers, channels, chat, file sharing) but feels like Signal (calm, minimal), and its defining idea is that **everything is a Node in a navigable filesystem tree**, with permissions that inherit down the tree. Anonymity is a first-class value: no email or phone is required.

> **Status:** Phase 0 (foundation) complete. Phase 1 (the core filesystem UI, built against an in-memory mock) is next. See [`context/roadmap.md`](context/roadmap.md).

## Tech stack

| Area              | Choice                      | Why                                                                                        |
| ----------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| Language          | TypeScript                  | Shared domain types across the whole monorepo                                              |
| Frontend          | Vite + React (SPA)          | Simplest static deploy; easy to wrap in Electron later                                     |
| Styling           | Tailwind v4 + shadcn/ui     | Component source lives in our repo (`packages/ui`), so every style is editable             |
| Server state      | TanStack Query              | Caching/refetch, and it calls our data layer without knowing if it's mock or real          |
| Routing           | TanStack Router             | End-to-end type-safe params + search                                                       |
| Client state      | Zustand                     | Lightweight global UI state                                                                |
| Monorepo          | pnpm workspaces + Turborepo | Efficient linking + cached tasks                                                           |
| Backend (planned) | Supabase                    | Postgres + Auth + Realtime + Storage in one self-hostable bundle; RLS enforces permissions |

The data layer uses **Ports & Adapters**: the app depends on repository _interfaces_ in `packages/core`, so the current in-memory mock can be swapped for Supabase later without changing the UI.

## Structure

```
super-signal/
├─ apps/web/        # Vite + React SPA
├─ packages/ui/     # Tailwind + shadcn design system (owned in-repo)
├─ packages/core/   # domain types, repository ports, services, mock adapter
└─ context/         # project docs (vision, data model, architecture, roadmap)
```

## Getting started (local dev)

**Prerequisites:** [Node.js](https://nodejs.org) 22+ (that's the only thing you install manually — pnpm comes from Corepack, which ships with Node).

```bash
# 1. Enable pnpm at the version this repo pins (via Corepack)
corepack enable

# 2. Install all workspace dependencies
pnpm install

# 3. Run the web app (http://localhost:5173)
pnpm --filter @super-signal/web dev
```

### Useful scripts (from the repo root)

| Command                                 | What it does                       |
| --------------------------------------- | ---------------------------------- |
| `pnpm dev`                              | Run dev tasks across the workspace |
| `pnpm build`                            | Build all packages                 |
| `pnpm typecheck`                        | Type-check every package           |
| `pnpm lint`                             | Lint the whole repo                |
| `pnpm format`                           | Format with Prettier               |
| `pnpm --filter @super-signal/core test` | Run the core unit tests            |

## Documentation

Deeper context lives in [`context/`](context/): the [project overview](context/project-overview.md), [roadmap](context/roadmap.md), [coding standards](context/coding-standards.md), and the original [product spec](context/original-spec.md).

## Open questions

- **ORM inside repositories** — start with `supabase-js` directly, or adopt Drizzle? (Lives behind the repository, so it's swappable.)
- **Anonymity scope** — "unlinkable to other users" (current assumption) vs. the stronger "unlinkable to the host."
- **Abuse / Sybil resistance** — since email/phone are optional, how do we deter spam/throwaway abuse (proof-of-work, invite trees, rate limits, per-community verification)?
- **First file-type Nodes** — which document/media types to support first.

---

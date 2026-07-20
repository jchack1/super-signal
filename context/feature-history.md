## List all completed features here with a short description and date they were implemented

### 2026-07-19 — Phase 0: Project foundation & scaffolding

Not a user-facing feature — this is the groundwork the rest of the app is built on.

- **Monorepo** scaffolded with pnpm workspaces + Turborepo.
- **`apps/web`** — Vite + React + TypeScript app; TanStack Query, TanStack Router, and Zustand wired in (providers + a composition root that selects the data layer).
- **`packages/ui`** — Tailwind v4 with design tokens, the `cn` helper, and an editable shadcn-style `Button`.
- **`packages/core`** — the domain model (Node tree, permissions, identity), repository interfaces (ports), an in-memory mock adapter + seed data, and a `PermissionService` implementing inherit-break permission resolution (unit-tested, 4 passing tests).
- **Tooling** — root ESLint (flat config) + Prettier; TypeScript pinned to stable 5.x; shared strict `tsconfig.base.json`.

## List all completed features here with a short description and date they were implemented

### 2026-07-19 — Phase 0: Project foundation & scaffolding

Not a user-facing feature — this is the groundwork the rest of the app is built on.

- **Monorepo** scaffolded with pnpm workspaces + Turborepo.
- **`apps/web`** — Vite + React + TypeScript app; TanStack Query, TanStack Router, and Zustand wired in (providers + a composition root that selects the data layer).
- **`packages/ui`** — Tailwind v4 with design tokens, the `cn` helper, and an editable shadcn-style `Button`.
- **`packages/core`** — the domain model (Node tree, permissions, identity), repository interfaces (ports), an in-memory mock adapter + seed data, and a `PermissionService` implementing inherit-break permission resolution (unit-tested, 4 passing tests).
- **Tooling** — root ESLint (flat config) + Prettier; TypeScript pinned to stable 5.x; shared strict `tsconfig.base.json`.

### 2026-07-19 — Phase 1 (slice 1): App shell + filesystem UI foundation

The first real UI, built entirely on the mock data layer. Introduces the "phosphor" design system and the core three-pane shell.

- **Design system (`packages/ui`)** — reworked `globals.css` to the dark-only phosphor theme (warm charcoal chrome, paper content surface, phosphor-teal accent, amber `--tag` / blue `--mention`), mapped onto the existing shadcn semantic tokens plus custom `--bevel-hi/lo` and mono/sans font tokens; forced the `dark` theme in `index.html`. Added two reusable primitives: `Panel` (beveled raised/inset surface) and `Avatar` (name-seeded colour square).
- **App shell (`apps/web`)** — window chrome (title bar, breadcrumb **address bar**, **status bar**) around a three-pane body: **tree sidebar** (recursive, reads children from the mock, expand/collapse, selection), **center view** (read-only **chat channel** with `@`/`#` highlighting, plus a placeholder for non-chat nodes), and a **members panel** (participants derived from message authors). Current-Node selection lives in the Zustand `ui-store`; breadcrumbs/path derive from the tree via `useNodePath`.
- **Data hooks** — `useChildren`, `useAncestors`, `useMessages`, `useAvatar`, `useNodePath` (all through `dataLayer`, provider-agnostic).
- **Scope for later slices:** ID-based routing (`/n/$nodeId`), posting messages, create/rename/move/delete, drag-reorder, context menus, permission-aware gating, real presence, and the command line in the address bar.
- Verified: `typecheck`, `build`, and `lint` all green; compiled CSS confirmed to include the custom token classes.

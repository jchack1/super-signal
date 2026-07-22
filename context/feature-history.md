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

### 2026-07-19 — Phase 1 (slice 2): ID-based routing + message posting

- **ID-based routing** — added the `/n/$nodeId` route; the URL is now the single source of truth for the current Node (stable Node id, human path derived from the tree — so renames/moves never break links). `/` redirects to a default Node. Selection moved out of the Zustand store into the URL via two small hooks (`useCurrentNodeId`, `useNavigateToNode`); the store now holds UI-only state. Browser back/forward work as a result, and the address bar's back/forward arrows are ready to light up (up-one-level already works). `AppShell` stays mounted across Node changes, preserving tree/scroll state. Removed the superseded `pages/home.tsx` placeholder.
- **Message posting** — the composer is live: `useSendMessage` performs an optimistic update (message appears instantly, rolls back on error, reconciles on settle) against `dataLayer.messages.create`. Author is a mock `CURRENT_AVATAR_ID` stand-in (`lib/session.ts`) until real identity lands. Extracted a `MessageComposer` component.
- **Own-message marker** — channels stay a uniform left-aligned list (they scale past two people); your own messages get a subtle tint + a "you" tag. Right/left "you vs them" bubbles are intentionally reserved for 1:1 DMs (a later view).
- **Not-found handling** — `MainView` now distinguishes loading from a missing Node (a bad `/n/:id` shows a "Node not found" state instead of a perpetual spinner).
- **Scope for later slices:** create/rename/move/delete, drag-reorder, context menus, permission-aware gating, real identity/presence, the command line, and a cosmetic slug on Node URLs.
- Verified: `typecheck`, `lint`, and `build` all green.

### 2026-07-21 — Phase 1 (slice 3): Unified command line (pivot to one bar)

- **UX pivot — back to the spec's single command line.** Reverted the "two boxes, two jobs" split (address bar for nav, separate message box for chat) to the original spec's **one prompt**, disambiguated by **sigils**: input starting with `@`/`#` is a **message**, everything else is a **command**. Updated `project-overview.md` to match. The one prompt lives at the **bottom**; the top address bar is now **read-only breadcrumbs** (click a crumb = `cd`). The separate `MessageComposer` was removed (folded into the prompt; `useSendMessage` reused unchanged).
- **The command line (`components/command-prompt.tsx` + `command-results.tsx`).** Supports `cd` (and bare-path typing), `ls`, `find`, `mv`, `cp`, plus `@`/`#` messaging to the current channel. `ls`/`find` render a keyboard-navigable dropdown above the prompt (↑/↓ to move, Enter to `cd` into the highlight, Escape to dismiss; click also works).
- **Message sigil handling.** An `@mention` and a `#hashtag` glued to a word stay in the posted body (they render highlighted in the thread); a **bare `# ` is stripped** — it's just the "post to the current channel" sigil, so it no longer echoes a stray `#` into chat.
- **Pure, testable core (`lib/command-line/`).** `tokenize` (quote-aware, for `mv`/`cp` with spaces) → `parse` (raw → typed `Command`) → `resolvePath` (absolute/relative/`.`/`..`, dependency-injected tree reader) → `executeCommand` (returns a typed `CommandResult`; touches only the data layer). `mv`/`cp` are the first tree mutations: `mv` guards against cycles/non-folder targets; `cp` deep-copies a subtree with fresh ids (structure only — messages not copied). `hooks/use-command-line.ts` wires these to the router, the optimistic sender, and `['children']` cache invalidation. Added `lib/tree-position.ts` (`appendPosition`, LexoRank lib deferred).
- **Mock seed deepened** — added a nested `projects` folder (with `frontend` and a nested `archive/old-general`) so `cd`/`ls`/`find`/`mv`/`cp` are exercisable.
- **Tooling** — added a minimal **vitest** setup to `apps/web` (+ a root `test` turbo task). New tests: `tokenize`, `parse`, `resolve-path`, `execute` (32 tests, all passing). `stores/ui-store.ts` trimmed to an empty template (its `commandLineOpen` state is no longer needed — the prompt is always present).
- **Deferred (flagged):** cross-channel/tag message routing (`#other-channel …` posts to the *current* channel only for now), permission-aware gating, tab-completion, copying messages on `cp`, and back/forward history on the breadcrumb arrows. Possible QoL later: "when in a channel, plain text = message" (today every message needs a `@`/`#` sigil).
- Verified: `pnpm test`, `typecheck`, `lint`, and `build` all green.

### 2026-07-21 — Phase 1 (slice 4): Folder view

- **Center-pane folder listing (`components/folder-view.tsx`).** A container Node (server or folder) now shows its **contents** in the main pane — children ordered by `position`, each row a glyph + name + kind label; click a row to `cd` into it. Header shows the folder name and an item count; empty folders say so. `MainView` now routes by node type: `chat-channel` → chat, `server`/`folder` → `FolderView`, everything else → the placeholder (now just voice/document). Reuses the existing `useChildren` hook and `nodeGlyph`; no new data or logic. The deep seed (`projects` → `frontend`, `archive/old-general`) is now browsable in the main pane, not just the tree.
- Verified: `typecheck`, `lint`, and `build` all green (no new tests — the view is presentational over the already-tested `useChildren`).

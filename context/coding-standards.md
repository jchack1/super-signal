# Coding Standards

## TypeScript

- Strict mode enabled

- No `any` types - use proper typing or `unknown`

- Define interfaces or types for API responses and component props

- Prefer explicit domain types over generic objects

- Use unions or enums where they improve clarity

- Avoid type assertions unless there is no reasonable alternative

- Use type inference where obvious, explicit types where it improves readability

## Type Organization

- Keep types **as central as possible** to avoid duplicate definitions drifting out of sync

- Shared **domain types** (Node, Permission, User, Channel, Message, etc.) are the single source of truth and live centrally — in `packages/core` for cross-package types; in a per-app `src/types/` folder (split by domain) for app-local types used across multiple files

- **Exceptions that may stay colocated in one file:** component prop types, and any type used in only that single file

- **Do not export types from hooks.** A hook imports the types it needs; if a hook's return shape is needed elsewhere, define it centrally and import it into the hook — never re-export it from the hook file

- Prefer **deriving** types from a single source (infer from the data-layer interface / schema) over hand-writing parallel definitions, so there is nothing to keep in sync manually

## React

- Functional components only (no class components)

- Use hooks for state and side effects

- Keep components focused on a single responsibility

- Extract reusable logic into custom hooks

- Prefer derived state over duplicated state

- Avoid unnecessary re-renders and overuse of `useEffect`

- Use `useEffect` only when there is no better alternative

## Naming

- Components: PascalCase (`ItemCard.tsx`)

- Functions: camelCase

- Constants: SCREAMING_SNAKE_CASE

- Types/Interfaces: PascalCase (no prefix)

## Styling

- We use **Tailwind CSS** for styling, with **shadcn/ui** (Radix primitives) components owned in-repo under `packages/ui`

- Edit component appearance directly in the shadcn component source (Tailwind utility classes) — we own those files, there is no library to override

- Keep the look consistent via shared Tailwind design tokens rather than one-off values

- Reserve plain CSS / CSS Modules for the rare cases Tailwind utilities genuinely cannot express (e.g. complex keyframes)

## Error Handling

- Fail explicitly with meaningful error messages

- Never silently swallow errors

- Log unexpected errors with enough context for debugging

- Surface actionable information to the user when appropriate

## Code Quality

- Prefer readable code over clever code

- Keep logic easy to follow during code review

- No commented-out code unless explicitly required

- No unused imports or variables

- Prefer incremental, reviewable changes over large rewrites

- Prefer modular components and avoid large files; split when a component starts handling multiple responsibilities or becomes difficult to reason about

## Dependencies & Versions

- Prefer the **most recent _stable_ version** of a dependency — not the bleeding edge. Avoid pre-release, beta, or brand-new major versions that the surrounding ecosystem (linters, plugins, types) hasn't caught up to yet.

- If a "latest" version breaks tooling or lacks ecosystem support, pin to the newest stable version that everything supports, and note why. (Example: TypeScript is pinned to 5.x because the ESLint/typescript-eslint toolchain does not yet support TypeScript 7.)

- Keep a dependency's version consistent across all workspace packages.

## Consistency

- Prefer existing project patterns over introducing new patterns

- Match surrounding code style unless there is a strong reason not to

- Avoid introducing new abstractions unless they clearly reduce complexity

- Before adding a new pattern, check if a similar one already exists in the codebase

## Abstractions

- Introduce abstractions when they clearly improve readability, maintainability, or reuse

## Testing

- Test behavior rather than implementation details

- Focus on critical logic and edge cases

- Prefer targeted tests that provide meaningful confidence

- Avoid brittle tests tied to internal implementation details

## Debugging

When debugging:

1. Identify the most likely root cause first

2. Explain why the issue is happening

3. Apply minimal, isolated fixes

4. Avoid multiple unrelated changes in one attempt

5. If uncertain, explicitly state uncertainty

If a problem is not resolved after 2–3 attempts:

- Stop and reassess instead of continuing with random changes

- Ask for clarification if requirements are unclear

## Code Review

When reviewing code:

- Focus on correctness before style

- Identify assumptions and edge cases

- Check for security, performance, and logic issues

- Call out code that is difficult to reason about or test

- Separate definite issues from subjective suggestions

- Prefer explanations over directives when something is non-obvious

- If problems identified, don't change the code until after I have approved it

## Collaboration

- Optimize for understanding the codebase, not just task completion

- When multiple valid approaches exist, explain tradeoffs

- Be transparent about uncertainty instead of guessing

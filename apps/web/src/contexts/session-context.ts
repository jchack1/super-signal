import { createContext } from 'react';
import type { Actor, AvatarId } from '@super-signal/core';
import type { CURRENT_USER_ID } from '../lib/session';

// "Who you are right now" — the fixed User (no login flow yet, so this is
// always the one mock user) plus the switchable Avatar (the persona you're
// currently posting/acting as). `actor` is the shape PermissionService checks
// need, derived from the two above.
//
// Why Context and not Zustand? This project uses both, split by how *often*
// the state changes (see context/project-overview.md): Zustand is for things
// that change a lot (current path, selection); Context is for things that
// change rarely but need to be the same everywhere (theme, session). Which
// avatar you're speaking as changes only when you deliberately switch it, so
// it belongs here, not in Zustand.
//
// Split across three small files — this one (just the Context object), the
// `SessionProvider` component in `session-provider.tsx`, and the `useSession`
// hook in `hooks/use-session.ts`. React Fast Refresh (the dev-server
// hot-reload) requires a `.tsx` file to export *only* components, so the
// non-component pieces live here and in `hooks/`, matching where every other
// hook in this app already sits.
export const SessionContext = createContext<{
  userId: typeof CURRENT_USER_ID;
  avatarId: AvatarId;
  actor: Actor;
  setAvatarId: (avatarId: AvatarId) => void;
} | null>(null);

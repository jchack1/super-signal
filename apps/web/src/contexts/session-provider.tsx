import { useMemo, useState, type ReactNode } from 'react';
import type { AvatarId } from '@super-signal/core';
import { CURRENT_AVATAR_ID, CURRENT_USER_ID } from '../lib/session';
import { SessionContext } from './session-context';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [avatarId, setAvatarId] = useState<AvatarId>(CURRENT_AVATAR_ID);

  // Memoized so components reading `actor` (permission checks, message
  // authorship) don't re-render on every provider render — only when the
  // avatar actually changes.
  const value = useMemo(
    () => ({
      userId: CURRENT_USER_ID,
      avatarId,
      actor: { userId: CURRENT_USER_ID, avatarId, roleIds: [] },
      setAvatarId,
    }),
    [avatarId],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

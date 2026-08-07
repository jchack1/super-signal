import { useContext } from 'react';
import { SessionContext } from '../contexts/session-context';

// Reads "who you are right now" (see contexts/session-context.ts for why this
// is Context and not Zustand). Split into its own file, separate from the
// provider, so the provider's file only exports a component (Fast Refresh
// requirement).
export function useSession() {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return session;
}

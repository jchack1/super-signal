import { useQuery } from '@tanstack/react-query';
import type { UserId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// All of a User's Avatars (their separate, unlinkable personas). Powers the
// avatar switcher — the list of options you can switch to.
export function useAvatars(userId: UserId) {
  return useQuery({
    queryKey: ['avatars', userId],
    queryFn: () => dataLayer.users.listAvatars(userId),
  });
}

import { useQuery } from '@tanstack/react-query';
import type { AvatarId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// One avatar (the public persona) by id. Message rows and the members panel use
// this to turn an `authorAvatarId` into a display name; TanStack Query dedupes
// the repeated reads for the same id.
export function useAvatar(avatarId: AvatarId) {
  return useQuery({
    queryKey: ['avatar', avatarId],
    queryFn: () => dataLayer.users.getAvatar(avatarId),
  });
}

import { useQuery } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// The message stream for a channel Node, oldest-first (as the repository returns).
export function useMessages(channelId: NodeId) {
  return useQuery({
    queryKey: ['messages', channelId],
    queryFn: () => dataLayer.messages.listByChannel(channelId),
  });
}

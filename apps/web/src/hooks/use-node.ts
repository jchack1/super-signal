import { useQuery } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// A read of one Node, cached by TanStack Query. The `queryKey` identifies this
// piece of data in the cache; the `queryFn` is how to fetch it. Notice the hook
// only talks to `dataLayer` (our interface) — it has no idea if that's a mock or
// Supabase underneath.
export function useNode(nodeId: NodeId) {
  return useQuery({
    queryKey: ['node', nodeId],
    queryFn: () => dataLayer.nodes.getNode(nodeId),
  });
}
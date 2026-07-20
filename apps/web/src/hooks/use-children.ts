import { useQuery } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// The direct children of a folder/server, ordered by `position`. `enabled` lets
// the tree skip the fetch for collapsed or non-container nodes.
export function useChildren(parentId: NodeId, enabled = true) {
  return useQuery({
    queryKey: ['children', parentId],
    queryFn: () => dataLayer.nodes.getChildren(parentId),
    enabled,
  });
}

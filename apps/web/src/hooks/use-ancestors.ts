import { useQuery } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// Ancestors nearest-first: [parent, grandparent, …, root]. Drives breadcrumbs.
export function useAncestors(nodeId: NodeId) {
  return useQuery({
    queryKey: ['ancestors', nodeId],
    queryFn: () => dataLayer.nodes.getAncestors(nodeId),
  });
}

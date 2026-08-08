import { useQuery } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';
import { useSession } from './use-session';

// The direct children of a folder/server, ordered by `position`. `enabled` lets
// the tree skip the fetch for collapsed or non-container nodes.
//
// Hides nodes the actor can't `view` (Discord-style: absent, not greyed out).
// Every listing surface — the tree sidebar, the folder view, and (recursively)
// each expanded TreeNode — reads through this one hook, so filtering here is
// what makes a private node disappear everywhere at once.
export function useChildren(parentId: NodeId, enabled = true) {
  const { actor } = useSession();
  return useQuery({
    queryKey: ['children', parentId, actor.userId],
    queryFn: async () => {
      const children = await dataLayer.nodes.getChildren(parentId);
      return dataLayer.permissions.filterViewable(actor, children);
    },
    enabled,
  });
}

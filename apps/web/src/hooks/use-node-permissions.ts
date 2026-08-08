import { useQuery } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';
import { useSession } from './use-session';

// The current actor's full effective permission set on one node — the basis
// for UI-level gating (which context-menu items to offer, whether the current
// node is even viewable). Fetched once as a `Set<Permission>` rather than one
// `can()` call per action, since call sites typically need to check several
// verbs (e.g. both `manage` and `write`) on the same node.
export function useNodePermissions(nodeId: NodeId) {
  const { actor } = useSession();
  return useQuery({
    queryKey: ['permissions', nodeId, actor.userId],
    queryFn: () => dataLayer.permissions.effectivePermissions(actor, nodeId),
  });
}

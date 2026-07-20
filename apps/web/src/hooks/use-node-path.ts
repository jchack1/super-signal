import type { Node, NodeId } from '@super-signal/core';
import { useNode } from './use-node';
import { useAncestors } from './use-ancestors';

// The full path root-first: [root, …, parent, current]. Derived from the node
// plus its ancestors, so the address bar and status bar share one source of
// truth for "where am I". Returns an empty path until both reads resolve.
export function useNodePath(nodeId: NodeId): { path: Node[]; isLoading: boolean } {
  const node = useNode(nodeId);
  const ancestors = useAncestors(nodeId);

  const path =
    node.data && ancestors.data ? [...[...ancestors.data].reverse(), node.data] : [];

  return { path, isLoading: node.isLoading || ancestors.isLoading };
}

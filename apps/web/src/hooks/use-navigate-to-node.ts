import { useNavigate } from '@tanstack/react-router';
import type { NodeId } from '@super-signal/core';

// Returns a function that navigates to a Node by id (`/n/$nodeId`). "Selecting" a
// Node is now just a URL change, so back/forward and shareable links work for
// free. Paired with `useCurrentNodeId` for reads.
export function useNavigateToNode() {
  const navigate = useNavigate();
  return (nodeId: NodeId) => {
    void navigate({ to: '/n/$nodeId', params: { nodeId } });
  };
}

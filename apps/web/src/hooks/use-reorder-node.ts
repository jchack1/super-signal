import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Node, NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';

// Reorders one child among its siblings by giving it a new fractional
// `position` (see `positionBetween`), with an optimistic re-sort of the cached
// children list so drag-and-drop feels instant. Same optimistic-then-reconcile
// shape as `useSendMessage`.
export function useReorderNode(parentId: NodeId) {
  const queryClient = useQueryClient();
  const queryKey = ['children', parentId] as const;

  return useMutation({
    mutationFn: ({ nodeId, position }: { nodeId: NodeId; position: string }) =>
      dataLayer.nodes.update(nodeId, { position }),

    onMutate: async ({ nodeId, position }) => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<Node[]>(queryKey);

      queryClient.setQueryData<Node[]>(queryKey, (old = []) =>
        old
          .map((node) => (node.id === nodeId ? { ...node, position } : node))
          .sort((a, b) => a.position.localeCompare(b.position)),
      );

      return { previous };
    },

    onError: (_error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous);
      }
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });
}

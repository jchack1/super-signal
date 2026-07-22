import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';
import { parse } from '../lib/command-line/parse';
import { executeCommand } from '../lib/command-line/execute';
import type { CommandResult } from '../lib/command-line/types';
import { useNavigateToNode } from './use-navigate-to-node';
import { useSendMessage } from './use-send-message';

// The seam between the pure command logic and the app's live machinery. It parses
// and executes a line, then applies the side effects the pure layer can't: routing
// (navigate), the optimistic sender (message), and cache invalidation (mv/cp). The
// raw CommandResult is returned so the UI can render listings/matches/errors.
//
// Messages target the current channel only for now, so `useSendMessage` is bound
// to the current node up front (cross-channel routing is deferred).
export function useCommandLine(currentNodeId: NodeId): (raw: string) => Promise<CommandResult> {
  const queryClient = useQueryClient();
  const navigateToNode = useNavigateToNode();
  const { mutate: sendMessage } = useSendMessage(currentNodeId);

  return useCallback(
    async (raw: string): Promise<CommandResult> => {
      const command = parse(raw);
      const result = await executeCommand(command, { repo: dataLayer.nodes, currentNodeId });

      switch (result.kind) {
        case 'navigate':
          navigateToNode(result.nodeId);
          break;
        case 'message':
          sendMessage(result.body);
          break;
        case 'info':
          for (const parentId of result.invalidateParentIds) {
            void queryClient.invalidateQueries({ queryKey: ['children', parentId] });
          }
          break;
      }

      return result;
    },
    [currentNodeId, navigateToNode, sendMessage, queryClient],
  );
}

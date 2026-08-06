import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { NodeId } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';
import { CURRENT_ACTOR } from '../lib/session';
import { parse } from '../lib/command-line/parse';
import { executeCommand } from '../lib/command-line/execute';
import type { Command, CommandResult } from '../lib/command-line/types';
import { useNavigateToNode } from './use-navigate-to-node';
import { useSendMessage } from './use-send-message';

// The seam between the pure command logic and the app's live machinery. It parses
// (or accepts an already-parsed Command, for re-running a confirmed `rm`) and
// executes a line, then applies the side effects the pure layer can't: routing
// (navigate), the optimistic sender (message), and cache invalidation (mv/cp/rm).
// The raw CommandResult is returned so the UI can render listings/matches/errors.
//
// Messages target the current channel only for now, so `useSendMessage` is bound
// to the current node up front (cross-channel routing is deferred).
export function useCommandLine(
  currentNodeId: NodeId,
): (input: string | Command) => Promise<CommandResult> {
  const queryClient = useQueryClient();
  const navigateToNode = useNavigateToNode();
  const { mutate: sendMessage } = useSendMessage(currentNodeId);

  return useCallback(
    async (input: string | Command): Promise<CommandResult> => {
      const command = typeof input === 'string' ? parse(input) : input;
      const result = await executeCommand(command, {
        repo: dataLayer.nodes,
        currentNodeId,
        permissions: dataLayer.permissions,
        actor: CURRENT_ACTOR,
      });

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
          if (result.renamedNodeId) {
            // The renamed node's own cached data, plus the current view's
            // breadcrumb (in case the rename touched one of its ancestors).
            void queryClient.invalidateQueries({ queryKey: ['node', result.renamedNodeId] });
            void queryClient.invalidateQueries({ queryKey: ['ancestors', currentNodeId] });
          }
          break;
      }

      return result;
    },
    [currentNodeId, navigateToNode, sendMessage, queryClient],
  );
}

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Node } from '@super-signal/core';
import { dataLayer } from '../lib/data-layer';
import { buildAbsolutePath } from '../lib/command-line/absolute-path';
import { executeCommand } from '../lib/command-line/execute';
import type { Command, CommandResult, CreatableNodeType } from '../lib/command-line/types';
import { useCurrentNodeId } from './use-current-node-id';
import { useSession } from './use-session';

/**
 * Mouse-driven counterpart to `useCommandLine`: runs the same `executeCommand`
 * against an explicit target node rather than the app's globally-navigated
 * "current" node (a right-clicked row can be anywhere in the tree, not just
 * wherever the user last `cd`'d). Targets are addressed by absolute path
 * (`buildAbsolutePath`), so any valid node works as `executeCommand`'s
 * `currentNodeId` — absolute paths ignore it and start at the root regardless.
 *
 * Applies the same cache-invalidation contract `useCommandLine` uses for
 * `info` results, so the tree/folder view refresh the same way whether a
 * mutation came from the command line or a context menu.
 */
export function useNodeActions() {
  const queryClient = useQueryClient();
  const { actor } = useSession();
  const currentNodeId = useCurrentNodeId();

  const run = useCallback(
    async (command: Command, executeAt: Node['id']): Promise<CommandResult> => {
      const result = await executeCommand(command, {
        repo: dataLayer.nodes,
        currentNodeId: executeAt,
        permissions: dataLayer.permissions,
        actor,
      });

      if (result.kind === 'info') {
        for (const parentId of result.invalidateParentIds) {
          void queryClient.invalidateQueries({ queryKey: ['children', parentId] });
        }
        if (result.renamedNodeId) {
          void queryClient.invalidateQueries({ queryKey: ['node', result.renamedNodeId] });
          void queryClient.invalidateQueries({ queryKey: ['ancestors', currentNodeId] });
        }
      }

      return result;
    },
    [actor, currentNodeId, queryClient],
  );

  const rename = useCallback(
    async (node: Node, newName: string): Promise<CommandResult> => {
      const ancestors = await dataLayer.nodes.getAncestors(node.id);
      const path = buildAbsolutePath(node, ancestors);
      return run({ kind: 'rename', path, newName }, node.id);
    },
    [run],
  );

  // Always recursive: a right-click "Delete" has no equivalent of the command
  // line's `-r` flag, and the confirm dialog already states how much it will
  // remove, matching how GUI file managers handle "delete a non-empty folder".
  const remove = useCallback(
    async (node: Node): Promise<CommandResult> => {
      const ancestors = await dataLayer.nodes.getAncestors(node.id);
      const path = buildAbsolutePath(node, ancestors);
      return run({ kind: 'rm', path, recursive: true, confirmed: false }, node.id);
    },
    [run],
  );

  const create = useCallback(
    async (parent: Node, type: CreatableNodeType, name: string): Promise<CommandResult> =>
      run({ kind: 'create', type, name }, parent.id),
    [run],
  );

  return { run, rename, remove, create };
}

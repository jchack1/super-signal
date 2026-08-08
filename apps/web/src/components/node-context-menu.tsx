import { useState, type ReactNode } from 'react';
import type { Node } from '@super-signal/core';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@super-signal/ui/components/alert-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@super-signal/ui/components/context-menu';
import { useNodeActions } from '../hooks/use-node-actions';
import type { Command, CreatableNodeType } from '../lib/command-line/types';
import { isContainer } from '../lib/node-display';

// What "New" offers and the default name each starts with — mouse-driven
// create has no equivalent of typing a name up front, so it creates
// immediately with this default and leaves renaming to the existing Rename
// action, rather than adding a second inline-text-entry mechanism.
const NEW_NODE_TYPES: { type: CreatableNodeType; label: string; defaultName: string }[] = [
  { type: 'folder', label: 'Folder', defaultName: 'New Folder' },
  { type: 'server', label: 'Server', defaultName: 'New Server' },
  { type: 'chat-channel', label: 'Chat channel', defaultName: 'new-channel' },
  { type: 'voice-channel', label: 'Voice channel', defaultName: 'new-voice-channel' },
];

type DialogState =
  | { kind: 'confirm'; message: string; command: Command }
  | { kind: 'error'; message: string };

/**
 * Right-click access to the mutating command-line verbs (rename/create/rm)
 * for a single Node, so the command line stays powerful but not mandatory.
 * `mv`/`cp` are deliberately not here — both need a destination the user
 * picks, and there's no tree/path picker UI yet to drive that from a menu.
 *
 * Rename has no UI of its own: selecting it calls `onRenameRequest`, which
 * the row (TreeNode / the folder-view row) uses to swap its own display for
 * an inline `RenameInput` — this component only owns the parts that don't
 * depend on the row's layout (the menu itself, and Delete's confirmation).
 */
export function NodeContextMenu({
  node,
  onRenameRequest,
  onCreated,
  children,
}: {
  node: Node;
  onRenameRequest: () => void;
  /** Called after "New …" creates a child — lets a collapsed tree row expand
   * itself so the result is actually visible instead of silently succeeding
   * behind a collapsed twisty. */
  onCreated?: () => void;
  children: ReactNode;
}) {
  const actions = useNodeActions();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const handleDelete = async () => {
    const result = await actions.remove(node);
    if (result.kind === 'confirm') {
      setDialog({ kind: 'confirm', message: result.message, command: result.command });
    } else if (result.kind === 'error') {
      setDialog({ kind: 'error', message: result.message });
    }
  };

  const confirmDelete = async () => {
    if (dialog?.kind !== 'confirm') return;
    const result = await actions.run(dialog.command, node.id);
    setDialog(result.kind === 'error' ? { kind: 'error', message: result.message } : null);
  };

  const handleCreate = async (type: CreatableNodeType, defaultName: string) => {
    const result = await actions.create(node, type, defaultName);
    if (result.kind === 'error') setDialog({ kind: 'error', message: result.message });
    else onCreated?.();
  };

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onSelect={onRenameRequest}>Rename</ContextMenuItem>
          {isContainer(node) && (
            <ContextMenuSub>
              <ContextMenuSubTrigger>New</ContextMenuSubTrigger>
              <ContextMenuSubContent>
                {NEW_NODE_TYPES.map(({ type, label, defaultName }) => (
                  <ContextMenuItem key={type} onSelect={() => void handleCreate(type, defaultName)}>
                    {label}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubContent>
            </ContextMenuSub>
          )}
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive" onSelect={() => void handleDelete()}>
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        <AlertDialogContent>
          <AlertDialogTitle>
            {dialog?.kind === 'error' ? "Can't delete" : `Delete ${node.name}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>{dialog?.message}</AlertDialogDescription>
          <div className="mt-4 flex justify-end gap-2">
            {dialog?.kind === 'confirm' ? (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
              </>
            ) : (
              <AlertDialogCancel>OK</AlertDialogCancel>
            )}
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

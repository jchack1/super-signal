import { useState } from 'react';
import type { Node, NodeId } from '@super-signal/core';
import { cn } from '@super-signal/ui/lib/utils';
import { useChildren } from '../hooks/use-children';
import { useNavigateToNode } from '../hooks/use-navigate-to-node';
import { isContainer, nodeGlyph } from '../lib/node-display';
import { NodeContextMenu } from './node-context-menu';
import { RenameInput } from './rename-input';

// One row in the tree, rendered recursively. Containers (server/folder) expand to
// reveal their children; leaves (channels/docs) just select. Children are fetched
// only while expanded (see the `enabled` arg to `useChildren`).
export function TreeNode({
  node,
  depth,
  currentNodeId,
}: {
  node: Node;
  depth: number;
  currentNodeId: NodeId;
}) {
  const container = isContainer(node);
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const navigateToNode = useNavigateToNode();
  const { data: children } = useChildren(node.id, container && expanded);

  const selected = node.id === currentNodeId;

  const handleClick = () => {
    navigateToNode(node.id);
    if (container) setExpanded((value) => !value);
  };

  return (
    <div>
      <NodeContextMenu
        node={node}
        onRenameRequest={() => setRenaming(true)}
        onCreated={() => setExpanded(true)}
      >
        {renaming ? (
          <div
            style={{ paddingLeft: depth * 12 + 6 }}
            className="flex items-center gap-1.5 py-1 pr-2"
          >
            <span className="w-2.5" aria-hidden="true" />
            <span className="w-4 text-center opacity-85">{nodeGlyph(node.type)}</span>
            <RenameInput
              node={node}
              onDone={() => setRenaming(false)}
              className="px-1 py-0 text-[12.5px]"
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            style={{ paddingLeft: depth * 12 + 6 }}
            className={cn(
              'flex w-full items-center gap-1.5 py-1 pr-2 text-left font-mono text-[12.5px]',
              selected ? 'bg-accent text-accent-foreground' : 'text-foreground hover:bg-primary/10',
            )}
          >
            <span className="w-2.5 text-[9px] text-muted-foreground">
              {container ? (expanded ? '▾' : '▸') : ''}
            </span>
            <span className="w-4 text-center opacity-85">{nodeGlyph(node.type)}</span>
            <span className="truncate">{node.name}</span>
          </button>
        )}
      </NodeContextMenu>

      {container &&
        expanded &&
        children?.map((child) => (
          <TreeNode key={child.id} node={child} depth={depth + 1} currentNodeId={currentNodeId} />
        ))}
    </div>
  );
}

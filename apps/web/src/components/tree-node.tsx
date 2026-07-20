import { useState } from 'react';
import type { Node, NodeId } from '@super-signal/core';
import { cn } from '@super-signal/ui/lib/utils';
import { useChildren } from '../hooks/use-children';
import { useUiStore } from '../stores/ui-store';
import { isContainer, nodeGlyph } from '../lib/node-display';

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
  const selectNode = useUiStore((state) => state.selectNode);
  const { data: children } = useChildren(node.id, container && expanded);

  const selected = node.id === currentNodeId;

  const handleClick = () => {
    selectNode(node.id);
    if (container) setExpanded((value) => !value);
  };

  return (
    <div>
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

      {container &&
        expanded &&
        children?.map((child) => (
          <TreeNode key={child.id} node={child} depth={depth + 1} currentNodeId={currentNodeId} />
        ))}
    </div>
  );
}

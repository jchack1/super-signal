import { useState } from 'react';
import type { FolderNode, Node, NodeId, ServerNode } from '@super-signal/core';
import { cn } from '@super-signal/ui/lib/utils';
import { useChildren } from '../hooks/use-children';
import { useNavigateToNode } from '../hooks/use-navigate-to-node';
import { useReorderNode } from '../hooks/use-reorder-node';
import { positionBetween } from '../lib/tree-position';
import { isContainer, nodeGlyph } from '../lib/node-display';

// Which half of a row a drag is hovering over — determines whether the dragged
// node lands before or after that row once dropped.
type DropEdge = 'before' | 'after';

// The center-pane view for a container Node (server or folder): its contents,
// ordered by `position`. Click a row to `cd` into it; drag a row to reorder it
// among its siblings. This is the filesystem made visible in the main pane —
// the same children the tree shows, but as the primary content of "where you are".
export function FolderView({ node }: { node: FolderNode | ServerNode }) {
  const { data: children, isLoading } = useChildren(node.id);
  const navigateToNode = useNavigateToNode();
  const { mutate: reorder } = useReorderNode(node.id);

  const [draggedId, setDraggedId] = useState<NodeId | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: NodeId; edge: DropEdge } | null>(null);

  // Computes a new position for the dragged node from its drop target's current
  // neighbors (excluding the dragged node itself, so dropping it right back
  // next to where it started still resolves against its real neighbors) and
  // hands it to the reorder mutation. The `finally` matters: `positionBetween`
  // can throw (e.g. if two siblings somehow share a position), and without it
  // a throw would skip clearing drag state, leaving the row stuck dimmed.
  const handleDrop = (target: Node) => {
    try {
      if (draggedId && children && draggedId !== target.id) {
        const others = children.filter((child) => child.id !== draggedId);
        const index = others.findIndex((child) => child.id === target.id);
        const edge = dropTarget?.edge ?? 'before';
        if (index !== -1) {
          const before = edge === 'before' ? others[index - 1]?.position : others[index]?.position;
          const after = edge === 'before' ? others[index]?.position : others[index + 1]?.position;
          reorder({ nodeId: draggedId, position: positionBetween(before, after) });
        }
      }
    } finally {
      setDraggedId(null);
      setDropTarget(null);
    }
  };

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-card">
      <header className="flex items-baseline gap-2 border-b border-bevel-lo px-4 py-2.5">
        <div className="font-mono text-sm text-primary">
          {nodeGlyph(node.type)} {node.name}
        </div>
        {children && children.length > 0 && (
          <span className="font-mono text-[11px] text-muted-foreground">
            {children.length} {children.length === 1 ? 'item' : 'items'}
          </span>
        )}
      </header>

      <div className="flex-1 overflow-auto py-1">
        {isLoading ? (
          <p className="px-4 py-3 text-sm text-muted-foreground">Loading…</p>
        ) : children && children.length > 0 ? (
          children.map((child) => (
            <div
              key={child.id}
              draggable
              onDragStart={(event) => {
                // Firefox requires data on the drag event to start a native
                // HTML5 drag at all; the value itself is never read back
                // (the drop target is tracked in React state instead).
                event.dataTransfer.setData('text/plain', child.id);
                setDraggedId(child.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                const rect = event.currentTarget.getBoundingClientRect();
                const edge: DropEdge = event.clientY - rect.top < rect.height / 2 ? 'before' : 'after';
                setDropTarget({ id: child.id, edge });
              }}
              onDrop={(event) => {
                event.preventDefault();
                handleDrop(child);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDropTarget(null);
              }}
              className={cn(
                'border-y-2 border-transparent',
                dropTarget && dropTarget.id === child.id && dropTarget.edge === 'before' && 'border-t-primary',
                dropTarget && dropTarget.id === child.id && dropTarget.edge === 'after' && 'border-b-primary',
              )}
            >
              <button
                type="button"
                onClick={() => navigateToNode(child.id)}
                className={cn(
                  'flex w-full cursor-grab items-center gap-2.5 px-4 py-1.5 text-left font-mono text-[13px] text-foreground hover:bg-primary/10 active:cursor-grabbing',
                  draggedId === child.id && 'opacity-40',
                )}
              >
                <span className="w-4 text-center opacity-85">{nodeGlyph(child.type)}</span>
                <span className="truncate">{child.name}</span>
                <span className="ml-auto pl-3 text-[11px] text-muted-foreground/70">
                  {isContainer(child) ? child.type : child.type.replace('-', ' ')}
                </span>
              </button>
            </div>
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-muted-foreground">This folder is empty.</p>
        )}
      </div>
    </section>
  );
}

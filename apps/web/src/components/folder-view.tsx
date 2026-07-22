import type { FolderNode, ServerNode } from '@super-signal/core';
import { useChildren } from '../hooks/use-children';
import { useNavigateToNode } from '../hooks/use-navigate-to-node';
import { isContainer, nodeGlyph } from '../lib/node-display';

// The center-pane view for a container Node (server or folder): its contents,
// ordered by `position`. Click a row to `cd` into it. This is the filesystem made
// visible in the main pane — the same children the tree shows, but as the primary
// content of "where you are".
export function FolderView({ node }: { node: FolderNode | ServerNode }) {
  const { data: children, isLoading } = useChildren(node.id);
  const navigateToNode = useNavigateToNode();

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
            <button
              key={child.id}
              type="button"
              onClick={() => navigateToNode(child.id)}
              className="flex w-full items-center gap-2.5 px-4 py-1.5 text-left font-mono text-[13px] text-foreground hover:bg-primary/10"
            >
              <span className="w-4 text-center opacity-85">{nodeGlyph(child.type)}</span>
              <span className="truncate">{child.name}</span>
              <span className="ml-auto pl-3 text-[11px] text-muted-foreground/70">
                {isContainer(child) ? child.type : child.type.replace('-', ' ')}
              </span>
            </button>
          ))
        ) : (
          <p className="px-4 py-3 text-sm text-muted-foreground">This folder is empty.</p>
        )}
      </div>
    </section>
  );
}

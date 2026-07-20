import type { NodeId } from '@super-signal/core';
import { NODE_SERVER } from '@super-signal/core/adapters/mock';
import { useNode } from '../hooks/use-node';
import { useChildren } from '../hooks/use-children';
import { useUiStore } from '../stores/ui-store';
import { nodeGlyph } from '../lib/node-display';
import { TreeNode } from './tree-node';

// The filesystem tree. The root community is the header (click it to select the
// root); its children render below. `NODE_SERVER` is a mock seed id used only
// here at the app boundary; against a real backend the root(s) come from the
// user's memberships instead.
export function TreeSidebar({ currentNodeId }: { currentNodeId: NodeId }) {
  const { data: root } = useNode(NODE_SERVER);
  const { data: children } = useChildren(NODE_SERVER);
  const selectNode = useUiStore((state) => state.selectNode);

  return (
    <nav className="hidden flex-col gap-0.5 overflow-auto border-r border-bevel-lo bg-secondary p-2.5 md:flex">
      <button
        type="button"
        onClick={() => root && selectNode(root.id)}
        className="flex items-center gap-1.5 px-1 pb-2 text-left font-mono text-xs font-semibold text-foreground hover:text-primary"
      >
        <span aria-hidden="true">{root ? nodeGlyph(root.type) : ''}</span>
        <span className="truncate">{root?.name ?? '…'}</span>
      </button>

      {children?.map((child) => (
        <TreeNode key={child.id} node={child} depth={0} currentNodeId={currentNodeId} />
      ))}
    </nav>
  );
}

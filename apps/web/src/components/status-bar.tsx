import type { NodeId } from '@super-signal/core';
import { useNodePath } from '../hooks/use-node-path';
import { nodeGlyph } from '../lib/node-display';

// The bottom status bar: the current path as text, plus a "live" indicator. The
// data source is called out honestly while we're on the mock layer.
export function StatusBar({ currentNodeId }: { currentNodeId: NodeId }) {
  const { path } = useNodePath(currentNodeId);

  const pathString =
    '/' +
    path
      .map((node) =>
        node.type === 'chat-channel' || node.type === 'voice-channel'
          ? `${nodeGlyph(node.type)}${node.name}`
          : node.name,
      )
      .join('/');

  return (
    <div className="flex items-center gap-3.5 border-t border-bevel-lo bg-secondary px-3 py-1 font-mono text-[11px] text-muted-foreground">
      <span className="bg-card px-2 py-0.5">{pathString}</span>
      <span className="ml-auto flex items-center gap-2">
        <span>mock data layer</span>
        <span className="size-2 rounded-full bg-primary" />
      </span>
    </div>
  );
}

import type { NodeId } from '@super-signal/core';
import { useNode } from '../hooks/use-node';
import { ChannelView } from './channel-view';
import { NodePlaceholder } from './node-placeholder';

// The center pane. Picks the right view for whatever Node is current: chat for a
// chat channel, a placeholder for everything else (for now).
export function MainView({ currentNodeId }: { currentNodeId: NodeId }) {
  const { data: node, isLoading } = useNode(currentNodeId);

  if (isLoading) {
    return (
      <section className="flex flex-1 items-center justify-center bg-card text-sm text-muted-foreground">
        Loading…
      </section>
    );
  }

  if (!node) {
    return (
      <section className="flex flex-1 flex-col items-center justify-center gap-1 bg-card p-8 text-center">
        <div className="font-mono text-sm text-primary">Node not found</div>
        <p className="max-w-sm text-sm text-muted-foreground">
          Nothing lives at this address. It may have been moved or removed — pick a destination
          from the tree.
        </p>
      </section>
    );
  }

  return node.type === 'chat-channel' ? (
    <ChannelView channel={node} />
  ) : (
    <NodePlaceholder node={node} />
  );
}

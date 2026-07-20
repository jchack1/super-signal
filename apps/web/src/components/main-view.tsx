import type { NodeId } from '@super-signal/core';
import { useNode } from '../hooks/use-node';
import { ChannelView } from './channel-view';
import { NodePlaceholder } from './node-placeholder';

// The center pane. Picks the right view for whatever Node is current: chat for a
// chat channel, a placeholder for everything else (for now).
export function MainView({ currentNodeId }: { currentNodeId: NodeId }) {
  const { data: node, isLoading } = useNode(currentNodeId);

  if (isLoading || !node) {
    return (
      <section className="flex flex-1 items-center justify-center bg-card text-sm text-muted-foreground">
        Loading…
      </section>
    );
  }

  return node.type === 'chat-channel' ? (
    <ChannelView channel={node} />
  ) : (
    <NodePlaceholder node={node} />
  );
}

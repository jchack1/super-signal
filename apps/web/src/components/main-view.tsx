import type { NodeId } from '@super-signal/core';
import { useNode } from '../hooks/use-node';
import { useNodePermissions } from '../hooks/use-node-permissions';
import { ChannelView } from './channel-view';
import { FolderView } from './folder-view';
import { NodePlaceholder } from './node-placeholder';

// The center pane. Picks the right view for whatever Node is current: chat for a
// chat channel, a folder listing for a container (server/folder), a placeholder
// for the kinds whose view isn't built yet (voice, document).
export function MainView({ currentNodeId }: { currentNodeId: NodeId }) {
  const { data: node, isLoading } = useNode(currentNodeId);
  const { data: perms, isLoading: permsLoading } = useNodePermissions(currentNodeId);

  if (isLoading || permsLoading) {
    return (
      <section className="flex flex-1 items-center justify-center bg-card text-sm text-muted-foreground">
        Loading…
      </section>
    );
  }

  // A node the actor can't `view` reads exactly like a missing one — direct
  // navigation to a hidden node's URL shouldn't reveal anything the tree/find
  // filtering already hides (Discord-style: same "unknown channel" treatment
  // whether it never existed or you just lost access).
  if (!node || !perms?.has('view')) {
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

  switch (node.type) {
    case 'chat-channel':
      return <ChannelView channel={node} />;
    case 'server':
    case 'folder':
      return <FolderView node={node} />;
    default:
      return <NodePlaceholder node={node} />;
  }
}

import type { AvatarId, NodeId } from '@super-signal/core';
import { Avatar } from '@super-signal/ui/components/avatar';
import { useMessages } from '../hooks/use-messages';
import { useAvatar } from '../hooks/use-avatar';

// Who's in this channel. Membership isn't modeled yet, so for now we derive the
// participants from the channel's message authors — real data, honest scope.
// Presence dots are static until Realtime presence lands.
export function MembersPanel({ channelId }: { channelId: NodeId }) {
  const { data: messages } = useMessages(channelId);
  const avatarIds = [...new Set((messages ?? []).map((message) => message.authorAvatarId))];

  return (
    <aside className="hidden flex-col gap-1 overflow-auto border-l border-bevel-lo bg-secondary p-2.5 md:flex">
      <h4 className="px-1 pb-2 font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
        In this channel
      </h4>
      {avatarIds.length > 0 ? (
        avatarIds.map((id) => <MemberRow key={id} avatarId={id} />)
      ) : (
        <p className="px-1 text-xs text-muted-foreground">No one here yet.</p>
      )}
    </aside>
  );
}

function MemberRow({ avatarId }: { avatarId: AvatarId }) {
  const { data: avatar } = useAvatar(avatarId);
  const name = avatar?.displayName ?? '…';

  return (
    <div className="flex items-center gap-2 px-1 py-1 text-sm">
      <Avatar name={name} size="sm" />
      <span className="truncate">{name}</span>
      <span className="ml-auto size-2 rounded-full bg-primary" />
    </div>
  );
}

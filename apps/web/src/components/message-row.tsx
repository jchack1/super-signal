import type { ReactNode } from 'react';
import type { Message } from '@super-signal/core';
import { Avatar } from '@super-signal/ui/components/avatar';
import { cn } from '@super-signal/ui/lib/utils';
import { useAvatar } from '../hooks/use-avatar';
import { formatTime } from '../lib/format';
import { CURRENT_AVATAR_ID } from '../lib/session';

// Highlight @mentions (blue) and #tags (amber) inline, matching the design tokens.
// Splitting on whitespace keeps the separators so spacing is preserved.
function renderBody(body: string): ReactNode[] {
  return body.split(/(\s+)/).map((token, index) => {
    if (token.startsWith('@')) {
      return (
        <span key={index} className="rounded-xs bg-mention/15 px-1 text-mention">
          {token}
        </span>
      );
    }
    if (token.startsWith('#')) {
      return (
        <span key={index} className="text-tag">
          {token}
        </span>
      );
    }
    return <span key={index}>{token}</span>;
  });
}

export function MessageRow({ message }: { message: Message }) {
  const { data: avatar } = useAvatar(message.authorAvatarId);
  const name = avatar?.displayName ?? '…';
  // Channels stay a uniform left-aligned list (they scale past two people); your
  // own messages just get a subtle tint + a "you" tag. Right/left bubbles are
  // reserved for 1:1 DMs.
  const isMine = message.authorAvatarId === CURRENT_AVATAR_ID;

  return (
    <div className={cn('-mx-2 flex gap-3 rounded-sm px-2 py-1.5', isMine && 'bg-primary/5')}>
      <Avatar name={name} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{name}</span>
          {isMine && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-primary/70">
              you
            </span>
          )}
          <span className="font-mono text-[11px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div className="text-sm">{renderBody(message.body)}</div>
      </div>
    </div>
  );
}

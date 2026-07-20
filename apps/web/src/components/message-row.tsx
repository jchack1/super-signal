import type { ReactNode } from 'react';
import type { Message } from '@super-signal/core';
import { Avatar } from '@super-signal/ui/components/avatar';
import { useAvatar } from '../hooks/use-avatar';
import { formatTime } from '../lib/format';

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

  return (
    <div className="flex gap-3 py-1.5">
      <Avatar name={name} />
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{name}</span>
          <span className="font-mono text-[11px] text-muted-foreground">
            {formatTime(message.createdAt)}
          </span>
        </div>
        <div className="text-sm">{renderBody(message.body)}</div>
      </div>
    </div>
  );
}

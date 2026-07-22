import type { ChatChannelNode } from '@super-signal/core';
import { useMessages } from '../hooks/use-messages';
import { MessageRow } from './message-row';

// A chat channel: header (name + topic) and the message history. Posting happens
// through the app-wide command line (@ / # at the bottom prompt), so there's no
// per-channel composer anymore.
export function ChannelView({ channel }: { channel: ChatChannelNode }) {
  const { data: messages, isLoading } = useMessages(channel.id);

  return (
    <section className="flex min-w-0 flex-1 flex-col bg-card">
      <header className="border-b border-bevel-lo px-4 py-2.5">
        <div className="font-mono text-sm text-primary">#{channel.name}</div>
        {channel.topic && <div className="text-xs text-muted-foreground">{channel.topic}</div>}
      </header>

      <div className="flex-1 overflow-auto px-4 py-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : messages && messages.length > 0 ? (
          messages.map((message) => <MessageRow key={message.id} message={message} />)
        ) : (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        )}
      </div>
    </section>
  );
}

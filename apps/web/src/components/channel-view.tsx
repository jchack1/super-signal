import type { ChatChannelNode } from '@super-signal/core';
import { Panel } from '@super-signal/ui/components/panel';
import { useMessages } from '../hooks/use-messages';
import { MessageRow } from './message-row';

// A chat channel: header (name + topic), the message history, and the composer.
// Read-only for now — posting (with an optimistic update) is the next slice, so
// the input is present but disabled to keep the layout honest.
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

      <div className="border-t border-bevel-lo p-2.5">
        <Panel variant="inset" className="flex items-center bg-card px-3 py-2 opacity-60">
          <input
            disabled
            placeholder={`Message #${channel.name} — posting arrives in the next slice`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </Panel>
      </div>
    </section>
  );
}

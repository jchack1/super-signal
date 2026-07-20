import type { NodeId } from '../domain/ids';
import type { Message, NewMessage } from '../domain/message';

export interface MessageListOptions {
  limit?: number;
  /** Return messages created strictly before this ISO timestamp (for pagination). */
  before?: string;
}

export interface MessageRepository {
  listByChannel(channelId: NodeId, options?: MessageListOptions): Promise<Message[]>;
  create(input: NewMessage): Promise<Message>;
}

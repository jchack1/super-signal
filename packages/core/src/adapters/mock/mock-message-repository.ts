import { asMessageId, type NodeId } from '../../domain/ids';
import type { Message, NewMessage } from '../../domain/message';
import type { MessageListOptions, MessageRepository } from '../../ports/message-repository';

/** An in-memory message stream. */
export class MockMessageRepository implements MessageRepository {
  private readonly messages: Message[];

  constructor(seedMessages: Message[]) {
    this.messages = [...seedMessages];
  }

  async listByChannel(channelId: NodeId, options?: MessageListOptions): Promise<Message[]> {
    let result = this.messages
      .filter((message) => message.channelId === channelId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    // Older-than filter, for paging back through history.
    const before = options?.before;
    if (before) {
      result = result.filter((message) => message.createdAt < before);
    }

    // Keep only the most recent `limit` messages.
    if (options?.limit !== undefined) {
      result = result.slice(-options.limit);
    }

    return result;
  }

  async create(input: NewMessage): Promise<Message> {
    const message: Message = {
      id: asMessageId(crypto.randomUUID()),
      channelId: input.channelId,
      authorAvatarId: input.authorAvatarId,
      body: input.body,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(message);
    return message;
  }
}
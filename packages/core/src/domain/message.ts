import type { AvatarId, MessageId, NodeId } from './ids';

/**
 * A chat message. Deliberately NOT a Node: messages are a high-volume,
 * append-heavy stream, so they live in their own table and *inherit the
 * permissions of the channel Node they belong to* rather than carrying their own.
 */
export interface Message {
  id: MessageId;
  channelId: NodeId;
  authorAvatarId: AvatarId;
  body: string;
  createdAt: string;
}

/** Input to create a message; the repository assigns `id` and `createdAt`. */
export interface NewMessage {
  channelId: NodeId;
  authorAvatarId: AvatarId;
  body: string;
}
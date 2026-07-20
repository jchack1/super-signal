import type { NodeId, UserId } from './ids';
import type { AccessControlEntry } from './permission';

/**
 * The kinds of Node (the spec's "first-class objects"). One `const` tuple → the
 * runtime list plus the `NodeType` union. We start with the types Part 1 needs
 * and add more (spreadsheet, image, …) as they arrive.
 */
export const NODE_TYPES = [
  'folder',
  'server',
  'chat-channel',
  'voice-channel',
  'document',
] as const;
export type NodeType = (typeof NODE_TYPES)[number];

/**
 * The common base every Node shares. Generic over its own `type` so each Node
 * kind carries a *literal* type tag (`'folder'`, `'chat-channel'`, …) — that tag
 * is the discriminant that makes `Node` a type-safe discriminated union.
 */
export interface BaseNode<T extends NodeType = NodeType> {
  id: NodeId;
  type: T;
  name: string;
  /** Parent in the tree. `null` only for a root node. */
  parentId: NodeId | null;
  ownerId: UserId;
  /** Fractional index (LexoRank-style) for ordering among siblings without renumbering. */
  position: string;
  /**
   * When `true`, effective permissions = this node's own ACL *plus* everything
   * inherited from ancestors. When `false`, the node breaks inheritance and
   * stands alone — its ACL is the whole truth (this is how a private channel
   * lives inside a public server).
   */
  inherit: boolean;
  acl: AccessControlEntry[];
  createdAt: string;
  updatedAt: string;
}

// Node kinds. Simple ones are just a `BaseNode` with a fixed tag; richer ones
// extend the base with their own payload fields.
export type FolderNode = BaseNode<'folder'>;
export type ServerNode = BaseNode<'server'>;
export type VoiceChannelNode = BaseNode<'voice-channel'>;

export interface ChatChannelNode extends BaseNode<'chat-channel'> {
  topic?: string;
}

export interface DocumentNode extends BaseNode<'document'> {
  /** Pointer into object storage — the bytes never live in the DB. */
  storageKey: string;
  mime: string;
}

/** The discriminated union over every Node kind, keyed by `type`. */
export type Node =
  | FolderNode
  | ServerNode
  | ChatChannelNode
  | VoiceChannelNode
  | DocumentNode;

/** The fields that may be changed after creation (id and type are immutable). */
export type NodePatch = Partial<
  Pick<BaseNode, 'name' | 'position' | 'parentId' | 'inherit' | 'acl'>
>;
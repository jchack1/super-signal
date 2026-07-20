import { asAvatarId, asMessageId, asNodeId, asRoleId, asUserId } from '../../domain/ids';
import type { Avatar, User } from '../../domain/identity';
import type { Message } from '../../domain/message';
import type { Node } from '../../domain/node';

// A fixed timestamp so the seed data never changes between runs.
const T = '2026-07-19T00:00:00.000Z';

// --- Roles (just ids for now) ---
export const ROLE_MEMBERS = asRoleId('role-members');
export const ROLE_MODERATORS = asRoleId('role-moderators');

// --- Users ---
export const USER_ALICE = asUserId('user-alice'); // owns the server and channels
export const USER_BOB = asUserId('user-bob'); // a regular member
export const USER_CAROL = asUserId('user-carol'); // a moderator

export const users: User[] = [
  { id: USER_ALICE, createdAt: T },
  { id: USER_BOB, createdAt: T },
  { id: USER_CAROL, createdAt: T },
];

// --- Avatars (each user's public face) ---
export const avatars: Avatar[] = [
  { id: asAvatarId('avatar-alice'), userId: USER_ALICE, displayName: 'alice', createdAt: T },
  { id: asAvatarId('avatar-bob'), userId: USER_BOB, displayName: 'bob', createdAt: T },
  { id: asAvatarId('avatar-carol'), userId: USER_CAROL, displayName: 'carol', createdAt: T },
];

// --- Nodes (the tree) ---
export const NODE_SERVER = asNodeId('node-server');
export const NODE_GENERAL = asNodeId('node-general');
export const NODE_MODS = asNodeId('node-mods');

export const nodes: Node[] = [
  // The server. Everyone can see it and read inside it by default.
  {
    id: NODE_SERVER,
    type: 'server',
    name: 'Super Signal',
    parentId: null,
    ownerId: USER_ALICE,
    position: 'a0',
    inherit: true,
    acl: [{ principal: { kind: 'everyone' }, allow: ['view', 'read'] }],
    createdAt: T,
    updatedAt: T,
  },
  // A public channel. It inherits the server's "everyone can read",
  // and adds "everyone can post" on top.
  {
    id: NODE_GENERAL,
    type: 'chat-channel',
    name: 'general',
    parentId: NODE_SERVER,
    ownerId: USER_ALICE,
    position: 'a1',
    inherit: true,
    acl: [{ principal: { kind: 'everyone' }, allow: ['write'] }],
    createdAt: T,
    updatedAt: T,
  },
  // A private channel. It breaks inheritance, so the server's "everyone can read"
  // does NOT reach it. Only moderators can read and post here.
  {
    id: NODE_MODS,
    type: 'chat-channel',
    name: 'mods-only',
    parentId: NODE_SERVER,
    ownerId: USER_ALICE,
    position: 'a2',
    inherit: false,
    acl: [{ principal: { kind: 'role', id: ROLE_MODERATORS }, allow: ['read', 'write'] }],
    createdAt: T,
    updatedAt: T,
  },
];

// --- Messages (a stream attached to the general channel) ---
export const messages: Message[] = [
  {
    id: asMessageId('msg-1'),
    channelId: NODE_GENERAL,
    authorAvatarId: asAvatarId('avatar-alice'),
    body: 'welcome to super signal',
    createdAt: T,
  },
  {
    id: asMessageId('msg-2'),
    channelId: NODE_GENERAL,
    authorAvatarId: asAvatarId('avatar-bob'),
    body: 'glad to be here',
    createdAt: T,
  },
];

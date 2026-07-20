/**
 * Branded (nominal) ID types.
 *
 * At runtime these are just strings. The phantom `__brand` field exists only at
 * compile time and makes each ID type distinct — so the compiler stops you from
 * accidentally passing a `MessageId` where a `NodeId` is expected, even though
 * both are strings underneath. Construct them with the `as*` helpers below,
 * which are used only at boundaries (mock adapter, and later DB reads).
 */
type Brand<T, B extends string> = T & { readonly __brand: B };

export type NodeId = Brand<string, 'NodeId'>;
export type UserId = Brand<string, 'UserId'>;
export type AvatarId = Brand<string, 'AvatarId'>;
export type RoleId = Brand<string, 'RoleId'>;
export type MessageId = Brand<string, 'MessageId'>;

export const asNodeId = (value: string): NodeId => value as NodeId;
export const asUserId = (value: string): UserId => value as UserId;
export const asAvatarId = (value: string): AvatarId => value as AvatarId;
export const asRoleId = (value: string): RoleId => value as RoleId;
export const asMessageId = (value: string): MessageId => value as MessageId;
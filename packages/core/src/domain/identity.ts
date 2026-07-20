import type { AvatarId, RoleId, UserId } from './ids';

/**
 * The account / login — the real identity boundary, never shown to others.
 * No email or phone by design (anonymity). Auth is handled by the provider later.
 */
export interface User {
  id: UserId;
  createdAt: string;
}

/**
 * A pseudonymous persona belonging to a User. One User has many; separate
 * Avatars of the same User are unlinkable to other people (a core privacy
 * feature). This is the face others see. An Avatar is a sub-identity, not a Node.
 */
export interface Avatar {
  id: AvatarId;
  userId: UserId;
  displayName: string;
  createdAt: string;
}

/**
 * Who is performing an action, used by permission checks. Carries the roles the
 * acting user holds, since roles are one way permissions are granted.
 */
export interface Actor {
  userId: UserId;
  avatarId: AvatarId;
  roleIds: RoleId[];
}
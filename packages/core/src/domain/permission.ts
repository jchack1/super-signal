import type { RoleId, UserId } from './ids';

/**
 * Our plain-language permission verbs (the generalized, de-cryptified version of
 * Linux's rwx). Declared as a `const` tuple so we get both the runtime list
 * (`PERMISSIONS`) and the union type (`Permission`) from one source of truth.
 */
export const PERMISSIONS = ['view', 'read', 'write', 'manage'] as const;
export type Permission = (typeof PERMISSIONS)[number];

/**
 * Who a grant is given to. A discriminated union on `kind`:
 * - a specific user, a role (e.g. "moderators"), or literally everyone.
 */
export type Principal =
  | { kind: 'user'; id: UserId }
  | { kind: 'role'; id: RoleId }
  | { kind: 'everyone' };

/** One entry in a Node's access-control list: a principal and the verbs they may perform. */
export interface AccessControlEntry {
  principal: Principal;
  allow: Permission[];
}
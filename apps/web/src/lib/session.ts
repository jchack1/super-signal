import { asAvatarId, asUserId, type Actor, type AvatarId, type UserId } from '@super-signal/core';

// The acting persona ("you"). A stand-in until anonymous auth + avatar selection
// land (Phase 2 / the identity slice). The value matches a seed avatar in the
// mock data layer; it lives here at the app boundary so there's a single place to
// swap when real identity arrives.
export const CURRENT_AVATAR_ID: AvatarId = asAvatarId('avatar-bob');

// The User behind the current avatar (matches seed user-bob). Needed for
// ownerId on nodes created via the command line.
export const CURRENT_USER_ID: UserId = asUserId('user-bob');

// The full Actor shape PermissionService checks need. No roles yet — bob is a
// plain member in the seed data.
export const CURRENT_ACTOR: Actor = {
  userId: CURRENT_USER_ID,
  avatarId: CURRENT_AVATAR_ID,
  roleIds: [],
};

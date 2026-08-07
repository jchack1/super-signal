import { asAvatarId, asUserId, type AvatarId, type UserId } from '@super-signal/core';

// The mock user "logged in" for this session, and which of their avatars is
// selected by default. A stand-in until real anonymous auth lands (Phase 2);
// the live, switchable version of this lives in contexts/session-context.tsx
// — these are just its starting values, kept here at the app boundary so
// there's a single place to swap when real identity arrives.
export const CURRENT_AVATAR_ID: AvatarId = asAvatarId('avatar-bob');

// The User behind the default avatar (matches seed user-bob). Needed for
// ownerId on nodes created via the command line.
export const CURRENT_USER_ID: UserId = asUserId('user-bob');

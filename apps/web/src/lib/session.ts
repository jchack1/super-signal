import { asAvatarId, type AvatarId } from '@super-signal/core';

// The acting persona ("you"). A stand-in until anonymous auth + avatar selection
// land (Phase 2 / the identity slice). The value matches a seed avatar in the
// mock data layer; it lives here at the app boundary so there's a single place to
// swap when real identity arrives.
export const CURRENT_AVATAR_ID: AvatarId = asAvatarId('avatar-bob');

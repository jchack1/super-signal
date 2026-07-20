import { describe, expect, it } from 'vitest';
import {
  createMockRepositories,
  NODE_GENERAL,
  NODE_MODS,
  ROLE_MODERATORS,
  USER_ALICE,
  USER_BOB,
  USER_CAROL,
} from '../adapters/mock';
import { asAvatarId } from '../domain/ids';
import type { Actor } from '../domain/identity';
import { PermissionService } from './permission-service';

function makeService() {
  const { nodes } = createMockRepositories();
  return new PermissionService(nodes);
}

// bob is a plain member (no roles); carol is a moderator.
const bob: Actor = { userId: USER_BOB, avatarId: asAvatarId('avatar-bob'), roleIds: [] };
const carol: Actor = {
  userId: USER_CAROL,
  avatarId: asAvatarId('avatar-carol'),
  roleIds: [ROLE_MODERATORS],
};

describe('PermissionService', () => {
  it('lets everyone read and post in the public channel (read inherited from the server)', async () => {
    const service = makeService();
    expect(await service.can(bob, NODE_GENERAL, 'read')).toBe(true);
    expect(await service.can(bob, NODE_GENERAL, 'write')).toBe(true);
  });

  it('hides the private channel from a non-moderator (inheritance is broken)', async () => {
    const service = makeService();
    expect(await service.can(bob, NODE_MODS, 'view')).toBe(false);
    expect(await service.can(bob, NODE_MODS, 'read')).toBe(false);
  });

  it('lets a moderator read and post in the private channel', async () => {
    const service = makeService();
    expect(await service.can(carol, NODE_MODS, 'read')).toBe(true);
    expect(await service.can(carol, NODE_MODS, 'write')).toBe(true);
  });

  it('gives the owner full control, even on a channel they are not otherwise listed in', async () => {
    const service = makeService();
    const alice: Actor = {
      userId: USER_ALICE,
      avatarId: asAvatarId('avatar-alice'),
      roleIds: [],
    };
    expect(await service.can(alice, NODE_MODS, 'manage')).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { asAvatarId, asNodeId, type Actor } from '@super-signal/core';
import {
  createMockRepositories,
  NODE_ARCHIVE,
  NODE_FRONTEND,
  NODE_GENERAL,
  NODE_MODS,
  NODE_OLD_GENERAL,
  NODE_PROJECTS,
  NODE_SERVER,
  ROLE_MODERATORS,
  USER_ALICE,
  USER_BOB,
  USER_CAROL,
} from '@super-signal/core/adapters/mock';
import { PermissionService } from '@super-signal/core/services';
import { executeCommand } from './execute';

// bob is a plain member (owns nothing, but has an explicit `manage` grant on
// NODE_PROJECTS in the seed); alice owns everything else in the seed tree;
// carol is a moderator (can see/use the private `mods-only` channel).
const bob: Actor = { userId: USER_BOB, avatarId: asAvatarId('avatar-bob'), roleIds: [] };
const alice: Actor = { userId: USER_ALICE, avatarId: asAvatarId('avatar-alice'), roleIds: [] };
const carol: Actor = {
  userId: USER_CAROL,
  avatarId: asAvatarId('avatar-carol'),
  roleIds: [ROLE_MODERATORS],
};

function ctx(currentNodeId = NODE_SERVER, actor: Actor = bob) {
  const { nodes } = createMockRepositories();
  return { repo: nodes, currentNodeId, permissions: new PermissionService(nodes), actor };
}

describe('executeCommand', () => {
  it('ls lists the children of the current directory, hiding what the actor cannot view', async () => {
    const result = await executeCommand({ kind: 'ls' }, ctx(NODE_SERVER));
    expect(result.kind).toBe('listing');
    if (result.kind !== 'listing') return;
    // "mods-only" is excluded for bob (a plain member, no roles) — it's
    // private and breaks inheritance, so he can't even view it.
    expect(result.nodes.map((n) => n.name)).toEqual(['general', 'projects']);
  });

  it('ls includes a private node for an actor who can view it (a moderator)', async () => {
    const result = await executeCommand({ kind: 'ls' }, ctx(NODE_SERVER, carol));
    expect(result.kind).toBe('listing');
    if (result.kind !== 'listing') return;
    expect(result.nodes.map((n) => n.name)).toContain('mods-only');
  });

  it('find matches nodes by name across the whole tree', async () => {
    const result = await executeCommand({ kind: 'find', query: 'gen' }, ctx(NODE_FRONTEND));
    expect(result.kind).toBe('matches');
    if (result.kind !== 'matches') return;
    const names = result.matches.map((m) => m.node.name);
    expect(names).toContain('general');
    expect(names).toContain('old-general');
  });

  it('find returns no matches when nothing fits', async () => {
    const result = await executeCommand({ kind: 'find', query: 'zzz' }, ctx());
    expect(result.kind === 'matches' && result.matches).toHaveLength(0);
  });

  it('find hides a private node (and would hide its subtree) from an actor who cannot view it', async () => {
    const asBob = await executeCommand({ kind: 'find', query: 'mods' }, ctx(NODE_SERVER, bob));
    expect(asBob.kind === 'matches' && asBob.matches).toHaveLength(0);

    const asCarol = await executeCommand({ kind: 'find', query: 'mods' }, ctx(NODE_SERVER, carol));
    expect(asCarol.kind === 'matches' && asCarol.matches.map((m) => m.node.id)).toEqual([NODE_MODS]);
  });

  it('cd treats a node the actor cannot view as not found, not permission-denied', async () => {
    const result = await executeCommand({ kind: 'cd', path: 'mods-only' }, ctx(NODE_SERVER, bob));
    expect(result.kind).toBe('error');
    expect(result.kind === 'error' && result.message).toContain('not found');
  });

  it('mv moves a node into a folder and reports both affected parents', async () => {
    const c = ctx(NODE_SERVER);
    const result = await executeCommand(
      { kind: 'mv', src: 'projects/frontend', dest: 'projects/archive' },
      c,
    );
    expect(result.kind).toBe('info');
    if (result.kind === 'info') {
      expect(result.invalidateParentIds).toEqual(
        expect.arrayContaining([NODE_ARCHIVE, NODE_PROJECTS]),
      );
      expect(result.renamedNodeId).toBeUndefined();
    }
    const archiveChildren = await c.repo.getChildren(NODE_ARCHIVE);
    expect(archiveChildren.map((n) => n.name)).toContain('frontend');
    const projectChildren = await c.repo.getChildren(NODE_PROJECTS);
    expect(projectChildren.map((n) => n.name)).not.toContain('frontend');
  });

  it('mv refuses to move a folder into its own subtree', async () => {
    const result = await executeCommand(
      { kind: 'mv', src: 'projects', dest: 'projects/archive' },
      ctx(NODE_SERVER),
    );
    expect(result.kind).toBe('error');
  });

  it('mv refuses a non-folder destination', async () => {
    const result = await executeCommand(
      { kind: 'mv', src: 'projects/archive', dest: 'general' },
      ctx(NODE_SERVER),
    );
    expect(result.kind).toBe('error');
  });

  it('mv renames in place when the destination path does not already exist', async () => {
    const c = ctx(NODE_SERVER);
    const result = await executeCommand(
      { kind: 'mv', src: 'projects/frontend', dest: 'projects/frontend-v2' },
      c,
    );
    expect(result.kind).toBe('info');
    if (result.kind === 'info') expect(result.renamedNodeId).toBe(NODE_FRONTEND);
    const renamed = await c.repo.getNode(NODE_FRONTEND);
    expect(renamed?.name).toBe('frontend-v2');
    expect(renamed?.parentId).toBe(NODE_PROJECTS); // stayed in the same folder
  });

  it('mv refuses when the actor lacks manage on the source', async () => {
    const result = await executeCommand(
      { kind: 'mv', src: 'general', dest: 'projects' },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it('mv refuses a cross-folder move when the actor lacks write on the destination', async () => {
    // bob manages "frontend" (inherited from his grant on "projects"), but has
    // no write on the root — moving it there should be refused.
    const result = await executeCommand(
      { kind: 'mv', src: 'projects/frontend', dest: '/' },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it('mv-as-rename only requires manage on the source, not write on the parent', async () => {
    // A synthetic scenario the seed doesn't cover: a folder bob has no grant
    // on at all, containing a node he has a personal `manage` grant on.
    const c = ctx(NODE_SERVER, bob);
    const parentId = asNodeId('test-parent');
    const childId = asNodeId('test-child');
    const now = new Date().toISOString();
    await c.repo.create({
      id: parentId,
      type: 'folder',
      name: 'walled-off',
      parentId: NODE_SERVER,
      ownerId: USER_ALICE,
      position: 'zz',
      inherit: true,
      acl: [], // no grant to bob — only the server's inherited everyone:[view,read]
      createdAt: now,
      updatedAt: now,
    });
    await c.repo.create({
      id: childId,
      type: 'chat-channel',
      name: 'old-name',
      parentId,
      ownerId: USER_ALICE,
      position: 'a0',
      inherit: true,
      acl: [{ principal: { kind: 'user', id: USER_BOB }, allow: ['manage'] }],
      createdAt: now,
      updatedAt: now,
    });

    const result = await executeCommand(
      { kind: 'mv', src: '/walled-off/old-name', dest: '/walled-off/new-name' },
      c,
    );
    expect(result.kind).toBe('info');
    expect((await c.repo.getNode(childId))?.name).toBe('new-name');
  });

  it('mv moves and renames in one step when the destination is a new name in another folder', async () => {
    const c = ctx(NODE_SERVER);
    const result = await executeCommand(
      { kind: 'mv', src: 'projects/frontend', dest: 'projects/archive/frontend-old' },
      c,
    );
    expect(result.kind).toBe('info');
    if (result.kind === 'info') {
      expect(result.renamedNodeId).toBe(NODE_FRONTEND);
      expect(result.invalidateParentIds).toEqual(
        expect.arrayContaining([NODE_ARCHIVE, NODE_PROJECTS]),
      );
    }
    const moved = await c.repo.getNode(NODE_FRONTEND);
    expect(moved?.name).toBe('frontend-old');
    expect(moved?.parentId).toBe(NODE_ARCHIVE);
  });

  it('cp refuses when the actor lacks read on the source', async () => {
    const result = await executeCommand(
      { kind: 'cp', src: 'mods-only', dest: 'projects' },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it('cp refuses when the actor lacks write on the destination', async () => {
    // bob can read "general" (open to everyone) but has no write on the root.
    const result = await executeCommand(
      { kind: 'cp', src: 'general', dest: '/' },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it('cp deep-copies a subtree with fresh ids and remapped parents', async () => {
    const c = ctx(NODE_SERVER, alice); // alice owns the root; bob has no write there
    const result = await executeCommand({ kind: 'cp', src: 'projects/archive', dest: '/' }, c);
    expect(result.kind).toBe('info');

    const copy = (await c.repo.getChildren(NODE_SERVER)).find((n) => n.name === 'archive');
    expect(copy).toBeDefined();
    expect(copy?.id).not.toBe(NODE_ARCHIVE);

    const copiedChildren = await c.repo.getChildren(copy!.id);
    expect(copiedChildren.map((n) => n.name)).toContain('old-general');
    expect(copiedChildren[0]?.id).not.toBe(NODE_OLD_GENERAL);

    // The original is untouched.
    expect((await c.repo.getChildren(NODE_ARCHIVE)).map((n) => n.name)).toEqual(['old-general']);
  });

  it('create adds a node of the given type under the current directory', async () => {
    const c = ctx(NODE_PROJECTS);
    const result = await executeCommand({ kind: 'create', type: 'chat-channel', name: 'planning' }, c);
    expect(result.kind).toBe('info');
    if (result.kind === 'info') {
      expect(result.invalidateParentIds).toEqual([NODE_PROJECTS]);
    }
    const children = await c.repo.getChildren(NODE_PROJECTS);
    const created = children.find((n) => n.name === 'planning');
    expect(created?.type).toBe('chat-channel');
    expect(created?.parentId).toBe(NODE_PROJECTS);
  });

  it('create refuses when the actor lacks write on the parent', async () => {
    // bob has no write on the root (only the inherited everyone:[view,read]).
    const result = await executeCommand(
      { kind: 'create', type: 'folder', name: 'nope' },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it('create refuses to create inside a non-container node', async () => {
    const result = await executeCommand(
      { kind: 'create', type: 'folder', name: 'nope' },
      ctx(NODE_GENERAL),
    );
    expect(result.kind).toBe('error');
  });

  it('rename changes a node\'s name in place, keeping its parent', async () => {
    const c = ctx(NODE_SERVER);
    const result = await executeCommand(
      { kind: 'rename', path: 'projects/frontend', newName: 'frontend-v2' },
      c,
    );
    expect(result.kind).toBe('info');
    if (result.kind === 'info') expect(result.renamedNodeId).toBe(NODE_FRONTEND);
    const renamed = await c.repo.getNode(NODE_FRONTEND);
    expect(renamed?.name).toBe('frontend-v2');
    expect(renamed?.parentId).toBe(NODE_PROJECTS);
  });

  it('rename refuses when the actor lacks manage on the target', async () => {
    // "general" is alice-owned with no grant to bob beyond read/write.
    const result = await executeCommand(
      { kind: 'rename', path: 'general', newName: 'general-2' },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it('rename to the same name is a no-op and does not flag a rename', async () => {
    const result = await executeCommand(
      { kind: 'rename', path: 'projects/frontend', newName: 'frontend' },
      ctx(NODE_SERVER),
    );
    expect(result.kind).toBe('info');
    if (result.kind === 'info') expect(result.renamedNodeId).toBeUndefined();
  });

  it('rm asks for confirmation, then deletes a leaf node on a second call', async () => {
    const c = ctx(NODE_SERVER, alice);
    const first = await executeCommand(
      { kind: 'rm', path: 'projects/archive/old-general', recursive: false, confirmed: false },
      c,
    );
    expect(first.kind).toBe('confirm');
    expect(await c.repo.getNode(NODE_OLD_GENERAL)).not.toBeNull();
    if (first.kind !== 'confirm') return;

    const second = await executeCommand(first.command, c);
    expect(second.kind).toBe('info');
    expect(await c.repo.getNode(NODE_OLD_GENERAL)).toBeNull();
  });

  it('rm refuses a non-empty folder without -r', async () => {
    const result = await executeCommand(
      { kind: 'rm', path: 'projects', recursive: false, confirmed: false },
      ctx(NODE_SERVER, alice),
    );
    expect(result.kind).toBe('error');
  });

  it('rm -r deletes a folder and everything inside it, after confirming', async () => {
    const c = ctx(NODE_SERVER, alice);
    const first = await executeCommand(
      { kind: 'rm', path: 'projects', recursive: true, confirmed: false },
      c,
    );
    expect(first.kind).toBe('confirm');
    if (first.kind !== 'confirm') return;
    expect(first.message).toContain('3'); // frontend, archive, old-general

    const second = await executeCommand(first.command, c);
    expect(second.kind).toBe('info');
    expect(await c.repo.getNode(NODE_PROJECTS)).toBeNull();
    expect(await c.repo.getNode(NODE_FRONTEND)).toBeNull();
    expect(await c.repo.getNode(NODE_ARCHIVE)).toBeNull();
    expect(await c.repo.getNode(NODE_OLD_GENERAL)).toBeNull();
  });

  it('rm refuses to delete the root', async () => {
    const result = await executeCommand(
      { kind: 'rm', path: '/', recursive: false, confirmed: false },
      ctx(NODE_SERVER, alice),
    );
    expect(result.kind).toBe('error');
  });

  it('rm refuses when the actor lacks manage permission', async () => {
    const result = await executeCommand(
      { kind: 'rm', path: 'general', recursive: false, confirmed: false },
      ctx(NODE_SERVER, bob),
    );
    expect(result.kind).toBe('error');
  });

  it("rm succeeds for a node the actor has an explicit manage grant on (not just ownership)", async () => {
    const c = ctx(NODE_SERVER, bob);
    const first = await executeCommand(
      { kind: 'rm', path: 'projects', recursive: true, confirmed: false },
      c,
    );
    expect(first.kind).toBe('confirm');
    if (first.kind !== 'confirm') return;

    const second = await executeCommand(first.command, c);
    expect(second.kind).toBe('info');
    expect(await c.repo.getNode(NODE_PROJECTS)).toBeNull();
  });

  it('message posts to the current channel, or errors when there is none', async () => {
    const onChannel = await executeCommand({ kind: 'message', body: '@bob hi' }, ctx(NODE_GENERAL));
    expect(onChannel).toEqual({ kind: 'message', channelId: NODE_GENERAL, body: '@bob hi' });

    const onFolder = await executeCommand({ kind: 'message', body: '@bob hi' }, ctx(NODE_PROJECTS));
    expect(onFolder.kind).toBe('error');
  });

  it('message refuses when the actor lacks write on the channel (a read-only announcements case)', async () => {
    // CONFERS keeps read/write independent specifically to express read-only
    // announcement channels (see permission-service.ts) — this is that case.
    const c = ctx(NODE_SERVER, bob);
    const announcementsId = asNodeId('test-announcements');
    const now = new Date().toISOString();
    await c.repo.create({
      id: announcementsId,
      type: 'chat-channel',
      name: 'announcements',
      parentId: NODE_SERVER,
      ownerId: USER_ALICE,
      position: 'zz',
      inherit: true,
      acl: [{ principal: { kind: 'everyone' }, allow: ['read'] }],
      createdAt: now,
      updatedAt: now,
    });

    const result = await executeCommand(
      { kind: 'message', body: '@bob hi' },
      { ...c, currentNodeId: announcementsId },
    );
    expect(result.kind).toBe('error');
  });
});

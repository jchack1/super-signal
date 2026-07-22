import { describe, expect, it } from 'vitest';
import {
  createMockRepositories,
  NODE_ARCHIVE,
  NODE_FRONTEND,
  NODE_GENERAL,
  NODE_OLD_GENERAL,
  NODE_PROJECTS,
  NODE_SERVER,
} from '@super-signal/core/adapters/mock';
import { executeCommand } from './execute';

function ctx(currentNodeId = NODE_SERVER) {
  return { repo: createMockRepositories().nodes, currentNodeId };
}

describe('executeCommand', () => {
  it('ls lists the children of the current directory', async () => {
    const result = await executeCommand({ kind: 'ls' }, ctx(NODE_SERVER));
    expect(result.kind).toBe('listing');
    if (result.kind !== 'listing') return;
    expect(result.nodes.map((n) => n.name)).toEqual(['general', 'mods-only', 'projects']);
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

  it('cp deep-copies a subtree with fresh ids and remapped parents', async () => {
    const c = ctx(NODE_SERVER);
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

  it('message posts to the current channel, or errors when there is none', async () => {
    const onChannel = await executeCommand({ kind: 'message', body: '@bob hi' }, ctx(NODE_GENERAL));
    expect(onChannel).toEqual({ kind: 'message', channelId: NODE_GENERAL, body: '@bob hi' });

    const onFolder = await executeCommand({ kind: 'message', body: '@bob hi' }, ctx(NODE_PROJECTS));
    expect(onFolder.kind).toBe('error');
  });
});

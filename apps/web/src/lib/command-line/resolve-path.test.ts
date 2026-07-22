import { describe, expect, it } from 'vitest';
import {
  createMockRepositories,
  NODE_FRONTEND,
  NODE_GENERAL,
  NODE_OLD_GENERAL,
  NODE_SERVER,
} from '@super-signal/core/adapters/mock';
import { resolvePath } from './resolve-path';

function reader() {
  return createMockRepositories().nodes;
}

async function expectResolves(path: string, from: typeof NODE_SERVER, to: typeof NODE_SERVER) {
  const result = await resolvePath(path, reader(), from);
  expect(result.ok && result.node.id).toBe(to);
}

describe('resolvePath', () => {
  it('resolves an absolute path that names the root', async () => {
    await expectResolves('/Super Signal/general', NODE_FRONTEND, NODE_GENERAL);
  });

  it('resolves an absolute path leniently when the root name is omitted', async () => {
    await expectResolves('/general', NODE_FRONTEND, NODE_GENERAL);
  });

  it('resolves "/" to the root', async () => {
    await expectResolves('/', NODE_FRONTEND, NODE_SERVER);
  });

  it('resolves a relative path from the current node', async () => {
    await expectResolves('projects/frontend', NODE_SERVER, NODE_FRONTEND);
  });

  it('is case-insensitive on names', async () => {
    await expectResolves('PROJECTS/Frontend', NODE_SERVER, NODE_FRONTEND);
  });

  it('handles . and .. segments', async () => {
    await expectResolves('.', NODE_GENERAL, NODE_GENERAL);
    await expectResolves('..', NODE_GENERAL, NODE_SERVER);
    await expectResolves('../archive/old-general', NODE_FRONTEND, NODE_OLD_GENERAL);
  });

  it('stays at the root when going up past it', async () => {
    await expectResolves('..', NODE_SERVER, NODE_SERVER);
  });

  it('returns an error for a path that does not exist', async () => {
    const result = await resolvePath('projects/nope', reader(), NODE_SERVER);
    expect(result.ok).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';
import {
  createMockRepositories,
  NODE_FRONTEND,
  NODE_GENERAL,
  NODE_SERVER,
} from '@super-signal/core/adapters/mock';
import { buildAbsolutePath } from './absolute-path';
import { resolvePath } from './resolve-path';

describe('buildAbsolutePath', () => {
  it('builds "/" for the root (no ancestors)', async () => {
    const { nodes } = createMockRepositories();
    const root = await nodes.getNode(NODE_SERVER);
    expect(root && buildAbsolutePath(root, [])).toBe('/');
  });

  it('builds a one-level path', async () => {
    const { nodes } = createMockRepositories();
    const node = await nodes.getNode(NODE_GENERAL);
    const ancestors = await nodes.getAncestors(NODE_GENERAL);
    expect(node && buildAbsolutePath(node, ancestors)).toBe('/general');
  });

  it('builds a multi-level path', async () => {
    const { nodes } = createMockRepositories();
    const node = await nodes.getNode(NODE_FRONTEND);
    const ancestors = await nodes.getAncestors(NODE_FRONTEND);
    expect(node && buildAbsolutePath(node, ancestors)).toBe('/projects/frontend');
  });

  it('round-trips through resolvePath back to the same node', async () => {
    const { nodes } = createMockRepositories();
    for (const id of [NODE_SERVER, NODE_GENERAL, NODE_FRONTEND]) {
      const node = await nodes.getNode(id);
      if (!node) throw new Error('seed node missing');
      const ancestors = await nodes.getAncestors(id);
      const path = buildAbsolutePath(node, ancestors);
      // Resolution shouldn't depend on where you start — any valid node works
      // as the `currentNodeId` for an absolute path (see use-node-actions.ts).
      const result = await resolvePath(path, nodes, NODE_FRONTEND);
      expect(result.ok && result.node.id).toBe(id);
    }
  });
});

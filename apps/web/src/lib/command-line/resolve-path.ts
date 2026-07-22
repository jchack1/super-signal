import type { Node } from '@super-signal/core';
import type { TreeReader } from './types';

export type ResolveResult = { ok: true; node: Node } | { ok: false; error: string };

// Finds the tree root by walking up from the current node. getAncestors returns
// [parent, …, root]; if there are none, the current node *is* the root.
async function findRoot(reader: TreeReader, current: Node): Promise<Node> {
  const ancestors = await reader.getAncestors(current.id);
  return ancestors[ancestors.length - 1] ?? current;
}

// Case-insensitive child lookup by name.
async function findChild(reader: TreeReader, parent: Node, name: string): Promise<Node | null> {
  const children = await reader.getChildren(parent.id);
  const lowered = name.toLowerCase();
  return children.find((child) => child.name.toLowerCase() === lowered) ?? null;
}

/**
 * Resolves a path string to a Node, relative to the current node.
 *
 * - Absolute (`/Super Signal/general`) starts at the root. A leading segment that
 *   names the root is consumed, so both `/Super Signal/general` and `/general`
 *   resolve the same way.
 * - Relative (`projects/frontend`) starts at the current node.
 * - `.` stays put; `..` goes to the parent (staying at the root if already there).
 */
export async function resolvePath(
  path: string,
  reader: TreeReader,
  currentNodeId: Node['id'],
): Promise<ResolveResult> {
  const current = await reader.getNode(currentNodeId);
  if (!current) return { ok: false, error: 'current location no longer exists' };

  const isAbsolute = path.startsWith('/');
  const segments = path.split('/').filter((segment) => segment.length > 0);

  let cursor: Node;
  let start = 0;
  if (isAbsolute) {
    cursor = await findRoot(reader, current);
    // A leading segment matching the root's name refers to the root itself.
    if (segments[0]?.toLowerCase() === cursor.name.toLowerCase()) {
      start = 1;
    }
  } else {
    cursor = current;
  }

  for (const segment of segments.slice(start)) {
    if (segment === '.') continue;
    if (segment === '..') {
      if (cursor.parentId === null) continue; // already at the root
      const parent = await reader.getNode(cursor.parentId);
      if (!parent) return { ok: false, error: `path not found: ${path}` };
      cursor = parent;
      continue;
    }
    const child = await findChild(reader, cursor, segment);
    if (!child) return { ok: false, error: `path not found: ${path}` };
    cursor = child;
  }

  return { ok: true, node: cursor };
}

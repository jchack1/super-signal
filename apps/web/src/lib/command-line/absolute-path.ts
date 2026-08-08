import type { Node } from '@super-signal/core';

/**
 * Builds an absolute path string (`/projects/frontend`) for a node, given its
 * ancestors nearest-first (`[parent, …, root]`, the shape `getAncestors`
 * returns). This is `resolvePath`'s absolute branch in reverse: mouse-driven
 * actions (context menu) already hold the target `Node`, not a path the user
 * typed, so this is how they get back onto the same `Command`-and-`path` seam
 * the command line uses instead of duplicating executeCommand's logic.
 *
 * The root's own name is deliberately omitted (matching resolvePath's lenient
 * handling of a root-name-omitted absolute path), so an empty ancestor list —
 * the node *is* the root — correctly yields `/` rather than `/<root name>`.
 */
export function buildAbsolutePath(node: Node, ancestors: Node[]): string {
  if (ancestors.length === 0) return '/'; // no ancestors means `node` is the root itself
  const namesRootToParent = [...ancestors].reverse().map((ancestor) => ancestor.name);
  return `/${[...namesRootToParent.slice(1), node.name].join('/')}`;
}

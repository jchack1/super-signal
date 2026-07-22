import { asNodeId, type Node, type NodeId } from '@super-signal/core';
import { isContainer } from '../node-display';
import { appendPosition } from '../tree-position';
import { resolvePath } from './resolve-path';
import type { Command, CommandResult, ExecuteContext, NodeMatch, TreeReader } from './types';

// Absolute display path (`/Super Signal/projects/frontend`) for a node.
async function displayPath(reader: TreeReader, node: Node): Promise<string> {
  const ancestors = await reader.getAncestors(node.id); // [parent, …, root]
  const names = [...ancestors].reverse().map((n) => n.name);
  names.push(node.name);
  return `/${names.join('/')}`;
}

// Walks the whole tree from its root, collecting nodes whose name contains the
// query (case-insensitive). Client-side for now; at scale `find` becomes a
// repository/SQL search rather than a full walk.
async function searchTree(
  reader: TreeReader,
  currentNodeId: NodeId,
  query: string,
): Promise<NodeMatch[]> {
  const current = await reader.getNode(currentNodeId);
  if (!current) return [];
  const ancestors = await reader.getAncestors(currentNodeId);
  const root = ancestors[ancestors.length - 1] ?? current;

  const lowered = query.toLowerCase();
  const matches: NodeMatch[] = [];

  async function walk(node: Node, prefix: string): Promise<void> {
    const path = `${prefix}/${node.name}`;
    if (node.name.toLowerCase().includes(lowered)) matches.push({ node, path });
    for (const child of await reader.getChildren(node.id)) {
      await walk(child, path);
    }
  }

  await walk(root, '');
  return matches;
}

// True if `nodeId` sits inside `ancestorId`'s subtree (used to reject moving or
// copying a folder into its own descendants).
async function isWithin(reader: TreeReader, nodeId: NodeId, ancestorId: NodeId): Promise<boolean> {
  const ancestors = await reader.getAncestors(nodeId);
  return ancestors.some((ancestor) => ancestor.id === ancestorId);
}

// Deep-copies a subtree under a new parent, assigning fresh ids and remapping
// parents. Child ordering is preserved by reusing each child's own position;
// only the top copy gets a freshly-appended position. Messages are not copied.
async function copySubtree(
  ctx: ExecuteContext,
  source: Node,
  newParentId: NodeId,
  position: string,
): Promise<void> {
  const now = new Date().toISOString();
  const newId = asNodeId(crypto.randomUUID());
  // Spread-then-override across a union needs a cast, same as MockNodeRepository.
  const clone = {
    ...source,
    id: newId,
    parentId: newParentId,
    position,
    createdAt: now,
    updatedAt: now,
  } as Node;
  await ctx.repo.create(clone);

  // Original children are safe to read — the copies live under a different id.
  for (const child of await ctx.repo.getChildren(source.id)) {
    await copySubtree(ctx, child, newId, child.position);
  }
}

const error = (message: string): CommandResult => ({ kind: 'error', message });

/**
 * Runs a parsed command against the data layer and returns a typed result. This
 * layer only touches the repository; anything that needs the router or React
 * Query (navigation, message sending, cache invalidation) is handled by the
 * caller from the returned result.
 */
export async function executeCommand(
  command: Command,
  ctx: ExecuteContext,
): Promise<CommandResult> {
  const { repo, currentNodeId } = ctx;

  switch (command.kind) {
    case 'error':
      return error(command.message);

    case 'cd': {
      const result = await resolvePath(command.path, repo, currentNodeId);
      if (!result.ok) return error(result.error);
      return { kind: 'navigate', nodeId: result.node.id };
    }

    case 'ls': {
      let base: Node | null;
      if (command.path) {
        const result = await resolvePath(command.path, repo, currentNodeId);
        if (!result.ok) return error(result.error);
        base = result.node;
      } else {
        base = await repo.getNode(currentNodeId);
      }
      if (!base) return error('nothing to list here');
      const nodes = await repo.getChildren(base.id);
      const dirPath = await displayPath(repo, base);
      return { kind: 'listing', dirPath, nodes };
    }

    case 'find': {
      const matches = await searchTree(repo, currentNodeId, command.query);
      return { kind: 'matches', query: command.query, matches };
    }

    case 'mv': {
      const src = await resolvePath(command.src, repo, currentNodeId);
      if (!src.ok) return error(`mv: ${src.error}`);
      const dest = await resolvePath(command.dest, repo, currentNodeId);
      if (!dest.ok) return error(`mv: ${dest.error}`);
      if (!isContainer(dest.node)) return error(`mv: ${dest.node.name} is not a folder`);
      if (dest.node.id === src.node.id) return error(`mv: can't move ${src.node.name} into itself`);
      if (await isWithin(repo, dest.node.id, src.node.id)) {
        return error(`mv: can't move ${src.node.name} into its own subtree`);
      }
      if (src.node.parentId === dest.node.id) {
        return { kind: 'info', message: `${src.node.name} is already in ${dest.node.name}`, invalidateParentIds: [] };
      }
      const position = appendPosition(await repo.getChildren(dest.node.id));
      await repo.move(src.node.id, dest.node.id, position);
      const changed = [dest.node.id];
      if (src.node.parentId) changed.push(src.node.parentId);
      return { kind: 'info', message: `Moved ${src.node.name} → ${dest.node.name}`, invalidateParentIds: changed };
    }

    case 'cp': {
      const src = await resolvePath(command.src, repo, currentNodeId);
      if (!src.ok) return error(`cp: ${src.error}`);
      const dest = await resolvePath(command.dest, repo, currentNodeId);
      if (!dest.ok) return error(`cp: ${dest.error}`);
      if (!isContainer(dest.node)) return error(`cp: ${dest.node.name} is not a folder`);
      if (dest.node.id === src.node.id || (await isWithin(repo, dest.node.id, src.node.id))) {
        return error(`cp: can't copy ${src.node.name} into itself`);
      }
      const position = appendPosition(await repo.getChildren(dest.node.id));
      await copySubtree(ctx, src.node, dest.node.id, position);
      return { kind: 'info', message: `Copied ${src.node.name} → ${dest.node.name}`, invalidateParentIds: [dest.node.id] };
    }

    case 'message': {
      const current = await repo.getNode(currentNodeId);
      if (!current || current.type !== 'chat-channel') {
        return error('No channel here to post to — cd into a chat channel first.');
      }
      return { kind: 'message', channelId: current.id, body: command.body };
    }
  }
}

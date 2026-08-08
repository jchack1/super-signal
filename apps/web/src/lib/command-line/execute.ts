import { asNodeId, type Actor, type Node, type NodeId, type UserId } from '@super-signal/core';
import type { PermissionService } from '@super-signal/core/services';
import { isContainer } from '../node-display';
import { appendPosition } from '../tree-position';
import { resolvePath } from './resolve-path';
import type {
  Command,
  CommandResult,
  CreatableNodeType,
  ExecuteContext,
  NodeMatch,
  TreeReader,
} from './types';

// Builds a fresh Node of the given (creatable) type. A switch over the literal
// tag — rather than one object with a cast — keeps each branch checked against
// its own member of the Node union.
function buildNode(
  type: CreatableNodeType,
  name: string,
  parentId: NodeId,
  position: string,
  ownerId: UserId,
): Node {
  const base = {
    id: asNodeId(crypto.randomUUID()),
    name,
    parentId,
    ownerId,
    position,
    inherit: true,
    acl: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  switch (type) {
    case 'folder':
      return { ...base, type: 'folder' };
    case 'server':
      return { ...base, type: 'server' };
    case 'chat-channel':
      return { ...base, type: 'chat-channel' };
    case 'voice-channel':
      return { ...base, type: 'voice-channel' };
  }
}

// Absolute display path (`/Super Signal/projects/frontend`) for a node.
async function displayPath(reader: TreeReader, node: Node): Promise<string> {
  const ancestors = await reader.getAncestors(node.id); // [parent, …, root]
  const names = [...ancestors].reverse().map((n) => n.name);
  names.push(node.name);
  return `/${names.join('/')}`;
}

// Walks the whole tree from its root, collecting nodes whose name contains the
// query (case-insensitive). Client-side for now; at scale `find` becomes a
// repository/SQL search rather than a full walk. Only descends into children
// the actor can `view` — a hidden folder's entire subtree stops being
// searchable, not just the folder itself (Discord-style: pretend it isn't
// there, rather than showing it as a locked result).
async function searchTree(
  reader: TreeReader,
  permissions: PermissionService,
  actor: Actor,
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
    const children = await reader.getChildren(node.id);
    const viewableChildren = await permissions.filterViewable(actor, children);
    for (const child of viewableChildren) {
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

// Splits a path at its last segment: everything before it (the "parent path")
// plus the segment itself. Used when a destination doesn't exist yet, to find
// out what folder it *would* live in and what it would be named — `null` for a
// path with nothing to split (`/` or empty).
function splitLastSegment(path: string): { parentPath: string; name: string } | null {
  const isAbsolute = path.startsWith('/');
  const segments = path.split('/').filter((segment) => segment.length > 0);
  if (segments.length === 0) return null;

  const parentSegments = segments.slice(0, -1);
  const name = segments.slice(-1).join(''); // the one remaining segment, as a string
  const parentPath =
    parentSegments.length > 0
      ? (isAbsolute ? '/' : '') + parentSegments.join('/')
      : isAbsolute
        ? '/'
        : '.';
  return { parentPath, name };
}

/**
 * Resolves an `mv`/`rename` destination to a (folder, name) pair — this is what
 * makes `mv` double as rename, matching Linux: if the whole path already exists
 * and is a folder, that's the destination and the source keeps its name (the
 * plain "move into a folder" case). Otherwise the path is split at its last
 * segment — everything before it must resolve to a folder, and that last
 * segment becomes the new name, so `mv a b` renames in place and
 * `mv a dir/new-name` moves *and* renames in one step.
 */
async function resolveMoveDestination(
  destPath: string,
  sourceName: string,
  reader: TreeReader,
  currentNodeId: NodeId,
): Promise<{ ok: true; parent: Node; name: string } | { ok: false; error: string }> {
  const whole = await resolvePath(destPath, reader, currentNodeId);
  if (whole.ok) {
    if (!isContainer(whole.node)) return { ok: false, error: `${whole.node.name} is not a folder` };
    return { ok: true, parent: whole.node, name: sourceName };
  }

  const split = splitLastSegment(destPath);
  if (!split) return { ok: false, error: whole.error };
  const parent = await resolvePath(split.parentPath, reader, currentNodeId);
  if (!parent.ok) return { ok: false, error: whole.error };
  if (!isContainer(parent.node)) return { ok: false, error: `${parent.node.name} is not a folder` };
  return { ok: true, parent: parent.node, name: split.name };
}

// Counts everything under `nodeId` (not including it) — how big a `rm -r`
// actually is, so the confirmation can say so instead of just "trust me".
async function countDescendants(reader: TreeReader, nodeId: NodeId): Promise<number> {
  let count = 0;
  for (const child of await reader.getChildren(nodeId)) {
    count += 1 + (await countDescendants(reader, child.id));
  }
  return count;
}

// Removes a node and everything under it, deepest-first — the same tree walk
// as `copySubtree`, run in reverse (children gone before their parent).
async function deleteSubtree(repo: ExecuteContext['repo'], nodeId: NodeId): Promise<void> {
  for (const child of await repo.getChildren(nodeId)) {
    await deleteSubtree(repo, child.id);
  }
  await repo.remove(nodeId);
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
  const { repo, currentNodeId, permissions, actor } = ctx;

  switch (command.kind) {
    case 'error':
      return error(command.message);

    case 'cd': {
      const result = await resolvePath(command.path, repo, currentNodeId);
      if (!result.ok) return error(result.error);
      // A node the actor can't `view` reads as "doesn't exist" — deliberately
      // indistinguishable from a genuinely missing path, so a hidden node's
      // existence is never disclosed.
      if (!(await permissions.can(actor, result.node.id, 'view'))) {
        return error(`path not found: ${command.path}`);
      }
      return { kind: 'navigate', nodeId: result.node.id };
    }

    case 'ls': {
      let base: Node | null;
      if (command.path) {
        const result = await resolvePath(command.path, repo, currentNodeId);
        if (!result.ok) return error(result.error);
        if (!(await permissions.can(actor, result.node.id, 'view'))) {
          return error(`path not found: ${command.path}`);
        }
        base = result.node;
      } else {
        base = await repo.getNode(currentNodeId);
      }
      if (!base) return error('nothing to list here');
      const children = await repo.getChildren(base.id);
      const nodes = await permissions.filterViewable(actor, children);
      const dirPath = await displayPath(repo, base);
      return { kind: 'listing', dirPath, nodes };
    }

    case 'find': {
      const matches = await searchTree(repo, permissions, actor, currentNodeId, command.query);
      return { kind: 'matches', query: command.query, matches };
    }

    case 'mv': {
      const src = await resolvePath(command.src, repo, currentNodeId);
      if (!src.ok) return error(`mv: ${src.error}`);
      if (!(await permissions.can(actor, src.node.id, 'manage'))) {
        return error(`mv: you don't have permission to move ${src.node.name}`);
      }
      const dest = await resolveMoveDestination(command.dest, src.node.name, repo, currentNodeId);
      if (!dest.ok) return error(`mv: ${dest.error}`);
      if (dest.parent.id === src.node.id) return error(`mv: can't move ${src.node.name} into itself`);
      if (await isWithin(repo, dest.parent.id, src.node.id)) {
        return error(`mv: can't move ${src.node.name} into its own subtree`);
      }

      const didMove = dest.parent.id !== src.node.parentId;
      const didRename = dest.name !== src.node.name;
      if (!didMove && !didRename) {
        return { kind: 'info', message: `${src.node.name} is already there`, invalidateParentIds: [] };
      }
      // Only a genuine cross-folder move needs `write` on the destination —
      // a pure rename-in-place (dest resolves to the same parent) requires
      // nothing beyond the `manage` on `src` already checked above, matching
      // the dedicated `rename` command's own requirement exactly.
      if (didMove && !(await permissions.can(actor, dest.parent.id, 'write'))) {
        return error(`mv: you don't have permission to move things into ${dest.parent.name}`);
      }

      if (didMove) {
        const position = appendPosition(await repo.getChildren(dest.parent.id));
        await repo.move(src.node.id, dest.parent.id, position);
      }
      if (didRename) {
        await repo.update(src.node.id, { name: dest.name });
      }

      const changed = [dest.parent.id];
      if (didMove && src.node.parentId) changed.push(src.node.parentId);
      const message =
        didMove && didRename
          ? `Moved and renamed ${src.node.name} → ${dest.parent.name}/${dest.name}`
          : didRename
            ? `Renamed ${src.node.name} → ${dest.name}`
            : `Moved ${src.node.name} → ${dest.parent.name}`;
      return {
        kind: 'info',
        message,
        invalidateParentIds: changed,
        renamedNodeId: didRename ? src.node.id : undefined,
      };
    }

    case 'cp': {
      const src = await resolvePath(command.src, repo, currentNodeId);
      if (!src.ok) return error(`cp: ${src.error}`);
      if (!(await permissions.can(actor, src.node.id, 'read'))) {
        return error(`cp: you don't have permission to copy ${src.node.name}`);
      }
      const dest = await resolvePath(command.dest, repo, currentNodeId);
      if (!dest.ok) return error(`cp: ${dest.error}`);
      if (!isContainer(dest.node)) return error(`cp: ${dest.node.name} is not a folder`);
      if (!(await permissions.can(actor, dest.node.id, 'write'))) {
        return error(`cp: you don't have permission to copy things into ${dest.node.name}`);
      }
      if (dest.node.id === src.node.id || (await isWithin(repo, dest.node.id, src.node.id))) {
        return error(`cp: can't copy ${src.node.name} into itself`);
      }
      const position = appendPosition(await repo.getChildren(dest.node.id));
      await copySubtree(ctx, src.node, dest.node.id, position);
      return { kind: 'info', message: `Copied ${src.node.name} → ${dest.node.name}`, invalidateParentIds: [dest.node.id] };
    }

    case 'create': {
      const current = await repo.getNode(currentNodeId);
      if (!current) return error('current location no longer exists');
      if (!isContainer(current)) {
        return error(`create: can't create things inside ${current.name} — cd into a folder or server first`);
      }
      if (!(await permissions.can(actor, current.id, 'write'))) {
        return error(`create: you don't have permission to create things in ${current.name}`);
      }
      const position = appendPosition(await repo.getChildren(current.id));
      const node = buildNode(command.type, command.name, current.id, position, actor.userId);
      await repo.create(node);
      return {
        kind: 'info',
        message: `Created ${command.type} "${node.name}" in ${current.name}`,
        invalidateParentIds: [current.id],
      };
    }

    case 'rename': {
      const target = await resolvePath(command.path, repo, currentNodeId);
      if (!target.ok) return error(`rename: ${target.error}`);
      const node = target.node;
      if (!(await permissions.can(actor, node.id, 'manage'))) {
        return error(`rename: you don't have permission to rename ${node.name}`);
      }
      if (command.newName === node.name) {
        return { kind: 'info', message: `${node.name} is already named that`, invalidateParentIds: [] };
      }
      await repo.update(node.id, { name: command.newName });
      return {
        kind: 'info',
        message: `Renamed ${node.name} → ${command.newName}`,
        invalidateParentIds: node.parentId ? [node.parentId] : [],
        renamedNodeId: node.id,
      };
    }

    case 'rm': {
      const target = await resolvePath(command.path, repo, currentNodeId);
      if (!target.ok) return error(`rm: ${target.error}`);
      const node = target.node;
      const parentId = node.parentId;
      if (parentId === null) return error("rm: can't delete the root");

      if (!(await permissions.can(actor, node.id, 'manage'))) {
        return error(`rm: you don't have permission to delete ${node.name}`);
      }

      const descendantCount = isContainer(node) ? await countDescendants(repo, node.id) : 0;
      if (descendantCount > 0 && !command.recursive) {
        return error(
          `rm: ${node.name} has ${descendantCount} item(s) inside it — use rm -r to delete it and everything in it`,
        );
      }

      if (!command.confirmed) {
        const message =
          descendantCount > 0
            ? `Delete ${node.name} and ${descendantCount} item(s) inside it? This can't be undone — press Enter again to confirm.`
            : `Delete ${node.name}? This can't be undone — press Enter again to confirm.`;
        return { kind: 'confirm', message, command: { ...command, confirmed: true } };
      }

      await deleteSubtree(repo, node.id);
      return { kind: 'info', message: `Deleted ${node.name}`, invalidateParentIds: [parentId] };
    }

    case 'message': {
      const current = await repo.getNode(currentNodeId);
      if (!current || current.type !== 'chat-channel') {
        return error('No channel here to post to — cd into a chat channel first.');
      }
      if (!(await permissions.can(actor, current.id, 'write'))) {
        return error("message: you don't have permission to post here");
      }
      return { kind: 'message', channelId: current.id, body: command.body };
    }
  }
}

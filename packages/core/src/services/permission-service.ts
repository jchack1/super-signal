import type { Actor } from '../domain/identity';
import type { NodeId } from '../domain/ids';
import type { Node } from '../domain/node';
import type { AccessControlEntry, Permission, Principal } from '../domain/permission';
import type { NodeRepository } from '../ports/node-repository';

/**
 * Which verbs each granted verb confers. Any real grant implies `view` (you
 * can't act on something you can't see); `manage` implies everything; `read`
 * and `write` stay independent so we can express read-only announcement channels
 * and write-only drop boxes.
 */
const CONFERS: Record<Permission, readonly Permission[]> = {
  view: ['view'],
  read: ['view', 'read'],
  write: ['view', 'write'],
  manage: ['view', 'read', 'write', 'manage'],
};

const ALL_PERMISSIONS: readonly Permission[] = ['view', 'read', 'write', 'manage'];

function principalMatchesActor(principal: Principal, actor: Actor): boolean {
  switch (principal.kind) {
    case 'everyone':
      return true;
    case 'user':
      return principal.id === actor.userId;
    case 'role':
      return actor.roleIds.includes(principal.id);
  }
}

/**
 * Walk from the node up through its ancestors, accumulating ACL entries, and
 * STOP as soon as a node breaks inheritance (`inherit: false`). That node's own
 * ACL still counts; its ancestors do not — this is what makes a private channel
 * inside a public server work.
 *
 * `ancestors` must be ordered nearest-first: [parent, grandparent, …, root].
 */
export function collectEffectiveAcl(node: Node, ancestors: Node[]): AccessControlEntry[] {
  const chain: Node[] = [node, ...ancestors];
  const entries: AccessControlEntry[] = [];
  for (const current of chain) {
    entries.push(...current.acl);
    if (!current.inherit) break;
  }
  return entries;
}

/**
 * Pure resolver: the exact set of verbs an actor effectively has on a node.
 * Kept as a standalone function (no I/O) so it's trivial to unit-test.
 */
export function resolveEffectivePermissions(
  node: Node,
  ancestors: Node[],
  actor: Actor,
): Set<Permission> {
  // The owner can always do anything.
  if (node.ownerId === actor.userId) {
    return new Set(ALL_PERMISSIONS);
  }

  const granted = new Set<Permission>();
  for (const entry of collectEffectiveAcl(node, ancestors)) {
    if (!principalMatchesActor(entry.principal, actor)) continue;
    for (const verb of entry.allow) {
      for (const conferred of CONFERS[verb]) {
        granted.add(conferred);
      }
    }
  }
  return granted;
}

/**
 * The business-logic tier. Depends only on the NodeRepository *interface*, so it
 * behaves identically against the mock adapter or (later) Supabase. NOTE: in the
 * real app the database (RLS) is the true security boundary — this service is for
 * UX/logic, e.g. graying out actions the actor can't perform.
 */
export class PermissionService {
  constructor(private readonly nodes: NodeRepository) {}

  async effectivePermissions(actor: Actor, nodeId: NodeId): Promise<Set<Permission>> {
    const node = await this.nodes.getNode(nodeId);
    if (!node) return new Set();
    const ancestors = await this.nodes.getAncestors(nodeId);
    return resolveEffectivePermissions(node, ancestors, actor);
  }

  async can(actor: Actor, nodeId: NodeId, permission: Permission): Promise<boolean> {
    const granted = await this.effectivePermissions(actor, nodeId);
    return granted.has(permission);
  }
}

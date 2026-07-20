import type { NodeId } from '../domain/ids';
import type { Node, NodePatch } from '../domain/node';

/**
 * The data-access contract for the Node tree — a "port". The app depends on this
 * interface, never on a concrete database. Swap providers by writing a new
 * implementation (mock now, Supabase later, our own API someday); nothing above
 * this line changes.
 */
export interface NodeRepository {
  getNode(id: NodeId): Promise<Node | null>;
  /** Direct children of a folder/server, ordered by `position`. */
  getChildren(parentId: NodeId): Promise<Node[]>;
  /** Ancestors from nearest parent up to the root (parent, grandparent, … root). */
  getAncestors(id: NodeId): Promise<Node[]>;
  create(node: Node): Promise<Node>;
  update(id: NodeId, patch: NodePatch): Promise<Node>;
  move(id: NodeId, newParentId: NodeId, position: string): Promise<Node>;
  remove(id: NodeId): Promise<void>;
}
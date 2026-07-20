import type { NodeId } from '../../domain/ids';
import type { Node, NodePatch } from '../../domain/node';
import type { NodeRepository } from '../../ports/node-repository';

/** An in-memory Node store. Same shape as the real thing, but backed by a Map. */
export class MockNodeRepository implements NodeRepository {
  private readonly byId = new Map<NodeId, Node>();

  constructor(seedNodes: Node[]) {
    for (const node of seedNodes) {
      this.byId.set(node.id, node);
    }
  }

  async getNode(id: NodeId): Promise<Node | null> {
    return this.byId.get(id) ?? null;
  }

  async getChildren(parentId: NodeId): Promise<Node[]> {
    return [...this.byId.values()]
      .filter((node) => node.parentId === parentId)
      .sort((a, b) => a.position.localeCompare(b.position));
  }

  async getAncestors(id: NodeId): Promise<Node[]> {
    const ancestors: Node[] = [];
    let current = this.byId.get(id);
    // Follow parentId upward until we reach a root (parentId is null).
    while (current && current.parentId !== null) {
      const parent = this.byId.get(current.parentId);
      if (!parent) break;
      ancestors.push(parent);
      current = parent;
    }
    return ancestors;
  }

  async create(node: Node): Promise<Node> {
    this.byId.set(node.id, node);
    return node;
  }

  async update(id: NodeId, patch: NodePatch): Promise<Node> {
    const existing = this.byId.get(id);
    if (!existing) {
      throw new Error(`Node not found: ${id}`);
    }
    // The cast is needed because we're spreading a patch onto one member of a
    // union type; the fields are all valid base-node fields.
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() } as Node;
    this.byId.set(id, updated);
    return updated;
  }

  async move(id: NodeId, newParentId: NodeId, position: string): Promise<Node> {
    return this.update(id, { parentId: newParentId, position });
  }

  async remove(id: NodeId): Promise<void> {
    this.byId.delete(id);
  }
}

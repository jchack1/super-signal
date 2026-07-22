import type { Node, NodeId, NodeType, NodeRepository } from '@super-signal/core';

// Feature-local types for the command line. Kept here (not in a shared location)
// because nothing outside this folder needs them.

/**
 * A parsed line of input. Everything is a command *except* input starting with
 * `@`/`#`, which is a `message`. `error` carries a parse-time complaint (bad
 * arguments, empty input) straight through to the UI.
 */
export type Command =
  | { kind: 'cd'; path: string }
  | { kind: 'ls'; path?: string }
  | { kind: 'find'; query: string }
  | { kind: 'mv'; src: string; dest: string }
  | { kind: 'cp'; src: string; dest: string }
  | { kind: 'message'; body: string }
  | { kind: 'error'; message: string };

/** A `find` hit: the node plus its absolute display path (`/Super Signal/…`). */
export interface NodeMatch {
  node: Node;
  path: string;
}

/**
 * The outcome of running a command. `navigate`/`message` are handed back to the
 * hook (which owns the router and the optimistic sender); `listing`/`matches`
 * render in the results dropdown; `info`/`error` are one-line status lines.
 */
export type CommandResult =
  | { kind: 'navigate'; nodeId: NodeId }
  | { kind: 'listing'; dirPath: string; nodes: Node[] }
  | { kind: 'matches'; query: string; matches: NodeMatch[] }
  | { kind: 'info'; message: string; invalidateParentIds: NodeId[] }
  | { kind: 'message'; channelId: NodeId; body: string }
  | { kind: 'error'; message: string };

/** A selectable row in the results dropdown, derived from a listing or matches. */
export interface ResultRow {
  id: NodeId;
  name: string;
  type: NodeType;
  /** Where it lives — the parent dir path (ls) or the node's own path (find). */
  subtitle: string;
}

/** The read-only tree access `resolvePath`/`find` need — a subset of the port. */
export type TreeReader = Pick<NodeRepository, 'getNode' | 'getChildren' | 'getAncestors'>;

/** What `executeCommand` needs: full node access plus "where am I". */
export interface ExecuteContext {
  repo: NodeRepository;
  currentNodeId: NodeId;
}

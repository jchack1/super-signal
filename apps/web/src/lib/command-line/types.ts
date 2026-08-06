import type { Actor, Node, NodeId, NodeType, NodeRepository } from '@super-signal/core';
import type { PermissionService } from '@super-signal/core/services';

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
  | { kind: 'create'; type: CreatableNodeType; name: string }
  | { kind: 'rename'; path: string; newName: string }
  | { kind: 'rm'; path: string; recursive: boolean; confirmed: boolean }
  | { kind: 'message'; body: string }
  | { kind: 'error'; message: string };

/**
 * Node types `create`/`mkdir` can produce from a bare name. `document` is
 * excluded — it needs a `storageKey`/`mime` payload that only a file upload can
 * supply, so it's out of scope for a command-line create (see feature-history).
 */
export type CreatableNodeType = Exclude<NodeType, 'document'>;

/** A `find` hit: the node plus its absolute display path (`/Super Signal/…`). */
export interface NodeMatch {
  node: Node;
  path: string;
}

/**
 * The outcome of running a command. `navigate`/`message` are handed back to the
 * hook (which owns the router and the optimistic sender); `listing`/`matches`
 * render in the results dropdown; `info`/`error` are one-line status lines.
 * `confirm` is a destructive action (currently just `rm`) awaiting a second
 * Enter — `command` is the same command with `confirmed: true` baked in, ready
 * to re-run as-is if the user commits. `info.renamedNodeId` is set when a
 * `rename` (or a `mv` that doubled as one) changed a node's own name — beyond
 * refreshing the parent folder's listing, the hook also needs to refresh that
 * node's own cached data and the current view's breadcrumb.
 */
export type CommandResult =
  | { kind: 'navigate'; nodeId: NodeId }
  | { kind: 'listing'; dirPath: string; nodes: Node[] }
  | { kind: 'matches'; query: string; matches: NodeMatch[] }
  | { kind: 'info'; message: string; invalidateParentIds: NodeId[]; renamedNodeId?: NodeId }
  | { kind: 'confirm'; message: string; command: Command }
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

/** What `executeCommand` needs: full node access, "where am I", and "who am I" (for permission checks). */
export interface ExecuteContext {
  repo: NodeRepository;
  currentNodeId: NodeId;
  permissions: PermissionService;
  actor: Actor;
}

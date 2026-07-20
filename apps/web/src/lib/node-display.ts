import type { Node, NodeType } from '@super-signal/core';

// How each Node kind reads in the tree and breadcrumbs. Channels use the literal
// `#` / `🔊` prefixes people expect from chat apps; structural nodes get folder-ish
// glyphs. Kept in one place so the tree, address bar, and status bar agree.
const GLYPHS: Record<NodeType, string> = {
  server: '🏛️',
  folder: '📁',
  'chat-channel': '#',
  'voice-channel': '🔊',
  document: '📄',
};

export function nodeGlyph(type: NodeType): string {
  return GLYPHS[type];
}

// Container nodes have children you can expand/enter; leaves (channels, docs) don't.
const CONTAINER_TYPES: readonly NodeType[] = ['server', 'folder'];

export function isContainer(node: Node): boolean {
  return CONTAINER_TYPES.includes(node.type);
}

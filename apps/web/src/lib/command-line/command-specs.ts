// Static reference for the command-line's live suggestions dropdown. Kept
// separate from parse.ts (which is the source of truth for what actually
// executes) so this can drift toward "helpful phrasing" without risking the
// parsing logic — if the two disagree, parse.ts wins.
export interface CommandSpec {
  verb: string;
  syntax: string;
  description: string;
}

export const COMMAND_SPECS: CommandSpec[] = [
  { verb: 'cd', syntax: 'cd <path>', description: 'change directory' },
  { verb: 'ls', syntax: 'ls [path]', description: 'list contents' },
  { verb: 'find', syntax: 'find <query>', description: 'search the tree' },
  { verb: 'mv', syntax: 'mv <src> <dest>', description: 'move (renames too, if dest is new)' },
  { verb: 'cp', syntax: 'cp <src> <dest>', description: 'copy a node' },
  {
    verb: 'create',
    syntax: 'create <type> <name>',
    description: 'folder, server, channel, or voice',
  },
  { verb: 'mkdir', syntax: 'mkdir <name>', description: 'create a folder' },
  { verb: 'rename', syntax: 'rename <path> <new-name>', description: 'rename in place' },
  {
    verb: 'rm',
    syntax: 'rm [-r] <path>',
    description: 'delete (asks to confirm; -r for non-empty folders/servers)',
  },
];

// Suggestions matching what's typed so far, keyed on the verb (the first
// whitespace-delimited token). Returns nothing for empty input or a message
// (`@`/`#`) — those have no verb syntax to show.
export function matchCommandSpecs(input: string): CommandSpec[] {
  const trimmed = input.trimStart();
  if (!trimmed || trimmed.startsWith('@') || trimmed.startsWith('#')) return [];

  const firstSpace = trimmed.search(/\s/);
  const verbPrefix = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)).toLowerCase();
  return COMMAND_SPECS.filter((spec) => spec.verb.startsWith(verbPrefix));
}

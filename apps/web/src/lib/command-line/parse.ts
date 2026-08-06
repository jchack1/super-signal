import { tokenize } from './tokenize';
import type { Command, CreatableNodeType } from './types';

// User-facing keywords for `create <type> <name>`, mapped onto the domain's
// NodeType. Several words point at the same type (`channel`/`chat`, `voice`/`vc`)
// since there's no filename extension to infer a type from the way Linux's
// `touch` does — the type has to be named explicitly, so we accept the words
// people are likely to reach for.
const CREATE_TYPE_ALIASES: Record<string, CreatableNodeType> = {
  folder: 'folder',
  dir: 'folder',
  server: 'server',
  channel: 'chat-channel',
  chat: 'chat-channel',
  'chat-channel': 'chat-channel',
  voice: 'voice-channel',
  vc: 'voice-channel',
  'voice-channel': 'voice-channel',
};
const CREATE_TYPE_HINT = 'folder, server, channel, or voice';

// Recursive-delete flags for `rm`, mirroring Linux's `-r`/`-R`/`--recursive`.
const RECURSIVE_FLAGS = new Set(['-r', '-R', '--recursive']);

// Turns a raw line into a typed Command. The one disambiguation rule: a leading
// `@` or `#` makes it a message; everything else is a command. cd/ls/find take
// their whole remainder as a single path (so unquoted spaces work, e.g.
// `cd Super Signal/general`); mv/cp take two quote-aware arguments. An
// unrecognised verb is treated as a bare path to `cd` into.
export function parse(input: string): Command {
  const trimmed = input.trim();
  if (!trimmed) {
    return { kind: 'error', message: 'Type a command, or @ / # to send a message.' };
  }

  // Message sigils win before any command parsing. An `@…` mention is kept in the
  // body (it's addressed content). A `#` works two ways: `#tag` glued to a word is
  // a hashtag and stays; a bare `#` followed by a space is just the "post to the
  // current channel" sigil, so we drop it rather than echo a stray `#` into chat.
  if (trimmed.startsWith('@')) {
    return { kind: 'message', body: trimmed };
  }
  if (trimmed.startsWith('#')) {
    const afterHash = trimmed.slice(1);
    const isBareSigil = afterHash === '' || /^\s/.test(afterHash);
    if (!isBareSigil) return { kind: 'message', body: trimmed };
    const body = afterHash.trim();
    if (!body) return { kind: 'error', message: 'Nothing to send.' };
    return { kind: 'message', body };
  }

  const firstSpace = trimmed.search(/\s/);
  const verb = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)).toLowerCase();
  const remainder = firstSpace === -1 ? '' : trimmed.slice(firstSpace + 1).trim();

  switch (verb) {
    case 'cd':
      if (!remainder) return { kind: 'error', message: 'cd: needs a path, e.g. cd projects' };
      return { kind: 'cd', path: remainder };

    case 'ls':
      // No argument = list the current directory.
      return { kind: 'ls', path: remainder || undefined };

    case 'find':
      if (!remainder) {
        return { kind: 'error', message: 'find: needs a search term, e.g. find general' };
      }
      return { kind: 'find', query: remainder };

    case 'mkdir':
      if (!remainder) return { kind: 'error', message: 'mkdir: needs a name, e.g. mkdir projects' };
      return { kind: 'create', type: 'folder', name: remainder };

    case 'create': {
      const firstArgSpace = remainder.search(/\s/);
      if (!remainder || firstArgSpace === -1) {
        return {
          kind: 'error',
          message: `create: needs a type and a name, e.g. create channel general (types: ${CREATE_TYPE_HINT})`,
        };
      }
      const typeWord = remainder.slice(0, firstArgSpace).toLowerCase();
      const name = remainder.slice(firstArgSpace + 1).trim();
      const type = CREATE_TYPE_ALIASES[typeWord];
      if (!type) {
        return {
          kind: 'error',
          message: `create: unknown type "${typeWord}" — try ${CREATE_TYPE_HINT}`,
        };
      }
      if (!name) return { kind: 'error', message: 'create: needs a name, e.g. create channel general' };
      return { kind: 'create', type, name };
    }

    case 'rm': {
      if (!remainder) {
        return {
          kind: 'error',
          message: 'rm: needs a path, e.g. rm projects/old or rm -r projects/old',
        };
      }
      const firstArgSpace = remainder.search(/\s/);
      const firstToken = firstArgSpace === -1 ? remainder : remainder.slice(0, firstArgSpace);
      const recursive = RECURSIVE_FLAGS.has(firstToken);
      const path = recursive
        ? (firstArgSpace === -1 ? '' : remainder.slice(firstArgSpace + 1).trim())
        : remainder;
      if (!path) return { kind: 'error', message: 'rm: needs a path, e.g. rm -r projects/old' };
      return { kind: 'rm', path, recursive, confirmed: false };
    }

    case 'rename': {
      const [path, newName, extra] = tokenize(remainder);
      if (path === undefined || newName === undefined) {
        return {
          kind: 'error',
          message: 'rename: needs a path and a new name, e.g. rename projects/old new-name',
        };
      }
      if (extra !== undefined) {
        return {
          kind: 'error',
          message: 'rename: too many arguments — quote names that contain spaces',
        };
      }
      return { kind: 'rename', path, newName };
    }

    case 'mv':
    case 'cp': {
      const [src, dest, extra] = tokenize(remainder);
      if (src === undefined || dest === undefined) {
        return {
          kind: 'error',
          message: `${verb}: needs a source and destination, e.g. ${verb} <src> <dest>`,
        };
      }
      if (extra !== undefined) {
        return {
          kind: 'error',
          message: `${verb}: too many arguments — quote names that contain spaces`,
        };
      }
      return { kind: verb, src, dest };
    }

    default:
      // Not a known verb → treat the whole line as a path to cd into. This is the
      // "bare path" navigation shortcut; a bad path surfaces as a not-found error
      // when it's resolved.
      return { kind: 'cd', path: trimmed };
  }
}

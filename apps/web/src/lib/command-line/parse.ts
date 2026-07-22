import { tokenize } from './tokenize';
import type { Command } from './types';

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

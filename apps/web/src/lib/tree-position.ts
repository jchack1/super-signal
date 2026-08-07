import type { Node } from '@super-signal/core';

// Returns a `position` string that sorts *after* every current sibling, so a
// moved/copied node lands at the end of its new parent. Positions are compared
// with `localeCompare` (see MockNodeRepository.getChildren); appending a char to
// the current maximum guarantees a larger string, since a prefix always sorts
// before the longer string.
export function appendPosition(siblings: Node[]): string {
  const positions = siblings.map((sibling) => sibling.position);
  if (positions.length === 0) return 'a0';
  // reduce with no seed over a non-empty array yields a string (never undefined).
  const max = positions.reduce((acc, position) => (position.localeCompare(acc) > 0 ? position : acc));
  return `${max}z`;
}

// Base-36 alphabet used for fractional positions: digits sort before letters
// under `localeCompare`, so treating each character as a digit in this order
// matches how positions are actually compared.
const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const BASE = DIGITS.length;

// Returns a position string that sorts strictly between `before` and `after` —
// the fractional-index "midpoint" technique behind LexoRank, needed to drop a
// node between two specific siblings (drag-to-reorder) rather than only at the
// end (`appendPosition`). Pass `undefined` for `before`/`after` to mean "start
// of the list" / "end of the list".
//
// Walks both strings one base-36 digit at a time. While the digits match, that
// shared digit is kept (both positions "agree" that far); at the first digit
// where they differ, the digit exactly halfway between them is inserted and
// that's the answer. If they're adjacent digits (no room for a midpoint at this
// depth), `before`'s digit is kept and the search continues one level deeper,
// where a missing digit reads as the very first symbol (0) or, for `after`, as
// "no bound yet" (one past the last symbol) — a treatment that terminates in at
// most `max(before.length, after.length) + 1` steps.
export function positionBetween(before: string | undefined, after: string | undefined): string {
  if (before !== undefined && after !== undefined && before.localeCompare(after) >= 0) {
    throw new Error(`positionBetween: "${before}" does not sort before "${after}"`);
  }

  // `0` is the alphabet's minimum digit, so when there's no lower bound at all
  // (`before` is `undefined`) and `after` is nothing but `0`s, the digit walk
  // below would keep "matching" zeros until `after` runs out, then treat the
  // rest as unbounded and append trailing digits — producing a result that's
  // *longer* than `after` with the same leading zeros, which sorts after it,
  // not before. The empty string is the one value guaranteed to sort before
  // anything, so it's the correct answer in this one edge case.
  if (before === undefined && after !== undefined && /^0*$/.test(after)) {
    return '';
  }

  let result = '';
  let i = 0;
  while (true) {
    const beforeDigit = before !== undefined && i < before.length ? DIGITS.indexOf(before.charAt(i)) : 0;
    const afterDigit = after !== undefined && i < after.length ? DIGITS.indexOf(after.charAt(i)) : BASE;

    if (beforeDigit === afterDigit) {
      result += DIGITS[beforeDigit];
      i += 1;
      continue;
    }

    const mid = Math.floor((beforeDigit + afterDigit) / 2);
    if (mid > beforeDigit) {
      return result + DIGITS[mid];
    }
    // Adjacent digits, no room for a midpoint yet — keep before's digit and go
    // one level deeper to find room.
    result += DIGITS[beforeDigit];
    i += 1;
  }
}

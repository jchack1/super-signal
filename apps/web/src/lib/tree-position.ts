import type { Node } from '@super-signal/core';

// Returns a `position` string that sorts *after* every current sibling, so a
// moved/copied node lands at the end of its new parent. Positions are compared
// with `localeCompare` (see MockNodeRepository.getChildren); appending a char to
// the current maximum guarantees a larger string, since a prefix always sorts
// before the longer string. A proper fractional-index (LexoRank) library is
// deferred until reordering-in-the-middle is needed.
export function appendPosition(siblings: Node[]): string {
  const positions = siblings.map((sibling) => sibling.position);
  if (positions.length === 0) return 'a0';
  // reduce with no seed over a non-empty array yields a string (never undefined).
  const max = positions.reduce((acc, position) => (position.localeCompare(acc) > 0 ? position : acc));
  return `${max}z`;
}

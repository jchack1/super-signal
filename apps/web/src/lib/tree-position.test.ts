import { describe, expect, it } from 'vitest';
import { positionBetween } from './tree-position';

describe('positionBetween', () => {
  it('sorts strictly between two adjacent siblings', () => {
    const between = positionBetween('a0', 'a1');
    expect(between.localeCompare('a0')).toBeGreaterThan(0);
    expect(between.localeCompare('a1')).toBeLessThan(0);
  });

  it('sorts strictly between two siblings that are already far apart', () => {
    const between = positionBetween('a0', 'a9z');
    expect(between.localeCompare('a0')).toBeGreaterThan(0);
    expect(between.localeCompare('a9z')).toBeLessThan(0);
  });

  it('sorts before everything when `before` is undefined (drop at the start)', () => {
    const between = positionBetween(undefined, 'a0');
    expect(between.localeCompare('a0')).toBeLessThan(0);
  });

  it('sorts after everything when `after` is undefined (drop at the end)', () => {
    const between = positionBetween('a2', undefined);
    expect(between.localeCompare('a2')).toBeGreaterThan(0);
  });

  it('produces a usable position with no bounds at all (empty list)', () => {
    expect(() => positionBetween(undefined, undefined)).not.toThrow();
  });

  it('keeps working across repeated inserts into the same gap', () => {
    let before = 'a0';
    const after = 'a1';
    for (let i = 0; i < 5; i++) {
      const mid = positionBetween(before, after);
      expect(mid.localeCompare(before)).toBeGreaterThan(0);
      expect(mid.localeCompare(after)).toBeLessThan(0);
      before = mid;
    }
  });

  it('throws if `before` does not actually sort before `after`', () => {
    expect(() => positionBetween('a1', 'a0')).toThrow();
    expect(() => positionBetween('a0', 'a0')).toThrow();
  });
});

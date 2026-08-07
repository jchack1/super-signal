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

  it('sorts before an all-zero `after` with no lower bound (regression)', () => {
    // `0` is the alphabet minimum, so there's no digit below it — this used to
    // return something like '0i', which sorts *after* '0', not before it.
    for (const after of ['0', '00', '000']) {
      const between = positionBetween(undefined, after);
      expect(between.localeCompare(after)).toBeLessThan(0);
    }
  });

  it('still finds room before an `after` that has a non-zero digit', () => {
    const between = positionBetween(undefined, '001');
    expect(between.localeCompare('001')).toBeLessThan(0);
  });
});

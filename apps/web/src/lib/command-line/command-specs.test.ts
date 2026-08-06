import { describe, expect, it } from 'vitest';
import { matchCommandSpecs } from './command-specs';

describe('matchCommandSpecs', () => {
  it('matches every spec whose verb starts with the typed prefix', () => {
    expect(matchCommandSpecs('c').map((s) => s.verb)).toEqual(['cd', 'cp', 'create']);
    expect(matchCommandSpecs('cr').map((s) => s.verb)).toEqual(['create']);
  });

  it('keeps matching the verb once a space/arguments follow', () => {
    expect(matchCommandSpecs('cd projects/frontend').map((s) => s.verb)).toEqual(['cd']);
    expect(matchCommandSpecs('rm -r projects').map((s) => s.verb)).toEqual(['rm']);
  });

  it('returns nothing for empty input or an unknown verb', () => {
    expect(matchCommandSpecs('')).toEqual([]);
    expect(matchCommandSpecs('   ')).toEqual([]);
    expect(matchCommandSpecs('zzz')).toEqual([]);
  });

  it('returns nothing for a message (@ or #)', () => {
    expect(matchCommandSpecs('@bob hi')).toEqual([]);
    expect(matchCommandSpecs('#general')).toEqual([]);
  });
});

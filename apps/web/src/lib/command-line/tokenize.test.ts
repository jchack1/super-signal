import { describe, expect, it } from 'vitest';
import { tokenize } from './tokenize';

describe('tokenize', () => {
  it('splits on whitespace', () => {
    expect(tokenize('mv a b')).toEqual(['mv', 'a', 'b']);
  });

  it('keeps quoted segments (with spaces) as one token', () => {
    expect(tokenize('"Super Signal/general" projects')).toEqual([
      'Super Signal/general',
      'projects',
    ]);
    expect(tokenize("'my folder' other")).toEqual(['my folder', 'other']);
  });

  it('collapses runs of whitespace and trims ends', () => {
    expect(tokenize('  a   b  ')).toEqual(['a', 'b']);
  });

  it('returns an empty array for empty/blank input', () => {
    expect(tokenize('')).toEqual([]);
    expect(tokenize('   ')).toEqual([]);
  });

  it('preserves an explicitly empty quoted token', () => {
    expect(tokenize('a "" b')).toEqual(['a', '', 'b']);
  });
});

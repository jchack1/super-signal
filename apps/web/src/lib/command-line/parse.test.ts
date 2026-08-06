import { describe, expect, it } from 'vitest';
import { parse } from './parse';

describe('parse', () => {
  it('keeps an @mention in the message body', () => {
    expect(parse('@bob hi')).toEqual({ kind: 'message', body: '@bob hi' });
  });

  it('keeps a #hashtag (glued to a word) as content', () => {
    expect(parse('#news the build is green')).toEqual({
      kind: 'message',
      body: '#news the build is green',
    });
  });

  it('strips a bare "# " routing sigil from the message body', () => {
    expect(parse('# gm everyone')).toEqual({ kind: 'message', body: 'gm everyone' });
  });

  it('errors on a bare # with nothing to send', () => {
    expect(parse('#').kind).toBe('error');
    expect(parse('#   ').kind).toBe('error');
  });

  it('parses cd with the whole remainder as one path (unquoted spaces allowed)', () => {
    expect(parse('cd Super Signal/general')).toEqual({
      kind: 'cd',
      path: 'Super Signal/general',
    });
  });

  it('parses ls with and without an argument', () => {
    expect(parse('ls')).toEqual({ kind: 'ls', path: undefined });
    expect(parse('ls projects')).toEqual({ kind: 'ls', path: 'projects' });
  });

  it('parses find', () => {
    expect(parse('find general')).toEqual({ kind: 'find', query: 'general' });
  });

  it('parses mv/cp into two quote-aware arguments', () => {
    expect(parse('mv "projects/frontend" projects/archive')).toEqual({
      kind: 'mv',
      src: 'projects/frontend',
      dest: 'projects/archive',
    });
  });

  it('errors on mv/cp with the wrong number of arguments', () => {
    expect(parse('mv one').kind).toBe('error');
    expect(parse('cp a b c').kind).toBe('error');
  });

  it('errors on empty input and on cd/find with no argument', () => {
    expect(parse('   ').kind).toBe('error');
    expect(parse('cd').kind).toBe('error');
    expect(parse('find').kind).toBe('error');
  });

  it('parses create with a type keyword and takes the remainder as the name', () => {
    expect(parse('create channel general updates')).toEqual({
      kind: 'create',
      type: 'chat-channel',
      name: 'general updates',
    });
    expect(parse('create voice lobby')).toEqual({
      kind: 'create',
      type: 'voice-channel',
      name: 'lobby',
    });
    expect(parse('create folder projects')).toEqual({
      kind: 'create',
      type: 'folder',
      name: 'projects',
    });
  });

  it('errors on create with a missing type/name or an unknown type', () => {
    expect(parse('create').kind).toBe('error');
    expect(parse('create channel').kind).toBe('error');
    expect(parse('create spreadsheet budget').kind).toBe('error');
  });

  it('parses mkdir as sugar for create folder', () => {
    expect(parse('mkdir projects')).toEqual({ kind: 'create', type: 'folder', name: 'projects' });
  });

  it('errors on mkdir with no name', () => {
    expect(parse('mkdir').kind).toBe('error');
  });

  it('parses rm with no flag as a non-recursive, unconfirmed delete', () => {
    expect(parse('rm projects/archive/old-general')).toEqual({
      kind: 'rm',
      path: 'projects/archive/old-general',
      recursive: false,
      confirmed: false,
    });
  });

  it('parses rm -r (and -R / --recursive) as a recursive delete', () => {
    expect(parse('rm -r projects')).toEqual({
      kind: 'rm',
      path: 'projects',
      recursive: true,
      confirmed: false,
    });
    expect(parse('rm -R projects')).toMatchObject({ recursive: true, path: 'projects' });
    expect(parse('rm --recursive projects')).toMatchObject({ recursive: true, path: 'projects' });
  });

  it('errors on rm with no path (with or without the flag)', () => {
    expect(parse('rm').kind).toBe('error');
    expect(parse('rm -r').kind).toBe('error');
  });

  it('parses rename into a quote-aware path and new name', () => {
    expect(parse('rename "projects/old name" new-name')).toEqual({
      kind: 'rename',
      path: 'projects/old name',
      newName: 'new-name',
    });
  });

  it('errors on rename with the wrong number of arguments', () => {
    expect(parse('rename one').kind).toBe('error');
    expect(parse('rename a b c').kind).toBe('error');
  });

  it('treats an unknown verb as a bare path to cd into', () => {
    expect(parse('projects/frontend')).toEqual({ kind: 'cd', path: 'projects/frontend' });
    expect(parse('..')).toEqual({ kind: 'cd', path: '..' });
  });
});

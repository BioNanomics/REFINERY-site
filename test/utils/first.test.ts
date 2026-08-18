import { describe, expect, it } from 'vitest';
import {
  claimRegisteredMark,
  createFirstRegistry,
  firstPlain,
  FIRST_TOKENS,
  tokenizeFirst,
} from '../../src/utils/first';

describe('tokenizeFirst', () => {
  it('returns a single text segment when there are no marks', () => {
    expect(tokenizeFirst('our first season')).toEqual([
      { type: 'text', value: 'our first season' },
    ]);
  });

  it('splits out a single mark', () => {
    expect(tokenizeFirst('Join FIRST today')).toEqual([
      { type: 'text', value: 'Join ' },
      { type: 'mark', value: 'FIRST', token: 'FIRST' },
      { type: 'text', value: ' today' },
    ]);
  });

  it('splits out every known token, in order, including adjacent ones', () => {
    expect(tokenizeFirst('FIRST FRC FTC LEGO')).toEqual([
      { type: 'mark', value: 'FIRST', token: 'FIRST' },
      { type: 'text', value: ' ' },
      { type: 'mark', value: 'FRC', token: 'FRC' },
      { type: 'text', value: ' ' },
      { type: 'mark', value: 'FTC', token: 'FTC' },
      { type: 'text', value: ' ' },
      { type: 'mark', value: 'LEGO', token: 'LEGO' },
    ]);
  });

  it('does not match lowercase prose', () => {
    expect(tokenizeFirst('our first robot')).toEqual([
      { type: 'text', value: 'our first robot' },
    ]);
  });

  it('does not match a token embedded in a larger word (word boundary)', () => {
    expect(tokenizeFirst('FIRSTLY, welcome to firstinspires.org')).toEqual([
      { type: 'text', value: 'FIRSTLY, welcome to firstinspires.org' },
    ]);
  });

  it('handles an empty string', () => {
    expect(tokenizeFirst('')).toEqual([]);
  });

  it('covers exactly the four documented tokens', () => {
    expect(FIRST_TOKENS).toEqual(['FIRST', 'FRC', 'FTC', 'LEGO']);
  });
});

describe('createFirstRegistry / claimRegisteredMark', () => {
  it('starts empty', () => {
    expect(createFirstRegistry().size).toBe(0);
  });

  it('claims a token/context pair only once', () => {
    const registry = createFirstRegistry();
    expect(claimRegisteredMark(registry, 'FIRST', 'heading')).toBe(true);
    expect(claimRegisteredMark(registry, 'FIRST', 'heading')).toBe(false);
  });

  it('tracks heading and body contexts independently', () => {
    const registry = createFirstRegistry();
    expect(claimRegisteredMark(registry, 'FIRST', 'heading')).toBe(true);
    expect(claimRegisteredMark(registry, 'FIRST', 'body')).toBe(true);
    expect(claimRegisteredMark(registry, 'FIRST', 'body')).toBe(false);
  });

  it('tracks each token independently', () => {
    const registry = createFirstRegistry();
    expect(claimRegisteredMark(registry, 'FRC', 'body')).toBe(true);
    expect(claimRegisteredMark(registry, 'FTC', 'body')).toBe(true);
  });

  it('degrades to false, not a throw, when no registry is supplied', () => {
    expect(claimRegisteredMark(undefined, 'FIRST', 'heading')).toBe(false);
  });
});

describe('firstPlain', () => {
  it('leaves plain text unchanged', () => {
    expect(firstPlain('our first robot')).toBe('our first robot');
  });

  it('adds ® on first use of a token', () => {
    expect(firstPlain('Join FIRST today')).toBe('Join FIRST® today');
  });

  it('only marks the first occurrence of a repeated token', () => {
    expect(firstPlain('FIRST loves FIRST robotics')).toBe('FIRST® loves FIRST robotics');
  });

  it('marks each distinct token on its own first use', () => {
    expect(firstPlain('FIRST, FRC, and FTC')).toBe('FIRST®, FRC®, and FTC®');
  });

  it('starts a fresh claim set on every call', () => {
    expect(firstPlain('FIRST')).toBe('FIRST®');
    expect(firstPlain('FIRST')).toBe('FIRST®');
  });
});

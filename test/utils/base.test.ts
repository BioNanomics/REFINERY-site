import { describe, expect, it } from 'vitest';
import { withBase } from '../../src/utils/base';

describe('withBase', () => {
  it('joins a leading-slash path with the root base', () => {
    expect(withBase('/foo')).toBe('/foo');
  });

  it('adds the missing leading slash for a bare path', () => {
    expect(withBase('foo')).toBe('/foo');
  });

  it('preserves a trailing slash', () => {
    expect(withBase('/foo/bar/')).toBe('/foo/bar/');
  });

  it('resolves the empty path to the site root', () => {
    expect(withBase('')).toBe('/');
  });
});

import { describe, expect, it } from 'vitest';
import { linkedinProfiles } from '../../src/utils/people';

// linkedinProfiles only touches `data.linkedin` and `data.name`, so a minimal stand-in for
// CollectionEntry<'people'> is enough — the real type is erased at build time anyway.
function person(data: { name: string; linkedin?: unknown }) {
  return { data } as any;
}

describe('linkedinProfiles', () => {
  it('returns an empty array when there is no linkedin field', () => {
    expect(linkedinProfiles(person({ name: 'Cameron Elder' }))).toEqual([]);
  });

  it('wraps a bare URL string using the entry name', () => {
    expect(
      linkedinProfiles(person({ name: 'Cameron Elder', linkedin: 'https://linkedin.com/in/cameron' })),
    ).toEqual([{ name: 'Cameron Elder', url: 'https://linkedin.com/in/cameron' }]);
  });

  it('passes through a multi-person array unchanged, ignoring the entry name', () => {
    const linkedin = [
      { name: 'Doug Horner', url: 'https://linkedin.com/in/doug' },
      { name: 'Kim Horner', url: 'https://linkedin.com/in/kim' },
    ];
    expect(linkedinProfiles(person({ name: 'Doug and Kim Horner', linkedin }))).toBe(linkedin);
  });
});

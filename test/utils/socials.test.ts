import { describe, expect, it } from 'vitest';
import { SOCIAL_PLATFORMS, socialLinks } from '../../src/utils/socials';

describe('socialLinks', () => {
  it('returns an empty array when a team has no socials block at all', () => {
    expect(socialLinks(undefined)).toEqual([]);
  });

  it('returns an empty array for an empty socials block', () => {
    expect(socialLinks({})).toEqual([]);
  });

  it('includes only the platforms a team actually has', () => {
    // The row's width should track what's real rather than reserving space for absent
    // accounts — several teams list one platform and one lists none.
    expect(socialLinks({ instagram: 'https://instagram.example/t' })).toEqual([
      { key: 'instagram', url: 'https://instagram.example/t', label: 'Instagram' },
    ]);
  });

  it('renders in canonical order regardless of frontmatter key order', () => {
    // The invariant this module exists to protect. It was implicit in the inline array
    // this replaced, so it is exactly the kind of thing a future edit could quietly lose:
    // two teams listing the same platforms must get identical icon rows however their
    // YAML happened to be typed. Keys here are deliberately in reverse declaration order.
    const reversed = {
      website: 'https://example.org',
      linkedin: 'https://linkedin.example/t',
      github: 'https://github.example/t',
      youtube: 'https://youtube.example/t',
      facebook: 'https://facebook.example/t',
      instagram: 'https://instagram.example/t',
    };
    expect(socialLinks(reversed).map((s) => s.key)).toEqual([
      'instagram',
      'facebook',
      'youtube',
      'github',
      'linkedin',
      'website',
    ]);
  });

  it('carries a human-readable label for every platform, since the icons have no text', () => {
    // Each label becomes the link's aria-label and therefore its entire accessible name.
    const all = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.key, 'https://example.com']));
    const links = socialLinks(all);
    expect(links).toHaveLength(SOCIAL_PLATFORMS.length);
    expect(links.every((s) => s.label.length > 0)).toBe(true);
  });
});

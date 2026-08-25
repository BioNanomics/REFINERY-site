/**
 * Social-platform link ordering.
 *
 * Framework-free, for the same reason as src/utils/teams.ts: the test suite runs on plain
 * Vite with no Astro plugin, so nothing here may import `astro:content` as a value.
 */

/** The platforms the teams schema accepts. Order here is the order they render. */
export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X (Twitter)' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtube', label: 'YouTube' },
  { key: 'flickr', label: 'Flickr' },
  { key: 'tumblr', label: 'Tumblr' },
  { key: 'github', label: 'GitHub' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'website', label: 'Website' },
] as const;

export type SocialKey = (typeof SOCIAL_PLATFORMS)[number]['key'];

export type Socials = Partial<Record<SocialKey, string>>;

export interface SocialLink {
  key: SocialKey;
  url: string;
  /** Human-readable platform name, used to build the link's aria-label. */
  label: string;
}

/**
 * Flattens a team's `socials` object into a render-ready list.
 *
 * Two invariants worth stating, because both were implicit in the inline array this
 * replaces and either could be lost in a future edit:
 *
 *   1. Fixed order, independent of frontmatter key order. Two teams that list the same
 *      platforms get identical icon rows regardless of how each YAML block was typed.
 *   2. Only platforms a team actually has get an entry, so the row's width tracks what's
 *      real rather than reserving space for absent accounts.
 */
export function socialLinks(socials: Socials | undefined): SocialLink[] {
  if (!socials) return [];
  return SOCIAL_PLATFORMS.flatMap(({ key, label }) => {
    const url = socials[key];
    return url ? [{ key, url, label }] : [];
  });
}

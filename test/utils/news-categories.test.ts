import { describe, expect, it } from 'vitest';
import {
  NEWS_CATEGORIES,
  NEWS_CATEGORY_BADGES,
  NEWS_CATEGORY_SLUGS,
} from '../../src/utils/news-categories';

describe('NEWS_CATEGORY_SLUGS', () => {
  it('matches NEWS_CATEGORIES, in the same order', () => {
    expect(NEWS_CATEGORY_SLUGS).toEqual(NEWS_CATEGORIES.map((c) => c.slug));
  });

  it('has no duplicate slugs', () => {
    expect(new Set(NEWS_CATEGORY_SLUGS).size).toBe(NEWS_CATEGORY_SLUGS.length);
  });

  it('is non-empty, satisfying zod enum()', () => {
    expect(NEWS_CATEGORY_SLUGS.length).toBeGreaterThan(0);
  });
});

describe('NEWS_CATEGORY_BADGES', () => {
  it('uses the explicit badge text when one is given', () => {
    expect(NEWS_CATEGORY_BADGES.regional).toBe('Regional');
  });

  it('falls back to the chip label when no badge is given', () => {
    const teams = NEWS_CATEGORIES.find((c) => c.slug === 'teams')!;
    expect('badge' in teams).toBe(false);
    expect(NEWS_CATEGORY_BADGES.teams).toBe(teams.label);
  });

  it('has an entry for every category', () => {
    for (const category of NEWS_CATEGORIES) {
      expect(NEWS_CATEGORY_BADGES[category.slug]).toBeTruthy();
    }
  });
});

// The single source of truth for news categories.
//
// To add a category, add one entry below — nothing else needs to change. The
// content schema's allowed values, the badge labels on news cards, and the
// filter chips on the news page are all derived from this list, in this order.
//
// `slug` is what stories put in their `category:` frontmatter (kebab-case).
// `label` is the filter chip text. `badge` is the shorter text used on news
// cards, where space is tight — omit it and the chip label is used for both.
// FirstText renders "FIRST" in the brand style, so write labels plainly here.
export const NEWS_CATEGORIES = [
  { slug: 'refinery', label: 'The REFINERY' },
  { slug: 'teams', label: 'Teams' },
  { slug: 'regional', label: 'Regional News', badge: 'Regional' },
  { slug: 'partnerships', label: 'Partnerships' },
  { slug: 'events', label: 'Events' },
  { slug: 'first-community', label: 'FIRST Community' },
] as const satisfies ReadonlyArray<{ slug: string; label: string; badge?: string }>;

export type NewsCategory = (typeof NEWS_CATEGORIES)[number]['slug'];

// Zod's enum needs a non-empty tuple, so assert the shape the list already has.
export const NEWS_CATEGORY_SLUGS = NEWS_CATEGORIES.map((c) => c.slug) as unknown as [
  NewsCategory,
  ...NewsCategory[],
];

// Card badge text, falling back to the chip label when no `badge` is given.
export const NEWS_CATEGORY_BADGES = Object.fromEntries(
  NEWS_CATEGORIES.map((c) => [c.slug, 'badge' in c ? c.badge : c.label]),
) as Record<NewsCategory, string>;

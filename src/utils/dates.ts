/**
 * Shared date helpers for content-collection dates (news, events).
 *
 * Framework-free by design, same reasoning as teams.ts: nothing here imports `astro:content`
 * as a value, so vitest's plain-Vite config can exercise it directly.
 */

/**
 * Formats a Date the way every card and article on the site shows one — bare `YYYY-MM-DD`
 * frontmatter parses as UTC midnight, so formatting in a behind-UTC locale would otherwise
 * render the previous day. `options` lets a caller vary the month style (short for a card,
 * long for an article header) without duplicating the `timeZone: 'UTC'` fix itself.
 */
export function formatUtcDate(
  date: Date,
  options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' },
): string {
  return date.toLocaleDateString('en-US', { ...options, timeZone: 'UTC' });
}

/** Newest-first comparator for anything carrying a `pubDate`, e.g. `posts.sort(byNewest)`. */
export function byNewest<T extends { data: { pubDate: Date } }>(a: T, b: T): number {
  return b.data.pubDate.valueOf() - a.data.pubDate.valueOf();
}

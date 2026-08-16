/**
 * FIRST® trademark styling, per the FIRST Branding & Design Guidelines (FI084, p. 8/20):
 * the marks must always appear in all capitals and italics, with a superscript registered
 * symbol on first use in a heading/title and again on first use in body copy.
 *
 * Matching is case-sensitive on the all-caps token, so ordinary prose ("our first season")
 * and lowercase URLs (firstinspires.org) are never touched. Authors just type FIRST in
 * caps and the mark is styled for them — see rehype-first-marks.mjs for Markdown/MDX.
 */

/** Tokens FIRST owns or co-owns. LEGO gets the same ® treatment but is not italicized. */
export const FIRST_TOKENS = ['FIRST', 'LEGO'] as const;

export type FirstToken = (typeof FIRST_TOKENS)[number];

/** Where a mark sits on the page. Each context earns its own first-use ®. */
export type FirstContext = 'heading' | 'body';

const TOKEN_PATTERN = new RegExp(`\\b(${FIRST_TOKENS.join('|')})\\b`, 'g');

export interface FirstSegment {
  type: 'text' | 'mark';
  value: string;
  /** Only set on `mark` segments. */
  token?: FirstToken;
}

/**
 * Splits arbitrary copy into plain-text and trademark segments. Used by <FirstText /> to
 * style strings that arrive as props (content-collection frontmatter, card labels) where
 * the author can't wrap the mark in markup themselves.
 */
export function tokenizeFirst(text: string): FirstSegment[] {
  const segments: FirstSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index!;
    if (index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, index) });
    }
    segments.push({ type: 'mark', value: match[0], token: match[0] as FirstToken });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Per-render registry of which marks have already taken their ®. Astro's middleware seeds
 * one of these per page render, so `<First />` can place the symbol on first use without
 * every call site tracking it by hand.
 */
export type FirstRegistry = Set<string>;

export function createFirstRegistry(): FirstRegistry {
  return new Set<string>();
}

/**
 * Claims the ® for `token` in `context`, returning true the first time only. Missing
 * registry (a component rendered outside a page request) degrades to no symbol rather
 * than stamping ® on every occurrence.
 */
export function claimRegisteredMark(
  registry: FirstRegistry | undefined,
  token: FirstToken,
  context: FirstContext,
): boolean {
  if (!registry) return false;
  const key = `${token}:${context}`;
  if (registry.has(key)) return false;
  registry.add(key);
  return true;
}

/**
 * Plain-text form for places that can't hold markup — <title>, meta descriptions, OG tags,
 * alt text. Italics are impossible there, so caps plus a ® on first use is as close to the
 * guidelines as the medium allows.
 */
export function firstPlain(text: string): string {
  const claimed = new Set<string>();
  return text.replace(TOKEN_PATTERN, (token) => {
    if (claimed.has(token)) return token;
    claimed.add(token);
    return `${token}®`;
  });
}

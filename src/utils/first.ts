/**
 * FIRST® trademark styling, per FIRST's "Policy on the Use of FIRST Trademarks and
 * Copyrighted Materials" (rev. 04/19/25): word marks get a superscript registered symbol on
 * first use in a heading/title and again on first use in body copy; the FIRST word mark
 * itself must always appear in all capitals and italics (Section III.A.5) — FRC, FTC, and
 * LEGO are separate registered marks in their own right (Attachment A) but that italics
 * requirement is specific to the word "FIRST", so they stay roman.
 *
 * FIRST has separately asked partner sites never to display the FRC/FTC program
 * abbreviations at all — every mention should spell out the full program name instead
 * ("FIRST Robotics Competition" / "FIRST Tech Challenge"). Rather than push that onto every
 * author and template, FRC/FTC are expanded right here: authors keep typing the short token
 * in caps, and it renders as the full name automatically. Only the "FIRST" inside the
 * expansion is the italicized, registered word mark; "Robotics Competition"/"Tech Challenge"
 * is the program's descriptive name and stays roman.
 *
 * Matching is case-sensitive on the all-caps token, so ordinary prose ("our first season")
 * and lowercase URLs (firstinspires.org) are never touched. Authors just type FIRST/FRC/FTC
 * in caps and the mark is styled (and, for FRC/FTC, expanded) for them — see
 * rehype-first-marks.mjs for the Markdown/MDX equivalent, which must stay in sync.
 */

/** Tokens FIRST owns or co-owns. Only FIRST is italicized — see FirstText.astro. */
export const FIRST_TOKENS = ['FIRST', 'FRC', 'FTC', 'LEGO'] as const;

export type FirstToken = (typeof FIRST_TOKENS)[number];

/**
 * FRC/FTC never render as themselves — typing either expands to the FIRST mark followed by
 * this descriptive suffix. Not a FirstToken map entry because the resulting segments carry
 * token 'FIRST', not 'FRC'/'FTC' — see tokenizeFirst.
 */
const PROGRAM_NAME_SUFFIXES: Partial<Record<FirstToken, string>> = {
  FRC: 'Robotics Competition',
  FTC: 'Tech Challenge',
};

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
 *
 * A matched FRC/FTC token becomes two segments — the FIRST mark, then a plain-text suffix —
 * rather than a mark segment of its own, so the bare abbreviation never reaches the page.
 */
export function tokenizeFirst(text: string): FirstSegment[] {
  const segments: FirstSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(TOKEN_PATTERN)) {
    const index = match.index!;
    const matched = match[0] as FirstToken;
    if (index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, index) });
    }

    const suffix = PROGRAM_NAME_SUFFIXES[matched];
    if (suffix) {
      segments.push({ type: 'mark', value: 'FIRST', token: 'FIRST' });
      segments.push({ type: 'text', value: ` ${suffix}` });
    } else {
      segments.push({ type: 'mark', value: matched, token: matched });
    }

    lastIndex = index + matched.length;
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
 * guidelines as the medium allows. FRC/FTC still expand to the full program name here, same
 * as tokenizeFirst — this is the only path some of that text (JSON-LD, meta tags) takes.
 */
export function firstPlain(text: string): string {
  const claimed = new Set<string>();
  return text.replace(TOKEN_PATTERN, (token) => {
    const suffix = PROGRAM_NAME_SUFFIXES[token as FirstToken];
    if (token === 'FIRST' || suffix) {
      const mark = claimed.has('FIRST') ? 'FIRST' : 'FIRST®';
      claimed.add('FIRST');
      return suffix ? `${mark} ${suffix}` : mark;
    }
    if (claimed.has(token)) return token;
    claimed.add(token);
    return `${token}®`;
  });
}

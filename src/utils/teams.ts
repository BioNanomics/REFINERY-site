/**
 * Team helpers: URL construction, ordering, and cross-references.
 *
 * Framework-free by design. Nothing here imports `astro:content` as a VALUE — only as a
 * type — because vitest.config.ts is plain Vite with no Astro plugin, so a value import
 * from a virtual module would break the whole suite. Every function takes the structural
 * shape it actually needs instead of `CollectionEntry<'teams'>`, which is also what makes
 * the tests readable: see src/utils/people.ts and events.ts for the same pattern.
 */

import { withBase } from './base';

export type TeamProgram = 'FRC' | 'FTC';

/**
 * The minimum shape these helpers read. A real `CollectionEntry<'teams'>` satisfies it
 * structurally, so call sites pass entries straight through with no cast.
 */
export interface TeamLike {
  id: string;
  data: {
    number: string;
    program: TeamProgram;
    featured?: boolean;
    draft?: boolean;
  };
}

/**
 * Full program names, keyed by the schema's internal FRC/FTC values.
 *
 * Lives here rather than in TeamCard because the card and the detail page both need it and
 * two copies would be free to drift. It also carries a trademark obligation: the FIRST
 * guidelines (p. 32) require team identification to appear in conjunction with the program
 * name, so anywhere a bare number is shown, this is what goes beside it.
 */
export const PROGRAM_NAMES: Record<TeamProgram, string> = {
  FRC: 'FIRST Robotics Competition',
  FTC: 'FIRST Tech Challenge',
};

/**
 * URL slug for a team: lowercase program plus the bare number — `frc1501`, `ftc25638`.
 *
 * The program prefix is load-bearing, not decoration. FRC and FTC number their teams
 * independently, so a number alone is not a unique key and never will be: today's rosters
 * happen not to overlap (FRC tops out around 10434, FTC starts at 22331), but nothing
 * enforces that. A bare-number route would let a future collision silently overwrite one
 * team's page during a static build, with no error. The prefix makes that impossible rather
 * than something to guard against at runtime.
 */
export function teamSlug(team: TeamLike): string {
  return `${team.data.program.toLowerCase()}${team.data.number}`;
}

/** Root-relative path to a team's detail page, routed through withBase() like every link. */
export function teamPath(team: TeamLike): string {
  return withBase(`teams/${teamSlug(team)}/`);
}

/**
 * Numeric order, FRC-style — 1501 before 10172, which a plain string sort gets wrong.
 * Previously hand-rolled in three separate files (the teams listing, RandomTeamsTeaser,
 * and NewsGrid's chip builder); this is the one copy.
 */
export function sortByNumber(a: TeamLike, b: TeamLike): number {
  return Number(a.data.number) - Number(b.data.number);
}

/** Featured teams first, then numeric order within each group. */
export function byFeaturedThenNumber(a: TeamLike, b: TeamLike): number {
  return Number(Boolean(b.data.featured)) - Number(Boolean(a.data.featured)) || sortByNumber(a, b);
}

/**
 * Resolve a bare team number to its entry — what news `teamRefs` carry, and what the
 * "Teams in this story" chips on a news page need to build a link.
 *
 * Returns undefined on an AMBIGUOUS match, not a guess. Numbers are unique per program but
 * not across programs, so if an FRC and an FTC team ever share one, there is no correct
 * answer to "which team is 10172?" and picking either would silently link a story to the
 * wrong team. Callers treat undefined the same as "no such team" and render plain text.
 *
 * Note this is about REFERENCES, not URLs — teamSlug() already made those collision-proof.
 */
export function teamByNumber<T extends TeamLike>(teams: T[], number: string): T | undefined {
  const matches = teams.filter((team) => team.data.number === number);
  return matches.length === 1 ? matches[0] : undefined;
}

/**
 * Previous and next team within the SAME program, in numeric order.
 *
 * Same-program only because the pairing is what a reader expects: browsing the FRC teams
 * and landing on an FTC team mid-sequence reads as a bug. Ends return null rather than
 * wrapping — a wrap-around makes it impossible to tell the first team from the last.
 */
export function teamNeighbors<T extends TeamLike>(
  teams: T[],
  current: T,
): { prev: T | null; next: T | null } {
  const siblings = teams
    .filter((team) => team.data.program === current.data.program && !team.data.draft)
    .sort(sortByNumber);
  const index = siblings.findIndex((team) => team.id === current.id);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: siblings[index - 1] ?? null,
    next: siblings[index + 1] ?? null,
  };
}

/**
 * Sibling teams, as a symmetric relationship.
 *
 * `relatedTeams` is authored on one side or both, and the result is the same either way:
 * this unions a team's own list with every team that lists IT. Two entries describing the
 * same pairing would otherwise be free to disagree — FRC 8742 claiming FTC 25638 as a
 * sibling while 25638 says nothing — and the pages would contradict each other. Authoring
 * one direction is enough, and authoring both is harmless.
 *
 * Self-references and drafts are dropped: a team is not its own sibling, and a draft has no
 * page to link to.
 */
export function relatedTeamsFor<T extends TeamLike & { data: { relatedTeams?: { id: string }[] } }>(
  team: T,
  all: T[],
): T[] {
  const declared = new Set((team.data.relatedTeams ?? []).map((ref) => ref.id));
  return all
    .filter((candidate) => {
      if (candidate.id === team.id || candidate.data.draft) return false;
      const reciprocal = (candidate.data.relatedTeams ?? []).some((ref) => ref.id === team.id);
      return declared.has(candidate.id) || reciprocal;
    })
    .sort(sortByNumber);
}

/**
 * Parse a `community` string into the structured pieces schema.org's PostalAddress wants.
 *
 * This parses DISPLAY COPY, which is brittle, and that is acceptable only because of how it
 * fails: anything that doesn't match returns undefined and the JSON-LD simply omits
 * `location`. That is src/utils/schema.ts's "absent beats wrong" applied literally — a
 * missing optional property costs a little rich-result eligibility, a mis-parsed one is a
 * false statement about where a real team is based.
 *
 * Deliberately strict: exactly "Locality, XX" with a two-letter region. "Northeast Indiana"
 * is a region, not a city, and "Fort Wayne, Indiana" is a format we don't currently produce
 * — both are better dropped than guessed at. If the format ever varies, the clean upgrade is
 * explicit `city`/`state` fields on the schema, not a cleverer regex here.
 */
export function parseCommunity(
  community: string,
): { addressLocality: string; addressRegion: string } | undefined {
  const match = community.trim().match(/^(.+?),\s*([A-Z]{2})$/);
  if (!match) return undefined;
  return { addressLocality: match[1].trim(), addressRegion: match[2] };
}

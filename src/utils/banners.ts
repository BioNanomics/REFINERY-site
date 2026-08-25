/**
 * Which awards earn a hanging banner, and what color it is.
 *
 * PROVENANCE, because this is the file someone will second-guess: FIRST does not publish a
 * list of banner-earning awards. Their FRC awards page never uses the word "banner" at all.
 * The rules below came from The REFINERY, who run these teams, and they are the authority
 * for this site.
 *
 * The de-facto community reference — The Blue Alliance's `BLUE_BANNER_AWARDS` set — is
 * BROADER than what's encoded here. It also counts Chairman's Finalist, Woodie Flowers, and
 * two 2021-only at-home-season awards, and it ignores event type entirely, so an offseason
 * win lands in the same bucket as an Einstein win. If you go looking for a canonical list
 * you will find TBA's and assume it is the standard. It is not the one this site uses.
 * Widening this table is a decision to make deliberately, not a bug to fix.
 *
 * Deliberately excluded, and worth naming because teams commonly call them banner awards:
 * Engineering Inspiration and Rookie All-Star. Under the rules above they earn no banner.
 */

import type { AwardTypeKey, EventLevel, TeamProgramKey } from './awards';

/** FRC hangs blue; FTC hangs orange. Two systems, not one with a color variant. */
export type BannerColor = 'blue' | 'orange';

/**
 * Event levels that never produce a banner regardless of what was won. Offseason events
 * run the same game with the same awards, so name-based classification alone would happily
 * hand out banners for them.
 */
export const NON_BANNER_EVENT_LEVELS: ReadonlySet<EventLevel> = new Set(['offseason']);

/**
 * FTC banners require a premier event. A qualifier or league-meet Inspire win is a real
 * achievement and still renders in the awards list — it just doesn't hang.
 *
 * Note this reads "premier event" as governing BOTH halves of the FTC rule (winning
 * alliance and Inspire 1st). That is the narrower reading, chosen because under-claiming a
 * banner is recoverable and over-claiming one is a public misstatement about someone
 * else's team. If Inspire 1st hangs at any level, delete the level check below.
 */
const FTC_BANNER_EVENT_LEVELS: ReadonlySet<EventLevel> = new Set(['premier', 'championship']);

export interface BannerInput {
  program: TeamProgramKey;
  typeKey: AwardTypeKey;
  /** For a judged award this is a rank; for Winner/Finalist it's an alliance seat. */
  placement?: number;
  placementMeaning?: 'rank' | 'alliance-seat';
  eventLevel: EventLevel;
}

/**
 * The banner an award earns, or null for the great majority that earn none.
 *
 * Classification keys on `typeKey`, never on the award's display name. FIRST renamed the
 * Chairman's Award to the FIRST Impact Award for the 2023 season, and both wordings appear
 * in real historical records — an entry from 2016 carries `name: "Chairman's Award"` with
 * `typeKey: 'IMPACT'`, and must classify identically to a 2024 one. String matching on the
 * name would silently drop every pre-2023 banner.
 */
export function bannerFor({
  program,
  typeKey,
  placement,
  placementMeaning,
  eventLevel,
}: BannerInput): BannerColor | null {
  if (NON_BANNER_EVENT_LEVELS.has(eventLevel)) return null;

  if (program === 'FRC') {
    // The winning alliance's seat number is irrelevant — every team on it hangs a banner,
    // which is exactly why placementMeaning has to be stored rather than inferred.
    return typeKey === 'WINNER' || typeKey === 'IMPACT' ? 'blue' : null;
  }

  if (!FTC_BANNER_EVENT_LEVELS.has(eventLevel)) return null;
  if (typeKey === 'WINNER') return 'orange';
  // Inspire is judged, so here the number IS a rank and only 1st place hangs. Guarding on
  // placementMeaning stops an alliance seat from ever being read as a podium finish.
  if (typeKey === 'INSPIRE' && placementMeaning === 'rank' && placement === 1) return 'orange';
  return null;
}

/** Resolves a curated `banner` override against the derived default. */
export function resolveBanner(
  input: BannerInput & { banner?: boolean },
): BannerColor | null {
  const derived = bannerFor(input);
  if (input.banner === undefined) return derived;
  // An override can suppress a banner, or assert one the table doesn't derive. The asserted
  // color still follows the program — there is no such thing as an orange FRC banner.
  if (input.banner === false) return null;
  return input.program === 'FRC' ? 'blue' : 'orange';
}

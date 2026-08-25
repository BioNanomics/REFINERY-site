/**
 * Award vocabulary, ordering, and label formatting.
 *
 * The enums here are the single source of truth: src/content.config.ts builds its zod
 * schema from them, the same way the news collection builds its category enum from
 * src/utils/news-categories.ts. Add an award type here, not there.
 *
 * Framework-free — no value import from `astro:content`, since the test suite runs on
 * plain Vite with no Astro plugin.
 */

export type TeamProgramKey = 'FRC' | 'FTC';

/**
 * Normalized award identifiers, deliberately decoupled from display wording.
 *
 * FIRST rewords awards between seasons (Chairman's Award -> FIRST Impact Award for 2023)
 * and FTC awards carry rotating sponsor prefixes ("Rockwell Collins Innovate Award",
 * "PTC Design Award"). An entry stores the season's exact wording in `name` for display and
 * one of these keys for logic, so classification survives a rename and a page still shows
 * what the award was actually called at the time.
 *
 * Not exhaustive — it covers what these teams have won and what banner classification
 * needs. Adding a key is a one-line change here plus a rebuild.
 */
export const AWARD_TYPE_KEYS = [
  // Competition results, both programs. `placement` on these is an ALLIANCE SEAT.
  'WINNER',
  'FINALIST',
  // FRC judged awards.
  'IMPACT', // Chairman's Award before the 2023 season — same award, same key.
  'ENGINEERING_INSPIRATION',
  'ROOKIE_ALL_STAR',
  'ROOKIE_INSPIRATION',
  'RISING_ALL_STAR',
  'WOODIE_FLOWERS',
  'INDUSTRIAL_DESIGN',
  'EXCELLENCE_IN_ENGINEERING',
  'INNOVATION_IN_CONTROL',
  'QUALITY',
  'CREATIVITY',
  'GRACIOUS_PROFESSIONALISM',
  'IMAGERY',
  'SAFETY',
  'AUTONOMOUS',
  'JUDGES_AWARD', // FRC's catch-all judges' award — not FTC's JUDGES_CHOICE, different program.
  // FTC judged awards.
  'INSPIRE',
  'THINK',
  'CONNECT',
  'INNOVATE',
  'DESIGN',
  'MOTIVATE',
  'CONTROL',
  'PROMOTE',
  'COMPASS',
  'SUSTAIN',
  'JUDGES_CHOICE',
  // Individual awards. Never a team banner, whatever the event.
  'DEANS_LIST',
  'VOLUNTEER_OF_THE_YEAR',
] as const;

export type AwardTypeKey = (typeof AWARD_TYPE_KEYS)[number];

/**
 * Where an award was won. Required on every award because banner eligibility depends on it:
 * offseason events run the same game and hand out the same awards, so without this an
 * offseason win classifies identically to a championship one.
 *
 * Covers both programs' vocabularies in one list rather than splitting by program — a
 * per-program union would need a discriminated schema for a distinction that only matters
 * inside one `if`.
 */
export const EVENT_LEVELS = [
  // FRC
  'district',
  'district-championship',
  'regional',
  // FTC
  'league',
  'qualifier',
  'premier',
  // Both
  'championship',
  'offseason',
] as const;

export type EventLevel = (typeof EVENT_LEVELS)[number];

export interface TeamAward {
  /** Verbatim, as FIRST worded it that season. */
  name: string;
  typeKey: AwardTypeKey;
  year: number;
  /** Verbatim event name. */
  event: string;
  eventLevel: EventLevel;
  placement?: number;
  placementMeaning?: 'rank' | 'alliance-seat';
  source: string;
  banner?: boolean;
  bannerNote?: string;
}

/**
 * Canonical, sponsor-free display name for each award type — what a tally chip calls it.
 *
 * A single award type's `name` varies year to year (sponsor prefixes rotate: "Quality Award
 * sponsored by Motorola" one season, "...by Motorola Solutions Foundation" the next), so
 * counting by `name` would fracture one award into several rows. This is the stable label
 * that groups them back into one. WINNER and FINALIST read as alliance results here — same
 * wording awardLabel() already uses for an alliance-seat award — because every WINNER/
 * FINALIST entry in this schema is one; see the interface comment above.
 */
export const AWARD_TYPE_LABELS: Record<AwardTypeKey, string> = {
  WINNER: 'Winning Alliance',
  FINALIST: 'Finalist Alliance',
  IMPACT: 'Impact Award',
  ENGINEERING_INSPIRATION: 'Engineering Inspiration Award',
  ROOKIE_ALL_STAR: 'Rookie All Star Award',
  ROOKIE_INSPIRATION: 'Rookie Inspiration Award',
  RISING_ALL_STAR: 'Rising All-Star Award',
  WOODIE_FLOWERS: 'Woodie Flowers Award',
  INDUSTRIAL_DESIGN: 'Industrial Design Award',
  EXCELLENCE_IN_ENGINEERING: 'Excellence in Engineering Award',
  INNOVATION_IN_CONTROL: 'Innovation in Control Award',
  QUALITY: 'Quality Award',
  CREATIVITY: 'Creativity Award',
  GRACIOUS_PROFESSIONALISM: 'Gracious Professionalism Award',
  IMAGERY: 'Imagery Award',
  SAFETY: 'Safety Award',
  AUTONOMOUS: 'Autonomous Award',
  JUDGES_AWARD: "Judges' Award",
  INSPIRE: 'Inspire Award',
  THINK: 'Think Award',
  CONNECT: 'Connect Award',
  INNOVATE: 'Innovate Award',
  DESIGN: 'Design Award',
  MOTIVATE: 'Motivate Award',
  CONTROL: 'Control Award',
  PROMOTE: 'Promote Award',
  COMPASS: 'Compass Award',
  SUSTAIN: 'Sustain Award',
  JUDGES_CHOICE: "Judges' Choice Award",
  DEANS_LIST: "Dean's List",
  VOLUNTEER_OF_THE_YEAR: 'Volunteer of the Year',
};

/** "Award" -> "Awards", "Alliance" -> "Alliances". Everything else is left singular — a
 *  count above 1 is rare for the two individual-honor labels, and forcing a plural onto
 *  "Dean's List" or "Volunteer of the Year" reads worse than just repeating the count. */
function pluralizeAwardLabel(label: string, count: number): string {
  if (count === 1) return label;
  if (label.endsWith('Award') || label.endsWith('Alliance')) return `${label}s`;
  return label;
}

export interface AwardSummaryEntry {
  typeKey: AwardTypeKey;
  label: string;
  count: number;
}

/**
 * How many of each award type a team has won, most-won first — the "12 Winning Alliances, 6
 * Autonomous Awards" tally that sits above the full year-by-year list. Ties break
 * alphabetically so the row order is stable across rebuilds.
 */
export function summarizeAwards(awards: TeamAward[]): AwardSummaryEntry[] {
  const counts = new Map<AwardTypeKey, number>();
  for (const award of awards) {
    counts.set(award.typeKey, (counts.get(award.typeKey) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([typeKey, count]) => ({ typeKey, label: pluralizeAwardLabel(AWARD_TYPE_LABELS[typeKey], count), count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 4 -> "4th", 11 -> "11th". */
export function ordinal(n: number): string {
  const rem100 = n % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10] ?? 'th';
  return `${n}${suffix}`;
}

/**
 * The award's display label.
 *
 * This function exists because `placement` means two entirely different things depending on
 * the award, and getting it wrong produces confident nonsense on a real team's page:
 *
 *   - For a judged award it is a rank. "3rd place Inspire Award" is correct.
 *   - For Winner/Finalist it is the team's SEAT on the alliance. FTC 22331 genuinely has
 *     `Winner, place 2` and `Winner, place 3` in its record; rendering those as "2nd place
 *     Winner" and "3rd place Winner" would be flatly wrong — both are wins. The seat number
 *     is captured data with no display meaning, so it is dropped here rather than shown.
 *
 * A judged 1st place keeps its ordinal. "Inspire Award" alone reads as any Inspire finish,
 * and 1st is the one that hangs a banner, so the distinction is worth the two extra words.
 */
export function awardLabel(award: TeamAward): string {
  if (award.placementMeaning === 'alliance-seat') {
    return award.typeKey === 'FINALIST' ? 'Finalist Alliance' : 'Winning Alliance';
  }
  if (award.placementMeaning === 'rank' && award.placement !== undefined) {
    return `${ordinal(award.placement)} place ${award.name}`;
  }
  return award.name;
}

/**
 * One-line citation: label, event, year. Feeds the schema.org `award` property, so the
 * markup and the visible card are derived from the same function and cannot drift — the
 * same argument MarketingLayout's `breadcrumbs` prop already makes for the trail and its
 * BreadcrumbList.
 */
export function awardCitation(award: TeamAward): string {
  return `${awardLabel(award)}, ${award.event}, ${award.year}`;
}

/** Newest first, then by label, so a year's awards land in a stable order. */
export function sortAwards(awards: TeamAward[]): TeamAward[] {
  return [...awards].sort(
    (a, b) => b.year - a.year || awardLabel(a).localeCompare(awardLabel(b)),
  );
}

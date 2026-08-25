/**
 * Merges a team's awards, robots, and season records into one row per year — what the
 * collapsible "Team History" accordion on a team's page renders one `<details>` per.
 *
 * Framework-free for the same reason as src/utils/teams.ts: the test suite runs on plain
 * Vite with no Astro plugin, so nothing here may import `astro:content` as a value. `TRobot`
 * is generic rather than a concrete type because a robot's `image` field is an Astro-specific
 * `ImageMetadata` at the call site — this file only ever reads `.year` off it.
 */
import type { EventLevel, TeamAward } from './awards';

export interface SeasonEvent {
  name: string;
  eventLevel: EventLevel;
  source: string;
}

export interface SeasonRecord {
  wins: number;
  losses: number;
  ties: number;
}

export interface TeamSeason {
  year: number;
  events: SeasonEvent[];
  record?: SeasonRecord;
}

export interface TeamYear<TRobot> {
  year: number;
  awards: TeamAward[];
  robots: TRobot[];
  events: SeasonEvent[];
  record?: SeasonRecord;
}

/**
 * One row per year that has ANYTHING on record — an award, a named robot, or season data —
 * newest first. A year with, say, only a robot name and no award still gets a row, so the
 * accordion never silently drops a season a team actually played.
 */
export function groupTeamHistory<TRobot extends { year: number }>(
  awards: TeamAward[],
  robots: TRobot[],
  seasons: TeamSeason[],
): TeamYear<TRobot>[] {
  const years = new Map<number, TeamYear<TRobot>>();
  const bucket = (year: number): TeamYear<TRobot> => {
    const existing = years.get(year);
    if (existing) return existing;
    const created: TeamYear<TRobot> = { year, awards: [], robots: [], events: [] };
    years.set(year, created);
    return created;
  };

  for (const award of awards) bucket(award.year).awards.push(award);
  for (const robot of robots) bucket(robot.year).robots.push(robot);
  for (const season of seasons) {
    const entry = bucket(season.year);
    entry.events = season.events;
    entry.record = season.record;
  }

  return [...years.values()].sort((a, b) => b.year - a.year);
}

/** "12-3-1" — the plain W-L-T shorthand FIRST results pages themselves use. */
export function formatRecord(record: SeasonRecord): string {
  return `${record.wins}-${record.losses}-${record.ties}`;
}

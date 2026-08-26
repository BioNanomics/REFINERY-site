import { describe, expect, it } from 'vitest';
import { formatRecord, groupTeamHistory, type TeamSeason } from '../../src/utils/teamHistory';
import type { TeamAward } from '../../src/utils/awards';

const award = (over: Partial<TeamAward> = {}): TeamAward => ({
  name: 'Winning Alliance',
  typeKey: 'WINNER',
  year: 2024,
  event: 'Indiana State Championship',
  eventLevel: 'district-championship',
  source: 'https://example.com/results',
  ...over,
});

const robot = (year: number, name = 'Test Bot') => ({ year, name });

describe('groupTeamHistory', () => {
  it('returns nothing for a team with no history', () => {
    expect(groupTeamHistory([], [], [])).toEqual([]);
  });

  it('buckets awards, robots, and seasons into the same year row', () => {
    const seasons: TeamSeason[] = [
      {
        year: 2024,
        events: [{ name: 'Indiana State Championship', eventLevel: 'district-championship', source: 'https://example.com/event' }],
        record: { wins: 10, losses: 2, ties: 0 },
      },
    ];
    const grouped = groupTeamHistory([award({ year: 2024 })], [robot(2024)], seasons);
    expect(grouped).toHaveLength(1);
    expect(grouped[0]).toMatchObject({
      year: 2024,
      awards: [expect.objectContaining({ year: 2024 })],
      robots: [expect.objectContaining({ year: 2024 })],
      events: [expect.objectContaining({ name: 'Indiana State Championship' })],
      record: { wins: 10, losses: 2, ties: 0 },
    });
  });

  it('gives a year a row even when only one of the three sources mentions it', () => {
    // A season with a named robot but no award, and a season with only a season record and
    // no award or robot, must both still surface — nothing here should require an award.
    const grouped = groupTeamHistory(
      [award({ year: 2023 })],
      [robot(2022)],
      [{ year: 2021, events: [], record: { wins: 1, losses: 1, ties: 0 } }],
    );
    expect(grouped.map((g) => g.year)).toEqual([2023, 2022, 2021]);
    expect(grouped.find((g) => g.year === 2022)?.awards).toEqual([]);
    expect(grouped.find((g) => g.year === 2021)?.robots).toEqual([]);
  });

  it('carries district rank, points, and their source through onto the year row', () => {
    const grouped = groupTeamHistory(
      [],
      [],
      [
        {
          year: 2025,
          events: [],
          districtRank: 6,
          districtPoints: 250,
          districtRankSource: 'https://example.com/rank',
        },
      ],
    );
    expect(grouped[0]).toMatchObject({
      districtRank: 6,
      districtPoints: 250,
      districtRankSource: 'https://example.com/rank',
    });
  });

  it('leaves district rank undefined for a season that has none (pre-district era, or a COVID season with no standing)', () => {
    const grouped = groupTeamHistory([], [], [{ year: 2005, events: [] }]);
    expect(grouped[0].districtRank).toBeUndefined();
  });

  it('sorts newest year first', () => {
    const grouped = groupTeamHistory(
      [award({ year: 2019 }), award({ year: 2024 }), award({ year: 2021 })],
      [],
      [],
    );
    expect(grouped.map((g) => g.year)).toEqual([2024, 2021, 2019]);
  });

  it('does not mutate the input arrays', () => {
    const awards = [award({ year: 2022 }), award({ year: 2025 })];
    groupTeamHistory(awards, [], []);
    expect(awards.map((a) => a.year)).toEqual([2022, 2025]);
  });
});

describe('formatRecord', () => {
  it('joins wins-losses-ties with hyphens', () => {
    expect(formatRecord({ wins: 12, losses: 3, ties: 1 })).toBe('12-3-1');
  });

  it('handles a winless record the same way', () => {
    expect(formatRecord({ wins: 0, losses: 5, ties: 0 })).toBe('0-5-0');
  });
});

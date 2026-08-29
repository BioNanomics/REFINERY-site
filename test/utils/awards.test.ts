import { describe, expect, it } from 'vitest';
import {
  AWARD_TYPE_KEYS,
  AWARD_TYPE_LABELS,
  awardCitation,
  awardLabel,
  ordinal,
  sortAwards,
  summarizeAwards,
  type TeamAward,
} from '../../src/utils/awards';

const award = (over: Partial<TeamAward> = {}): TeamAward => ({
  name: 'Inspire Award',
  typeKey: 'INSPIRE',
  year: 2025,
  event: 'Indiana State Championship',
  eventLevel: 'premier',
  source: 'https://example.com/results',
  ...over,
});

describe('ordinal', () => {
  it('uses the right suffix for the common cases', () => {
    expect([1, 2, 3, 4, 21].map(ordinal)).toEqual(['1st', '2nd', '3rd', '4th', '21st']);
  });

  it('handles the teens, which do not follow the last-digit rule', () => {
    expect([11, 12, 13].map(ordinal)).toEqual(['11th', '12th', '13th']);
  });
});

describe('awardLabel', () => {
  it('drops the alliance seat entirely for a win', () => {
    // FTC 22331 really does have `Winner, place 3` on its record. "3rd place Winner" would
    // be nonsense — every seat on that alliance won.
    expect(
      awardLabel(award({ typeKey: 'WINNER', name: 'Winning Alliance', placement: 3, placementMeaning: 'alliance-seat' })),
    ).toBe('Winning Alliance');
  });

  it('drops the alliance seat for a finalist too', () => {
    expect(
      awardLabel(award({ typeKey: 'FINALIST', name: 'Finalist', placement: 2, placementMeaning: 'alliance-seat' })),
    ).toBe('Finalist Alliance');
  });

  it('keeps the ordinal for a judged placement', () => {
    expect(awardLabel(award({ placement: 3, placementMeaning: 'rank' }))).toBe(
      '3rd place Inspire Award',
    );
  });

  it('keeps the ordinal on a judged 1st place, since that is the one that hangs', () => {
    expect(awardLabel(award({ placement: 1, placementMeaning: 'rank' }))).toBe(
      '1st place Inspire Award',
    );
  });

  it('uses the name verbatim when there is no placement', () => {
    expect(awardLabel(award({ name: "Chairman's Award", typeKey: 'IMPACT' }))).toBe(
      "Chairman's Award",
    );
  });
});

describe('awardCitation', () => {
  it('joins label, event, and year for the JSON-LD award property', () => {
    expect(
      awardCitation(award({ typeKey: 'WINNER', name: 'Winning Alliance', placement: 2, placementMeaning: 'alliance-seat', year: 2024, event: 'Indiana State Championship' })),
    ).toBe('Winning Alliance, Indiana State Championship, 2024');
  });
});

describe('AWARD_TYPE_LABELS', () => {
  it('has a label for every key in AWARD_TYPE_KEYS', () => {
    // The Record type already enforces this at compile time, but a runtime check survives
    // a future refactor to a looser type (e.g. Partial<Record<...>>) that would silently
    // reopen the hole — summarizeAwards() would otherwise render "undefined" on a tally chip.
    for (const key of AWARD_TYPE_KEYS) {
      expect(AWARD_TYPE_LABELS[key], `missing label for ${key}`).toBeTypeOf('string');
      expect(AWARD_TYPE_LABELS[key].length, `empty label for ${key}`).toBeGreaterThan(0);
    }
  });

  it('reads WINNER and FINALIST as alliance results, not literal award names', () => {
    // Matches the wording awardLabel() itself uses for an alliance-seat award — the two
    // must never drift apart, or the tally chip and the award row would name the same
    // thing two different ways on the same page.
    expect(AWARD_TYPE_LABELS.WINNER).toBe('Winning Alliance');
    expect(AWARD_TYPE_LABELS.FINALIST).toBe('Finalist Alliance');
  });
});

describe('summarizeAwards', () => {
  it('returns an empty array for a team with no awards', () => {
    expect(summarizeAwards([])).toEqual([]);
  });

  it('groups by typeKey, not by the literal (sponsor-varying) name', () => {
    // Real case: T.H.R.U.S.T.'s Quality Award carries a different sponsor string almost
    // every year it was won. Grouping by `name` would fracture one award into several rows.
    const summary = summarizeAwards([
      award({ typeKey: 'QUALITY', name: 'Quality Award sponsored by Motorola' }),
      award({ typeKey: 'QUALITY', name: 'Quality Award sponsored by Motorola Solutions Foundation' }),
    ]);
    expect(summary).toEqual([{ typeKey: 'QUALITY', label: 'Quality Awards', count: 2 }]);
  });

  it('keeps a singular label at a count of one', () => {
    expect(summarizeAwards([award({ typeKey: 'WINNER' })])).toEqual([
      { typeKey: 'WINNER', label: 'Winning Alliance', count: 1 },
    ]);
  });

  it('pluralizes an "Award" or "Alliance" label above one, but leaves other labels alone', () => {
    const summary = summarizeAwards([
      award({ typeKey: 'FINALIST' }),
      award({ typeKey: 'FINALIST' }),
      award({ typeKey: 'DEANS_LIST' }),
      award({ typeKey: 'DEANS_LIST' }),
    ]);
    expect(summary).toContainEqual({ typeKey: 'FINALIST', label: 'Finalist Alliances', count: 2 });
    // "Dean's List" has no natural plural noun to add an "s" to — repeating the count
    // reads better than a forced "Dean's Lists".
    expect(summary).toContainEqual({ typeKey: 'DEANS_LIST', label: "Dean's List", count: 2 });
  });

  it('sorts most-won first, ties broken alphabetically by label', () => {
    const summary = summarizeAwards([
      award({ typeKey: 'SAFETY' }),
      award({ typeKey: 'QUALITY' }),
      award({ typeKey: 'WINNER' }),
      award({ typeKey: 'WINNER' }),
    ]);
    expect(summary.map((entry) => entry.typeKey)).toEqual(['WINNER', 'QUALITY', 'SAFETY']);
  });
});

describe('sortAwards', () => {
  it('orders newest first', () => {
    const sorted = sortAwards([award({ year: 2022 }), award({ year: 2025 }), award({ year: 2024 })]);
    expect(sorted.map((a) => a.year)).toEqual([2025, 2024, 2022]);
  });

  it('does not mutate the input', () => {
    const input = [award({ year: 2022 }), award({ year: 2025 })];
    sortAwards(input);
    expect(input.map((a) => a.year)).toEqual([2022, 2025]);
  });
});

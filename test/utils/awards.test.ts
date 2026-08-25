import { describe, expect, it } from 'vitest';
import {
  awardCitation,
  awardLabel,
  ordinal,
  sortAwards,
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

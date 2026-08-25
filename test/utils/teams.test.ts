import { describe, expect, it } from 'vitest';
import {
  PROGRAM_NAMES,
  byFeaturedThenNumber,
  parseCommunity,
  sortByNumber,
  teamByNumber,
  teamNeighbors,
  relatedTeamsFor,
  teamPath,
  teamSlug,
  type TeamLike,
} from '../../src/utils/teams';

// These helpers read only id/number/program/featured/draft, so a minimal stand-in for
// CollectionEntry<'teams'> is enough — same approach as test/utils/people.test.ts.
function team(
  number: string,
  program: 'FRC' | 'FTC' = 'FRC',
  extra: { featured?: boolean; draft?: boolean; id?: string } = {},
): TeamLike {
  const { id, ...flags } = extra;
  return {
    id: id ?? `${program.toLowerCase()}-${number}-test`,
    data: { number, program, ...flags },
  };
}

describe('PROGRAM_NAMES', () => {
  it('spells out both programs in full', () => {
    expect(PROGRAM_NAMES.FRC).toBe('FIRST Robotics Competition');
    expect(PROGRAM_NAMES.FTC).toBe('FIRST Tech Challenge');
  });
});

describe('teamSlug', () => {
  it('lowercases the program and appends the bare number', () => {
    expect(teamSlug(team('1501', 'FRC'))).toBe('frc1501');
    expect(teamSlug(team('25638', 'FTC'))).toBe('ftc25638');
  });

  it('keeps teams sharing a number in different programs distinct', () => {
    // The whole reason the slug carries a program prefix: without it these two collide on
    // one static path and one of them silently never gets built.
    expect(teamSlug(team('10172', 'FRC'))).not.toBe(teamSlug(team('10172', 'FTC')));
  });
});

describe('teamPath', () => {
  it('produces a root-absolute, trailing-slash path', () => {
    expect(teamPath(team('1501', 'FRC'))).toBe('/teams/frc1501/');
  });
});

describe('sortByNumber', () => {
  it('orders numerically, not lexically', () => {
    // The case a string sort gets wrong: "10172" sorts before "1501" alphabetically.
    const sorted = [team('10172'), team('1501'), team('9119')].sort(sortByNumber);
    expect(sorted.map((t) => t.data.number)).toEqual(['1501', '9119', '10172']);
  });
});

describe('byFeaturedThenNumber', () => {
  it('lifts featured teams above the rest, keeping numeric order within each group', () => {
    const sorted = [
      team('9119'),
      team('10434', 'FRC', { featured: true }),
      team('1501', 'FRC', { featured: true }),
      team('4982'),
    ].sort(byFeaturedThenNumber);
    expect(sorted.map((t) => t.data.number)).toEqual(['1501', '10434', '4982', '9119']);
  });
});

describe('teamByNumber', () => {
  const roster = [team('1501', 'FRC'), team('25638', 'FTC')];

  it('resolves a number to its entry', () => {
    expect(teamByNumber(roster, '1501')?.data.program).toBe('FRC');
  });

  it('returns undefined for a number no team holds', () => {
    expect(teamByNumber(roster, '9999')).toBeUndefined();
  });

  it('returns undefined rather than guessing when two programs share a number', () => {
    // The ambiguity that motivated the program-prefixed slug. A news story tagged "10172"
    // has no correct resolution here, so the caller renders plain text instead of a link
    // to whichever entry happened to come first.
    const colliding = [team('10172', 'FRC'), team('10172', 'FTC')];
    expect(teamByNumber(colliding, '10172')).toBeUndefined();
  });
});

describe('teamNeighbors', () => {
  const roster = [
    team('1501', 'FRC'),
    team('4982', 'FRC'),
    team('9119', 'FRC'),
    team('22331', 'FTC'),
    team('25638', 'FTC'),
  ];

  it('returns the surrounding teams in numeric order', () => {
    const { prev, next } = teamNeighbors(roster, roster[1]);
    expect(prev?.data.number).toBe('1501');
    expect(next?.data.number).toBe('9119');
  });

  it('stops at the first team rather than wrapping', () => {
    expect(teamNeighbors(roster, roster[0]).prev).toBeNull();
  });

  it('stops at the last team of the program rather than crossing into the other one', () => {
    // 9119 is the last FRC team; the next entry by raw number would be FTC 22331.
    const { next } = teamNeighbors(roster, roster[2]);
    expect(next).toBeNull();
  });

  it('never crosses programs when stepping backwards either', () => {
    expect(teamNeighbors(roster, roster[3]).prev).toBeNull();
  });

  it('skips drafts, which have no page to link to', () => {
    const withDraft = [
      team('1501', 'FRC'),
      team('4982', 'FRC', { draft: true }),
      team('9119', 'FRC'),
    ];
    expect(teamNeighbors(withDraft, withDraft[0]).next?.data.number).toBe('9119');
  });

  it('returns nulls for a team outside the roster', () => {
    expect(teamNeighbors(roster, team('8103', 'FRC'))).toEqual({ prev: null, next: null });
  });
});

describe('relatedTeamsFor', () => {
  // relatedTeamsFor reads one field beyond TeamLike, so these stand-ins carry it.
  const rel = (id: string, number: string, program: 'FRC' | 'FTC', related: string[] = [], draft = false) => ({
    id,
    data: { number, program, draft, relatedTeams: related.map((r) => ({ id: r })) },
  });

  it('resolves a pairing declared on this team', () => {
    const a = rel('frc-8742', '8742', 'FRC', ['ftc-25638']);
    const b = rel('ftc-25638', '25638', 'FTC');
    expect(relatedTeamsFor(a, [a, b]).map((t) => t.id)).toEqual(['ftc-25638']);
  });

  it('resolves the same pairing from the other side, which declared nothing', () => {
    // The point of the union: authoring one direction is enough, so two entries describing
    // the same pairing can never disagree about whether it exists.
    const a = rel('frc-8742', '8742', 'FRC', ['ftc-25638']);
    const b = rel('ftc-25638', '25638', 'FTC');
    expect(relatedTeamsFor(b, [a, b]).map((t) => t.id)).toEqual(['frc-8742']);
  });

  it('does not double-count a pairing both sides declare', () => {
    const a = rel('frc-8742', '8742', 'FRC', ['ftc-25638']);
    const b = rel('ftc-25638', '25638', 'FTC', ['frc-8742']);
    expect(relatedTeamsFor(a, [a, b])).toHaveLength(1);
  });

  it('drops a self-reference', () => {
    const a = rel('frc-8742', '8742', 'FRC', ['frc-8742']);
    expect(relatedTeamsFor(a, [a])).toEqual([]);
  });

  it('drops drafts, which have no page to link to', () => {
    const a = rel('frc-8742', '8742', 'FRC', ['ftc-25638']);
    const b = rel('ftc-25638', '25638', 'FTC', [], true);
    expect(relatedTeamsFor(a, [a, b])).toEqual([]);
  });

  it('returns an empty array when nothing is related', () => {
    const a = rel('frc-8742', '8742', 'FRC');
    const b = rel('frc-1501', '1501', 'FRC');
    expect(relatedTeamsFor(a, [a, b])).toEqual([]);
  });

  it('sorts results numerically across programs', () => {
    const a = rel('frc-8742', '8742', 'FRC', ['ftc-25638', 'frc-1501']);
    const b = rel('ftc-25638', '25638', 'FTC');
    const c = rel('frc-1501', '1501', 'FRC');
    expect(relatedTeamsFor(a, [a, b, c]).map((t) => t.data.number)).toEqual(['1501', '25638']);
  });
});

describe('parseCommunity', () => {
  it('splits a locality and two-letter region', () => {
    expect(parseCommunity('Huntington, IN')).toEqual({
      addressLocality: 'Huntington',
      addressRegion: 'IN',
    });
  });

  it('handles a multi-word locality', () => {
    expect(parseCommunity('Fort Wayne, IN')).toEqual({
      addressLocality: 'Fort Wayne',
      addressRegion: 'IN',
    });
  });

  it('tolerates surrounding whitespace', () => {
    expect(parseCommunity('  Fairmount,  IN  ')).toEqual({
      addressLocality: 'Fairmount',
      addressRegion: 'IN',
    });
  });

  it('rejects a region name that is not a two-letter code', () => {
    expect(parseCommunity('Fort Wayne, Indiana')).toBeUndefined();
  });

  it('rejects a bare region with no locality', () => {
    // "Northeast Indiana" is an area, not a city — emitting it as addressLocality would be
    // a false claim, so it drops out and the JSON-LD omits location entirely.
    expect(parseCommunity('Northeast Indiana')).toBeUndefined();
  });
});

/**
 * FIRST's official game name (and, where FIRST has assigned one, its trademark mark) for
 * each program's season — one shared directory instead of every team's file repeating the
 * same fact for the same year, which would risk drifting out of sync with itself across
 * teams and is pure duplication when it does stay in sync.
 *
 * Unlike FIRST/FRC/FTC/LEGO (FIRST_TOKENS in first.ts), a season's mark has no single rule:
 * FIRST treats each one differently year to year (registered trademark, service mark, or
 * none at all), so `mark` is filled in verbatim per entry here rather than derived.
 *
 * A year missing from a program's table isn't an error — it just means no one has added that
 * season yet. `seasonGame()` returns undefined for it, and callers render nothing.
 */

export interface SeasonGame {
  /** Verbatim as FIRST publishes it, e.g. "REEFSCAPE". Not case-normalized here — see the
   * comment on `robots[].showGame` in content.config.ts for why. */
  name: string;
  /** Verbatim glyph, e.g. "™" or "℠" — omitted entirely for a season FIRST gave no mark.
   * Kept separate from `name` (rather than folded into it) because it attaches directly to
   * the game word itself, not to the end of the full string once `presentedBy` is appended. */
  mark?: string;
  /** The season's presenting sponsor, e.g. "Haas" — part of FIRST's official season title,
   * but a separate field since it follows `mark`, not `name`, in render order. */
  presentedBy?: string;
}

type Program = 'FRC' | 'FTC';

// Both directories as supplied by the site maintainer (not independently verified against
// FIRST's own publications). Keyed by the single stored `year` — for FTC that's the LATER
// year of the two-year season it spans (see formatSeasonYear() in teamHistory.ts), same
// convention already used for FTC events/awards/robots everywhere else on this site, so a
// season here is filed under the same number a team's `robots[].year: 2025` would carry for
// what FIRST calls "2024–2025."
export const SEASON_GAMES: Record<Program, Partial<Record<number, SeasonGame>>> = {
  FRC: {
    2027: { name: 'BIOCORE', mark: '™', presentedBy: 'Haas' },
    2026: { name: 'REBUILT', mark: '™', presentedBy: 'Haas' },
    2025: { name: 'REEFSCAPE', mark: '℠', presentedBy: 'Haas' },
    2024: { name: 'CRESCENDO', mark: '℠', presentedBy: 'Haas' },
    2023: { name: 'CHARGED UP', mark: '℠', presentedBy: 'Haas' },
    2022: { name: 'RAPID REACT', mark: '℠', presentedBy: 'The Boeing Company' },
    2021: { name: 'INFINITE RECHARGE', mark: '℠' },
    2020: { name: 'INFINITE RECHARGE', mark: '℠' },
    2019: { name: 'DESTINATION: DEEP SPACE', presentedBy: 'The Boeing Company' },
    2018: { name: 'FIRST POWER UP', mark: '℠' },
    2017: { name: 'FIRST STEAMWORKS' },
    2016: { name: 'FIRST STRONGHOLD' },
    2015: { name: 'RECYCLE RUSH' },
    2014: { name: 'AERIAL ASSIST' },
    2013: { name: 'ULTIMATE ASCENT' },
    2012: { name: 'REBOUND RUMBLE' },
    2011: { name: 'LOGO MOTION' },
    2010: { name: 'BREAKAWAY' },
    2009: { name: 'LUNACY', mark: '®' },
    2008: { name: 'FIRST Overdrive' },
    2007: { name: 'Rack ’N’ Roll' },
    2006: { name: 'Aim High' },
    2005: { name: 'Triple Play' },
    2004: { name: 'FIRST Frenzy: Raising the Bar' },
    2003: { name: 'Stack Attack' },
    2002: { name: 'Zone Zeal' },
    2001: { name: 'Diabolical Dynamics' },
    2000: { name: 'Co-Opertition FIRST' },
    1999: { name: 'Double Trouble' },
    1998: { name: 'Ladder Logic' },
    1997: { name: 'Toroid Terror' },
    1996: { name: 'Hexagon Havoc' },
    1995: { name: 'Ramp ’n Roll' },
    1994: { name: 'Tower Power' },
    1993: { name: 'Rug Rage' },
    1992: { name: 'Maize Craze' },
  },
  FTC: {
    2027: { name: 'BIOBUZZ', mark: '™', presentedBy: 'RTX' },
    2026: { name: 'DECODE', mark: '™', presentedBy: 'RTX' },
    2025: { name: 'INTO THE DEEP', mark: '℠', presentedBy: 'RTX' },
    2024: { name: 'CENTERSTAGE', mark: '℠', presentedBy: 'RTX' },
    2023: { name: 'POWERPLAY', mark: '℠', presentedBy: 'Raytheon Technologies' },
    2022: { name: 'FREIGHT FRENZY', mark: '℠', presentedBy: 'Raytheon Technologies' },
    2021: { name: 'ULTIMATE GOAL', mark: '™', presentedBy: 'Qualcomm' },
    2020: { name: 'SKYSTONE', mark: '℠', presentedBy: 'Qualcomm' },
    2019: { name: 'ROVER RUCKUS', mark: '℠', presentedBy: 'Qualcomm Incorporated' },
    // FIRST® here is the org's own registered mark, not the season's — included verbatim in
    // `name` (rather than run through the ® superscript machinery) since a season name is
    // plain text by design; the season's own mark is still ℠ via the usual `mark` field.
    2018: { name: 'FIRST® RELIC RECOVERY', mark: '℠', presentedBy: 'Qualcomm Incorporated' },
    2017: { name: 'VELOCITY VORTEX', mark: '℠', presentedBy: 'Qualcomm' },
    2016: { name: 'FIRST® RES-Q', mark: '℠', presentedBy: 'Qualcomm' },
    2015: { name: 'CASCADE EFFECT', mark: '℠' },
    2014: { name: 'FTC BLOCK PARTY!', mark: '℠' },
    2013: { name: 'RING IT UP!', mark: '℠' },
    2012: { name: 'BOWLED OVER', mark: '℠' },
    2011: { name: 'GET OVER IT', mark: '™' },
    2010: { name: 'HOT SHOT', mark: '™' },
    2009: { name: 'FACE OFF!' },
    2008: { name: 'QUAD QUANDARY' },
    2007: { name: "HANGIN'-A-ROUND" },
    2006: { name: 'HALF-PIPE HUSTLE' },
  },
};

/** A team's page toggles this on per robot via `showGame`; this is what that toggle looks up. */
export function seasonGame(program: Program, year: number): SeasonGame | undefined {
  return SEASON_GAMES[program][year];
}

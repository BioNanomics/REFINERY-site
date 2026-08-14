export interface ImpactClause {
  /** Connective copy introducing the figure. Not emphasized. */
  lead: string;
  /** The figure itself. */
  value: string;
  /** What the figure counts — emphasized together with `value`, so the two
   *  must read as one continuous phrase (e.g. "$75,000" + "in funding"). */
  noun: string;
  /** Optional trailing qualifier, left unemphasized. */
  tail?: string;
}

/**
 * The impact figures, authored as a single sentence rather than a set of
 * standalone stats — the About and Home pages both render this, so the
 * numbers only need updating here.
 *
 * Clauses are joined with commas, so the last one carries its own "and".
 */
export const impactStatement: { opening: string; clauses: ImpactClause[] } = {
  opening: 'Across Northeast Indiana',
  clauses: [
    { lead: "we've backed", value: '15', noun: 'robotics teams' },
    { lead: 'put tools and mentors in front of', value: '~200', noun: 'students' },
    { lead: 'helped launch', value: '5', noun: 'new teams', tail: 'from scratch' },
    { lead: 'and moved', value: '$75,000', noun: 'in funding', tail: 'to the teams that needed it' },
  ],
};

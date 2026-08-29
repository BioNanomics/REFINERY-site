import { describe, expect, it } from 'vitest';
import { hasRenderableBody } from '../../src/utils/mdx-body';

// The literal body of src/content/teams/frc-1501-thrust.mdx. Every team entry looks like
// this today, which is the whole reason this module exists: render() on one of these emits
// nothing, so the bio section has to know not to open.
const SOURCING_COMMENT_ONLY = `
{/* Placeholder entry sourced from The Blue Alliance (team page, scraped 2026-08-12). Team
    name, location, rookie year, and 2026 event results are real and verified. Description is
    a short factual summary, not official team copy — replace with the team's own bio when
    available. */}
`;

describe('hasRenderableBody', () => {
  it('is false for an entry holding only a sourcing comment', () => {
    expect(hasRenderableBody(SOURCING_COMMENT_ONLY)).toBe(false);
  });

  it('is false for undefined and for an empty body', () => {
    expect(hasRenderableBody(undefined)).toBe(false);
    expect(hasRenderableBody('')).toBe(false);
    expect(hasRenderableBody('   \n  ')).toBe(false);
  });

  it('is true once real prose sits alongside the comment', () => {
    expect(hasRenderableBody(`${SOURCING_COMMENT_ONLY}\nWe build robots in Huntington.`)).toBe(true);
  });

  it('is true for prose alone', () => {
    expect(hasRenderableBody('## About us\n\nWe started in 2005.')).toBe(true);
  });

  it('strips HTML comments too, which are legal in MDX', () => {
    expect(hasRenderableBody('<!-- TODO: ask the team for a bio -->')).toBe(false);
  });

  it('does not let braces inside a comment end it early', () => {
    // A comment mentioning a JSX snippet would otherwise leave a stray tail behind and
    // report a body that renders nothing as renderable.
    expect(hasRenderableBody('{/* use {team.data.name} here later */}')).toBe(false);
  });

  it('handles several comments in one body', () => {
    expect(hasRenderableBody('{/* one */}\n\n{/* two */}')).toBe(false);
  });
});

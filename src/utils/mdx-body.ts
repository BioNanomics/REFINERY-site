/**
 * Whether a content entry's MDX body has anything worth rendering.
 *
 * Every team entry currently holds only a sourcing comment — an MDX expression comment
 * noting where the data was scraped, and nothing else — so `render()` returns a component
 * that emits no markup. Without this check the detail page opens a bio section and leaves a
 * blank gap on all fifteen pages.
 *
 * This is a heuristic on raw MDX rather than a parse, and that is fine given what it
 * decides: whether to show the entry's `description` as a fallback paragraph. The worst
 * failure is a description shown twice, not a broken page. Anything stricter would mean
 * running the MDX pipeline at build time to answer a yes/no question.
 */

/** MDX expression comments (a JSX comment wrapped in braces), including multi-line ones. */
const MDX_COMMENT = /\{\s*\/\*[\s\S]*?\*\/\s*\}/g;

/** Plain HTML comments, which are legal in MDX too. */
const HTML_COMMENT = /<!--[\s\S]*?-->/g;

export function hasRenderableBody(raw: string | undefined): boolean {
  if (!raw) return false;
  return raw.replace(MDX_COMMENT, '').replace(HTML_COMMENT, '').trim().length > 0;
}

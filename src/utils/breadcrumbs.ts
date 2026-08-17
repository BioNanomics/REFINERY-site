/**
 * The shape a page passes to MarketingLayout's `breadcrumbs` prop.
 *
 * Lives here rather than in the component so the two layouts and Breadcrumbs.astro all share
 * one definition — the whole point of the prop is that the visible trail and the
 * BreadcrumbList JSON-LD are derived from a single array, and three copies of the type would
 * be the first crack in that.
 */
export interface Crumb {
  /**
   * Raw label, not run through firstPlain(). MarketingLayout marks it for JSON-LD and
   * Breadcrumbs.astro renders it through FirstText — each medium stamps its own ®.
   */
  label: string;
  /**
   * Root-relative href from withBase(). Omit on the last crumb: the page the reader is
   * already on renders as text, not a link.
   */
  href?: string;
}

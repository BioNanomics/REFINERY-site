// Joins a site-relative path with Astro's configured `base`, so links work whether the site is
// served from a subpath or the domain root. There is currently no `base` — the site sits at the
// apex, so BASE_URL is "/" and this returns a clean root-absolute path. Keeping every internal
// link routed through here anyway is what makes re-introducing a subpath a one-line config
// change rather than a sweep across every template.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

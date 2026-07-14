// Joins a site-relative path with Astro's configured `base` (e.g. "/refinery-website/"),
// so links work whether the site is served from a subpath or the domain root.
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

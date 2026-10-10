/**
 * Prefixes the site's base path onto root-relative links ("/teams/frc1501/") in Markdown and
 * MDX bodies, the body-content counterpart of withBase() in src/utils/base.ts.
 *
 * Copied from the docs site (BioNanomics/REFINERY-docs-site, src/plugins/rehype-base-links.mjs),
 * so both repos follow one rule: internal links in body text are written from the site root.
 * scripts/check-content.mjs fails the build on a relative one ("../../news/").
 *
 * Why not relative links? A relative link resolves against the current URL, and the same page
 * can be reached with or without a trailing slash, so "../x/" can land outside the site. A
 * root-relative link means the same thing from every URL. The site sits at the domain root
 * today, so this plugin does nothing; if BASE in astro.config.mjs ever becomes a subpath, no
 * link in the content has to change.
 */
export default function rehypeBaseLinks({ base = '' } = {}) {
  const prefix = base.replace(/\/$/, '');
  return (tree) => {
    if (!prefix) return;
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'a') {
        const href = node.properties?.href;
        // "//host/…" is protocol-relative, not a path; skip links already carrying the base.
        if (typeof href === 'string' && href.startsWith('/') && !href.startsWith('//') &&
            href !== prefix && !href.startsWith(prefix + '/')) {
          node.properties.href = prefix + href;
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

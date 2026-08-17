/**
 * Marks external links in Markdown and MDX bodies so they open in a new tab and pick up the
 * site's automatic external-link indicator.
 *
 * Astro renders `[label](https://…)` as a bare `<a href>` with no target, so the
 * `a[target="_blank"]::after` rule in marketing.css — which signposts every outbound link
 * written in .astro templates — never matched anything authored in content. Closing that
 * gap here keeps content authors writing plain Markdown instead of hand-rolling raw HTML
 * with the right attributes, and means new content is marked by default.
 *
 * Deciding what counts as external is easy in this repo: CONTRIBUTING requires internal
 * links in body content to be relative, because the site is served under a base path. So an
 * absolute http(s) href in content is off-site by definition. Anything else is left alone —
 * relative paths, in-page anchors, and mailto:/tel:, none of which open a tab.
 *
 * Existing target/rel are preserved, so an author who writes raw HTML deliberately keeps it.
 */

const EXTERNAL = /^https?:\/\//i;

function visit(node, fn) {
  fn(node);
  for (const child of node.children ?? []) visit(child, fn);
}

export default function rehypeExternalLinks() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type !== 'element' || node.tagName !== 'a') return;

      const properties = node.properties ?? (node.properties = {});
      const href = properties.href;
      if (typeof href !== 'string' || !EXTERNAL.test(href)) return;

      if (!properties.target) properties.target = '_blank';
      // hast models space-separated attributes as arrays.
      if (!properties.rel) properties.rel = ['noopener', 'noreferrer'];
    });
  };
}

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import rehypeFirstMarks from './src/plugins/rehype-first-marks.mjs';
import rehypeExternalLinks from './src/plugins/rehype-external-links.mjs';

// https://astro.build/config
export default defineConfig({
  // Served from the apex domain root, so there is no `base`. If this ever moves to a Pages
  // project subpath, re-add `base` — withBase() in src/utils/base.ts routes every internal
  // link through one place, so that stays a one-line change.
  //
  // public/CNAME is deliberately absent until launch: GitHub Pages reads that file from the
  // deployed artifact and claims the custom domain from it, so creating it is the act of going
  // live. See the Deployment section in README.md.
  site: 'https://refineryrobotics.org',

  vite: {
    plugins: [tailwindcss()],
  },

  // Both run over every Markdown/MDX body; MDX inherits them via `extendMarkdownConfig`.
  // rehypeFirstMarks styles FIRST® trademarks, so authors just type FIRST in capitals.
  // rehypeExternalLinks marks absolute links as external, so a plain Markdown link picks up
  // the same new-tab behaviour and ↗ indicator as one written in an .astro template.
  markdown: {
    rehypePlugins: [rehypeFirstMarks, rehypeExternalLinks],
  },

  // /404/ is filtered out: GitHub Pages serves 404.html with a real 404 status, so it must
  // never be advertised as a crawlable URL. Nothing else needs excluding — draft entries get
  // no page at all (see the getStaticPaths filters), so they can't reach the sitemap.
  // No lastmod, changefreq, or priority. Google ignores the latter two, and the only honest
  // date available is a news pubDate — an event's dateStart is in the future, and a build-time
  // stamp is worse than no date at all.
  integrations: [mdx(), sitemap({ filter: (page) => !page.includes('/404') })],
});

// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import rehypeFirstMarks from './src/plugins/rehype-first-marks.mjs';
import rehypeExternalLinks from './src/plugins/rehype-external-links.mjs';

// https://astro.build/config
export default defineConfig({
  // TODO: confirm the actual GitHub org/username this repo lives under and
  // update `site` below. `base` must exactly match the repo name unless/until
  // a custom domain is configured (in which case: set `site` to the domain,
  // drop `base`, and add public/CNAME).
  site: 'https://crey-09.github.io',
  base: '/refinery-website',

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

  integrations: [mdx()],
});

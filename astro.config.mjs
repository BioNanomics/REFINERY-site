// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import rehypeFirstMarks from './src/plugins/rehype-first-marks.mjs';

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

  // Styles FIRST® trademarks in every Markdown/MDX body. MDX inherits this via
  // `extendMarkdownConfig`, so content authors just type FIRST in capitals.
  markdown: {
    rehypePlugins: [rehypeFirstMarks],
  },

  integrations: [mdx()],
});

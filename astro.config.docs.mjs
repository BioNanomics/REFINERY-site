// @ts-check
//
// Docs-only build config for the /resources Starlight section, intended to
// be deployed to its own subdomain (e.g. docs.therefinery.org) separately
// from the main marketing site. See docs/SUBDOMAIN-SETUP.md for the full
// setup runbook — this file alone is not enough to go live.
//
// Run with: npm run build:docs
//
// This compiles the ENTIRE Astro project (same pages/content as the main
// build) but with `site` pointed at the docs subdomain. The deploy workflow
// (.github/workflows/deploy-docs.yml) only publishes the dist/resources/
// subtree — the marketing pages built alongside it are discarded, not
// deployed. Routes keep their /resources/ prefix even on the subdomain
// (docs.example.com/resources/...) to avoid restructuring src/content/docs/;
// dropping that prefix is a possible later cleanup, not required to ship.
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';

export default defineConfig({
  // TODO: replace with the real docs subdomain once the root domain is decided.
  site: 'https://docs.example.com',
  base: '/',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    starlight({
      title: 'The REFINERY Resources',
      favicon: '/favicon.png',
      logo: {
        light: './src/assets/logo-full-color.svg',
        dark: './src/assets/logo-reversed.svg',
        replacesTitle: true,
      },
      disable404Route: true,
      customCss: ['./src/styles/global.css'],
      sidebar: [
        { label: 'Mentor Guides', items: [{ autogenerate: { directory: 'resources/mentor-guides' } }] },
        { label: 'Technical Deep-Dives', items: [{ autogenerate: { directory: 'resources/technical' } }] },
      ],
      components: {
        Header: './src/components/starlight/Header.astro',
        ThemeProvider: './src/components/starlight/ThemeProvider.astro',
        ThemeSelect: './src/components/starlight/ThemeSelectEmpty.astro',
      },
    }),
    mdx(),
  ],
});

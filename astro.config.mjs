// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://refineryrobotics.org',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    starlight({
      title: 'The REFINERY Documentation',
      favicon: '/favicon.png',
      logo: {
        light: './src/assets/logo-full-color.svg',
        dark: './src/assets/logo-reversed.svg',
        replacesTitle: true,
      },
      // We ship our own branded 404 at src/pages/404.astro for the whole site.
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

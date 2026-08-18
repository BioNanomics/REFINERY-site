import { defineConfig } from 'vitest/config';

// Plain Vite config, no Astro plugin: everything under test/unit exercises framework-free
// TypeScript/JS (src/utils, src/plugins, src/config) that doesn't touch astro:content or
// other virtual modules, so the extra weight of astro's own vite plugin isn't needed here.
export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
  },
});

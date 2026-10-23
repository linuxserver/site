// @ts-check
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import satteriCallouts from 'satteri-callouts';
import satteriBasePath from './src/lib/markdown/satteri-base-path.mjs';
import satteriImageLinks from './src/lib/markdown/satteri-image-links.mjs';

/**
 * DESIGN picks which of the three candidate designs is compiled (src/designs/<DESIGN>).
 * `npm run build` builds all three under /holt/, /raft/ and /current/ for side-by-side review;
 * once a design is chosen, delete the other two folders and this switch.
 */
const DESIGNS = ['holt', 'raft', 'current'];
const design = process.env.DESIGN ?? 'holt';
if (!DESIGNS.includes(design)) throw new Error(`DESIGN must be one of ${DESIGNS.join(', ')}`);

const site = process.env.SITE_URL ?? 'https://www.linuxserver.io';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  outDir: process.env.OUT_DIR ?? './dist',
  // Separate caches so the three designs can build or run dev servers side by side
  cacheDir: `./node_modules/.astro-${design}`,
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: { responsiveStyles: true },
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/search/') })],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@design': fileURLToPath(new URL(`./src/designs/${design}`, import.meta.url)),
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    define: { 'import.meta.env.DESIGN': JSON.stringify(design) },
  },
  markdown: {
    processor: satteri({
      mdastPlugins: [satteriImageLinks()],
      hastPlugins: [satteriCallouts({ theme: 'github' }), satteriBasePath(base, process.env.SHARED_ASSETS_BASE)],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
});

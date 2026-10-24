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
 * Where the site is served from. Defaults to the final home; the GitHub Pages deploy sets
 * SITE_URL=https://linuxserver.github.io and BASE_PATH=/site/ until the domain cut-over.
 */
const site = process.env.SITE_URL ?? 'https://www.linuxserver.io';
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  image: { responsiveStyles: true },
  integrations: [react(), sitemap({ filter: (page) => !page.includes('/search/') })],
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  },
  markdown: {
    processor: satteri({
      mdastPlugins: [satteriImageLinks()],
      hastPlugins: [satteriCallouts({ theme: 'github' }), satteriBasePath(base)],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      wrap: false,
    },
  },
});

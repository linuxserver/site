/**
 * Base-path helper. Astro exposes the configured `base` as import.meta.env.BASE_URL
 * ("/blog" for the GitHub Pages preview, "/" once the blog is on its own domain).
 *
 * Use withBase() for every internal link a template builds. Links inside post bodies are
 * handled by src/lib/satteri-base-path.mjs.
 */
const raw: string = import.meta.env.BASE_URL ?? '/';

/** "" when served from the root, "/blog" when served from a sub-path. Never ends with a slash. */
export const BASE = raw.replace(/\/+$/, '');

export function withBase(path: string): string {
  return path.startsWith('/') && !path.startsWith('//') ? BASE + path : path;
}

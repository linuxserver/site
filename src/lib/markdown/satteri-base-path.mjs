import { defineHastPlugin } from 'satteri';

/**
 * Prefixes root-relative URLs in rendered Markdown with the site's base path, so a post can link to
 * "/another-post/" or embed "/content/images/x.png" and "/media/<slug>/clip.mp4" regardless of whether
 * the site is served from "/" or "/blog/".
 *
 * Returns null (a no-op entry) when the base is "/".
 */
export default function satteriBasePath(base) {
  const prefix = String(base ?? '/').replace(/\/+$/, '');
  if (!prefix) return null;

  const fix = (value) =>
    typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') && !value.startsWith(prefix + '/')
      ? prefix + value
      : value;

  const ATTRS = ['href', 'src', 'poster'];

  return defineHastPlugin({
    name: 'base-path',
    element: {
      filter: ['a', 'img', 'video', 'audio', 'source', 'track', 'iframe'],
      visit(node) {
        const props = node.properties ?? {};
        let changed = false;
        const next = { ...props };
        for (const key of ATTRS) {
          if (key in next) {
            const v = fix(next[key]);
            if (v !== next[key]) {
              next[key] = v;
              changed = true;
            }
          }
        }
        return changed ? { ...node, properties: next } : undefined;
      },
    },
    // Raw HTML in Markdown (the <video> embeds, hand-written <a>/<img>) is not parsed into elements.
    raw(node) {
      const value = node.value.replace(/\b(href|src|poster)=(["'])(\/(?!\/)[^"']*)/g, (m, attr, quote, url) => {
        return `${attr}=${quote}${fix(url)}`;
      });
      return value === node.value ? undefined : { ...node, value };
    },
  });
}

import { defineMdastPlugin } from 'satteri';

/**
 * `![alt](./shot.png?link)` marks an image that should open its full-size version when clicked
 * (Grav's `?link` / `?lightbox` image operations). The query is stripped here, before Astro collects
 * the image for optimisation, and the <img> gets a `data-link` attribute. The post page wraps such
 * images in an <a> pointing at the optimised full-size file (that URL only exists after Astro has
 * processed the image, so it cannot be written here).
 */
export default function satteriImageLinks() {
  return defineMdastPlugin({
    name: 'image-links',
    image(node, ctx) {
      const m = node.url.match(/^([^?#]+)\?(link|lightbox)(?:[=&][^#]*)?(#.*)?$/);
      if (!m) return;
      ctx.setProperty(node, 'url', m[1] + (m[3] ?? ''));
      ctx.setProperty(node, 'data', { ...(node.data ?? {}), hProperties: { ...(node.data?.hProperties ?? {}), 'data-link': 'true' } });
    },
  });
}

import type { APIContext } from 'astro';
import { withBase } from '@/lib/base';

export function GET({ site }: APIContext) {
  if (import.meta.env.PUBLIC_NOINDEX === '1') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  return new Response(`User-agent: *\nAllow: /\nDisallow: ${withBase('/search/')}\n\nSitemap: ${new URL(withBase('/sitemap-index.xml'), site)}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

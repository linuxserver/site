import { withBase } from '@/lib/base';
import { SITE } from '@/lib/site';

export function GET() {
  return new Response(
    JSON.stringify({
      name: SITE.name,
      short_name: 'LSIO',
      description: SITE.description,
      start_url: withBase('/'),
      display: 'standalone',
      background_color: '#0b0913',
      theme_color: '#d93b92',
      icons: [
        { src: withBase('/icon-192.png'), sizes: '192x192', type: 'image/png' },
        { src: withBase('/icon-512.png'), sizes: '512x512', type: 'image/png' },
        { src: withBase('/favicon.svg'), sizes: 'any', type: 'image/svg+xml' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json' } },
  );
}

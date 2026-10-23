/** Small index for the ⌘K command palette: every image, every post title and the main pages. */
import { getAllImages } from '@/lib/images';
import { getPosts, postUrl } from '@/lib/posts';
import { NAV } from '@/lib/site';
import { withBase } from '@/lib/base';
import { toCards } from '@/lib/views';

export async function GET() {
  const cards = await toCards(getAllImages().filter((i) => !i.deprecated), 40);
  const body = {
    images: cards.map((c) => ({
      n: c.name,
      s: c.summary.length > 110 ? c.summary.slice(0, 107).replace(/\s+\S*$/, '') + '…' : c.summary,
      u: withBase(c.url),
      l: c.logo,
      c: c.categories,
      p: c.monthlyPulls,
    })),
    posts: (await getPosts()).map((p) => ({ t: p.data.title, u: postUrl(p), y: p.data.date.getUTCFullYear(), g: p.data.tags })),
    pages: [
      { t: 'Home', u: withBase('/') },
      ...NAV.map((n) => ({ t: n.label, u: n.external ? n.href : withBase(n.href), k: n.description })),
      { t: 'Donate', u: withBase('/donate/'), k: 'Open Collective sponsor support us' },
      { t: 'Blog tags', u: withBase('/blog/tags/'), k: 'topics authors' },
      { t: 'Full-text search', u: withBase('/search/') },
      { t: 'Service status', u: 'https://status.linuxserver.io/', k: 'uptime outage' },
    ],
  };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}

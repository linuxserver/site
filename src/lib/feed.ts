import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from './site';
import { withBase } from './base';
import { excerpt, getPosts, postUrl } from './posts';

const FEED_TITLE = `${SITE.name} Blog`;

async function items() {
  const posts = (await getPosts()).slice(0, SITE.feedItems);
  return posts.map((p) => ({
    title: p.data.title,
    link: postUrl(p),
    pubDate: p.data.date,
    updated: p.data.updated ?? p.data.date,
    description: excerpt(p, 400),
    author: p.data.author,
    categories: p.data.tags,
  }));
}

/** RSS 2.0, served at /rss.xml (and /blog.rss for feed readers subscribed to the old Grav path). */
export async function rssResponse(context: APIContext) {
  return rss({
    title: FEED_TITLE,
    description: 'News, guides and release notes from the LinuxServer.io team.',
    // channel link and item base include the base path (…/blog/ on the preview host)
    site: new URL(withBase('/blog/'), context.site).toString(),
    trailingSlash: true,
    items: (await items()).map((i) => ({
      title: i.title,
      link: i.link,
      pubDate: i.pubDate,
      description: i.description,
      author: i.author,
      categories: i.categories,
    })),
    customData: `<language>en-gb</language><atom:link href="${new URL(withBase('/blog/rss.xml'), context.site)}" rel="self" type="application/rss+xml"/>`,
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  });
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

/** Atom 1.0, served at /atom.xml (and /blog.atom). */
export async function atomResponse(context: APIContext) {
  const site = context.site!;
  const home = new URL(withBase('/blog/'), site).toString();
  const list = await items();
  const updated = list[0]?.updated ?? new Date();
  const entries = list
    .map((i) => {
      const url = new URL(i.link, site).toString();
      return `  <entry>
    <title>${esc(i.title)}</title>
    <link href="${url}" rel="alternate" type="text/html"/>
    <id>${url}</id>
    <published>${i.pubDate.toISOString()}</published>
    <updated>${i.updated.toISOString()}</updated>${i.author ? `\n    <author><name>${esc(i.author)}</name></author>` : ''}
    <summary>${esc(i.description)}</summary>
${i.categories.map((c) => `    <category term="${esc(c)}"/>`).join('\n')}
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${esc(FEED_TITLE)}</title>
  <subtitle>News, guides and release notes from the LinuxServer.io team.</subtitle>
  <link href="${home}" rel="alternate" type="text/html"/>
  <link href="${new URL(withBase('/blog/atom.xml'), site)}" rel="self" type="application/atom+xml"/>
  <id>${home}</id>
  <updated>${updated.toISOString()}</updated>
${entries}
</feed>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' } });
}

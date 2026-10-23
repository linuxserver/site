#!/usr/bin/env node
/**
 * One-off clean-up of the posts imported from github.com/linuxserver/blog. Safe to re-run.
 *
 * 1. Links between posts were root-relative ("/some-post/") because the blog lived on its own host.
 *    On www.linuxserver.io posts live under /blog/, so those become "/blog/some-post/".
 * 2. 25 posts used "# Heading" in the body. The page already renders the title as the only <h1>,
 *    so every heading in those posts is shifted down one level (outside code fences).
 *
 * Usage: node scripts/migrate-posts.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = new URL('../src/content/posts/', import.meta.url).pathname;
const slugs = new Set(readdirSync(dir).filter((d) => existsSync(join(dir, d, 'index.md'))));

let linkCount = 0;
let demoted = 0;

for (const slug of slugs) {
  const file = join(dir, slug, 'index.md');
  const src = readFileSync(file, 'utf8');
  const end = src.indexOf('\n---', 3);
  const front = src.slice(0, end + 4);
  let body = src.slice(end + 4);

  // 1. "/slug/" and "/slug" links to other posts, in Markdown and raw HTML
  body = body.replace(/(\]\(|href=["'])\/([a-z0-9][a-z0-9-]*)(\/?[#)"'])/g, (m, pre, target, post) => {
    if (!slugs.has(target)) return m;
    linkCount++;
    return `${pre}/blog/${target}${post.startsWith('/') ? post : '/' + post}`;
  });

  // 2. Demote headings when the body has an H1
  const lines = body.split('\n');
  let fence = null;
  const hasH1 = lines.some((l) => {
    const f = l.match(/^\s*(```|~~~)/);
    if (f) fence = fence ? null : f[1];
    return !fence && /^# \S/.test(l);
  });
  if (hasH1) {
    fence = null;
    body = lines
      .map((l) => {
        const f = l.match(/^\s*(```|~~~)/);
        if (f) fence = fence ? null : f[1];
        return !fence && /^#{1,5} \S/.test(l) ? '#' + l : l;
      })
      .join('\n');
    demoted++;
  }

  const out = front + body;
  if (out !== src) writeFileSync(file, out);
}

console.log(`Rewrote ${linkCount} links between posts; demoted headings in ${demoted} posts.`);

#!/usr/bin/env node
/**
 * Scaffolds a new blog post as a draft.
 *
 *   npm run new-post                                   (asks a few questions)
 *   npm run new-post -- "Webtop 6.0: now with more otters" --author thespad --tags webtop,announcement
 *
 * Creates src/content/posts/<slug>/index.md with front matter filled in and `draft: true`, adds you to
 * src/content/authors/ if you are new, and prints what to do next.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const root = new URL('../', import.meta.url).pathname;
const postsDir = `${root}src/content/posts`;
const authorsDir = `${root}src/content/authors`;

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args.splice(i, 2)[1] : undefined;
};
let author = opt('author');
let tags = opt('tags');
let title = args.filter((a) => !a.startsWith('--')).join(' ').trim();

const slugify = (s) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

// Existing tags, most used first, so people reuse them.
const tagCounts = new Map();
for (const d of readdirSync(postsDir)) {
  const f = `${postsDir}/${d}/index.md`;
  if (!existsSync(f)) continue;
  const m = readFileSync(f, 'utf8').match(/^tags:\n((?:\s+- .*\n)+)/m);
  for (const t of m?.[1].match(/- (.*)/g) ?? []) {
    const tag = t.slice(2).trim().replace(/^["']|["']$/g, '');
    tagCounts.set(tag.toLowerCase(), (tagCounts.get(tag.toLowerCase()) ?? 0) + 1);
  }
}
const popular = [...tagCounts].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([t]) => t);

if (!title || !author || tags === undefined) {
  const rl = createInterface({ input: stdin, output: stdout });
  title ||= (await rl.question('Title: ')).trim();
  author ||= (await rl.question('Your GitHub handle: ')).trim();
  if (tags === undefined) {
    console.log(`Popular tags: ${popular.join(', ')}`);
    tags = (await rl.question('Tags (comma separated): ')).trim();
  }
  rl.close();
}
if (!title) {
  console.error('A title is required.');
  process.exit(1);
}

const slug = slugify(title);
const dir = `${postsDir}/${slug}`;
if (existsSync(dir)) {
  console.error(`src/content/posts/${slug}/ already exists. Pick a different title.`);
  process.exit(1);
}

const tagList = (tags ?? '')
  .split(',')
  .map((t) => t.trim())
  .filter(Boolean);
const q = (s) => (/[:#'"[\]{}]|^[\s@`]/.test(s) ? JSON.stringify(s) : s);
const now = new Date();
now.setUTCSeconds(0, 0);

mkdirSync(dir, { recursive: true });
writeFileSync(
  `${dir}/index.md`,
  `---
title: ${q(title)}
date: ${now.toISOString().replace('.000Z', 'Z')}
${author ? `author: ${author}\n` : ''}${tagList.length ? `tags:\n${tagList.map((t) => `  - ${q(t)}`).join('\n')}\n` : ''}description: One or two sentences for the blog card, search engines and social previews.
# hero: ./banner.jpg            # put a landscape image (about 1600x900) in this folder
# heroAlt: What the image shows
# images: [webtop]              # image names this post is about; it will be listed on their pages
draft: true
---

Start with a short paragraph that says what changed and why anyone should care.

## First section

Write in plain Markdown. Images go in this folder: ![What it shows](./screenshot.png)

> [!TIP]
> Callouts work too: NOTE, TIP, IMPORTANT, WARNING and CAUTION.
`,
);

let newAuthor = false;
if (author) {
  const known = readdirSync(authorsDir).some((f) => {
    const y = readFileSync(`${authorsDir}/${f}`, 'utf8').toLowerCase();
    return f.replace(/\.yaml$/, '') === slugify(author) || y.includes(`github: ${author.toLowerCase()}`) || y.includes(author.toLowerCase());
  });
  if (!known) {
    writeFileSync(`${authorsDir}/${slugify(author)}.yaml`, `name: ${author}\ngithub: ${author}\n# bio: A sentence about you.\n`);
    newAuthor = true;
  }
}

console.log(`
Created src/content/posts/${slug}/index.md   →  /blog/${slug}/
${newAuthor ? `Added you as an author in src/content/authors/${slugify(author)}.yaml (add a bio if you like)\n` : ''}
Next:
  1. Write the post. Drop images into the same folder.
  2. npm run dev and open http://localhost:4321/blog/${slug}/ to preview (drafts show in dev).
  3. Remove "draft: true", commit, and open a pull request. The PR gets a preview link.
`);

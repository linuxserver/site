import { getCollection, type CollectionEntry } from 'astro:content';
import { withBase } from './base';

export type Post = CollectionEntry<'posts'>;
export type Author = CollectionEntry<'authors'>;

/** Published posts, newest first. Drafts and future-dated posts show in `astro dev` only. */
export async function getPosts(): Promise<Post[]> {
  const now = new Date();
  const posts = await getCollection('posts', ({ data }) => {
    if (data.draft && !import.meta.env.DEV) return false;
    if (data.date > now && !import.meta.env.DEV) return false;
    if (data.expires && data.expires <= now) return false;
    return true;
  });
  return posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Featured posts first, then newest. */
export async function getLatestPosts(n: number): Promise<Post[]> {
  const posts = await getPosts();
  const featured = posts.filter((p) => p.data.featured);
  return [...featured, ...posts.filter((p) => !p.data.featured)].slice(0, n);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
export const tagSlug = slugify;

export interface TagInfo {
  slug: string;
  name: string;
  count: number;
}

/**
 * Tags across all posts. Tags that differ only in case/punctuation ("docker", "Docker") share one slug;
 * the most common spelling is used as the display name.
 */
export function collectTags(posts: Post[]): TagInfo[] {
  const map = new Map<string, { count: number; spellings: Map<string, number> }>();
  for (const post of posts) {
    for (const tag of new Set(post.data.tags.map(tagSlug))) {
      const entry = map.get(tag) ?? { count: 0, spellings: new Map() };
      entry.count++;
      for (const raw of post.data.tags) {
        if (tagSlug(raw) === tag) entry.spellings.set(raw, (entry.spellings.get(raw) ?? 0) + 1);
      }
      map.set(tag, entry);
    }
  }
  return [...map]
    .filter(([slug]) => slug.length > 0)
    .map(([slug, { count, spellings }]) => ({
      slug,
      count,
      name: [...spellings].sort((a, b) => b[1] - a[1])[0][0],
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export const postsWithTag = (posts: Post[], slug: string) => posts.filter((p) => p.data.tags.some((t) => tagSlug(t) === slug));

// ---------------------------------------------------------------- authors

let authorIndex: Map<string, Author> | undefined;
async function authorsByKey() {
  if (!authorIndex) {
    authorIndex = new Map();
    for (const a of await getCollection('authors')) {
      for (const key of [a.id, a.data.name, a.data.github ?? '', ...a.data.aliases]) {
        if (key) authorIndex.set(slugify(key), a);
      }
    }
  }
  return authorIndex;
}

export interface Byline {
  name: string;
  /** Present when the author has a file in src/content/authors/. */
  id?: string;
  url?: string;
  github?: string;
  initials: string;
}

export async function byline(post: Post): Promise<Byline | undefined> {
  const raw = post.data.author;
  if (!raw) return undefined;
  const a = (await authorsByKey()).get(slugify(raw));
  const name = a?.data.name ?? raw;
  return {
    name,
    id: a?.id,
    url: a ? withBase(`/blog/authors/${a.id}/`) : undefined,
    github: a?.data.github,
    initials: initials(name),
  };
}

export function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/);
  return (parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : name.slice(0, 2)).toUpperCase();
}

export async function postsByAuthor(posts: Post[], id: string): Promise<Post[]> {
  const index = await authorsByKey();
  return posts.filter((p) => p.data.author && index.get(slugify(p.data.author))?.id === id);
}

export interface AuthorView {
  id: string;
  name: string;
  github?: string;
  role: 'team' | 'alumni' | 'guest';
  initials: string;
  count: number;
  url: string;
}

/** Authors with at least one of `posts`, most prolific first. */
export async function getAuthors(posts: Post[]): Promise<AuthorView[]> {
  const all = await getCollection('authors');
  const index = await authorsByKey();
  const counts = new Map<string, number>();
  for (const p of posts) {
    const a = p.data.author && index.get(slugify(p.data.author));
    if (a) counts.set(a.id, (counts.get(a.id) ?? 0) + 1);
  }
  return all
    .filter((a) => counts.has(a.id))
    .map(({ id, data }) => ({
      id,
      name: data.name,
      github: data.github,
      role: data.role,
      initials: initials(data.name),
      count: counts.get(id)!,
      url: withBase(`/blog/authors/${id}/`),
    }))
    .sort((a, b) => b.count - a.count);
}

// ---------------------------------------------------------------- text helpers

/** Markdown -> rough plain text, good enough for excerpts and word counts. */
export function plainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<video[\s\S]*?<\/video>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, ' ')
    .replace(/^\s*>\s?\[!\w+\]\s*$/gm, ' ')
    .replace(/^\s*>\s?/gm, '')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function excerpt(post: Post, max = 180): string {
  if (post.data.description) return post.data.description;
  const text = plainText(post.body ?? '');
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const at = cut.lastIndexOf(' ');
  return cut.slice(0, at > 100 ? at : max).replace(/[,;:.]$/, '') + '…';
}

export function readingTime(post: Post): number {
  const words = plainText(post.body ?? '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/** Posts that share the most tags with this one, then newest. */
export function relatedPosts(post: Post, posts: Post[], n = 3): Post[] {
  const tags = new Set(post.data.tags.map(tagSlug));
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => ({ p, score: p.data.tags.filter((t) => tags.has(tagSlug(t))).length }))
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score || b.p.data.date.getTime() - a.p.data.date.getTime())
    .slice(0, n)
    .map((x) => x.p);
}

/** Posts about an image: listed in `images:` front matter, or tagged with the image name. */
export function postsForImage(name: string, posts: Post[], n = 4): Post[] {
  return posts.filter((p) => p.data.images.includes(name) || p.data.tags.some((t) => tagSlug(t) === name)).slice(0, n);
}

// ---------------------------------------------------------------- pagination & URLs

export interface Page<T> {
  data: T[];
  currentPage: number;
  lastPage: number;
  total: number;
  /** URL builder for page n of this listing. */
  url: (n: number) => string;
}

export function paginate<T>(items: T[], page: number, size: number, basePath: string): Page<T> {
  const lastPage = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(Math.max(1, page), lastPage);
  return {
    data: items.slice((current - 1) * size, current * size),
    currentPage: current,
    lastPage,
    total: items.length,
    url: (n) => withBase(n <= 1 ? basePath : `${basePath}page/${n}/`),
  };
}

export const postUrl = (post: Post | string) => withBase(`/blog/${typeof post === 'string' ? post : post.id}/`);
export const tagUrl = (slug: string) => withBase(`/blog/tags/${slug}/`);

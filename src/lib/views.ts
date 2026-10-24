/** Display-ready shapes of posts, authors and image cards, built at render time for pages and islands. */
import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import defaultHero from '@/assets/default-hero.jpg';
import { byline, excerpt, getAuthors, readingTime, postUrl, tagSlug, tagUrl, type Byline, type Post } from './posts';
import { toCard, type Image, type ImageCard } from './images';

export interface TagLink {
  name: string;
  slug: string;
  url: string;
}

export interface PostView {
  id: string;
  url: string;
  title: string;
  date: Date;
  updated?: Date;
  excerpt: string;
  readingTime: number;
  tags: TagLink[];
  /** Always set: posts without a hero get the stock image. `heroIsDefault` tells you which. */
  hero: ImageMetadata;
  heroIsDefault: boolean;
  heroAlt: string;
  byline?: Byline;
  featured: boolean;
}

export async function toPostView(post: Post): Promise<PostView> {
  const seen = new Set<string>();
  const tags: TagLink[] = [];
  for (const t of post.data.tags) {
    const slug = tagSlug(t);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    tags.push({ name: t, slug, url: tagUrl(slug) });
  }
  return {
    id: post.id,
    url: postUrl(post),
    title: post.data.title,
    date: post.data.date,
    updated: post.data.updated,
    excerpt: excerpt(post),
    readingTime: readingTime(post),
    tags,
    hero: post.data.hero ?? defaultHero,
    heroIsDefault: !post.data.hero,
    heroAlt: post.data.heroAlt ?? '',
    byline: await byline(post),
    featured: post.data.featured,
  };
}

export const toPostViews = (posts: Post[]) => Promise.all(posts.map(toPostView));

export interface AuthorView {
  id: string;
  name: string;
  github?: string;
  bio?: string;
  role: 'team' | 'alumni' | 'guest';
  initials: string;
  count: number;
  url: string;
}

/** Authors with at least one of `posts`, most prolific first. */
export async function getAuthorViews(posts: Post[]): Promise<AuthorView[]> {
  return (await getAuthors(posts)).map(({ author, count, initials, url }) => ({
    id: author.id,
    name: author.data.name,
    github: author.data.github,
    bio: author.data.bio,
    role: author.data.role,
    initials,
    count,
    url,
  }));
}

/** Image cards for client islands, with logos already optimised to small WebP files. */
export async function toCards(images: Image[], size = 96): Promise<ImageCard[]> {
  return Promise.all(
    images.map(async (i) => {
      if (!i.logo) return toCard(i);
      if (i.logo.format === 'svg') return toCard(i, i.logo.src);
      const opt = await getImage({ src: i.logo, width: size, height: size, fit: 'contain', format: 'webp' });
      return toCard(i, opt.src);
    }),
  );
}

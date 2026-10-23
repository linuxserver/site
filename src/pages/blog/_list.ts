/** Shared by the blog listing routes. */
import { collectTags, getPosts, paginate, type Post } from '@/lib/posts';
import { SITE } from '@/lib/site';
import { toPostViews } from '@/lib/views';

export async function listing(posts: Post[], page: number, basePath: string) {
  const p = paginate(posts, page, SITE.postsPerPage, basePath);
  return { ...p, data: await toPostViews(p.data) };
}

export async function topTags(n = 14) {
  return collectTags(await getPosts()).slice(0, n);
}

export const pageCount = (n: number) => Math.max(1, Math.ceil(n / SITE.postsPerPage));

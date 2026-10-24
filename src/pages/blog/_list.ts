/** Shared by the blog listing routes. */
import { paginate, type Post } from '@/lib/posts';
import { SITE } from '@/lib/site';
import { toPostViews } from '@/lib/views';

export async function listing(posts: Post[], page: number, basePath: string, size = SITE.postsPerPage) {
  const p = paginate(posts, page, size, basePath);
  return { ...p, data: await toPostViews(p.data) };
}

export const pageCount = (n: number) => Math.max(1, Math.ceil(n / SITE.postsPerPage));

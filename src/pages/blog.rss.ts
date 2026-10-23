// The Grav site's feed URL, kept so existing subscribers keep receiving posts.
import type { APIContext } from 'astro';
import { rssResponse } from '@/lib/feed';

export const GET = (context: APIContext) => rssResponse(context);

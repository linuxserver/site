import type { APIContext } from 'astro';
import { rssResponse } from '@/lib/feed';

export const GET = (context: APIContext) => rssResponse(context);

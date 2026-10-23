// The Grav site's feed URL, kept so existing subscribers keep receiving posts.
import type { APIContext } from 'astro';
import { atomResponse } from '@/lib/feed';

export const GET = (context: APIContext) => atomResponse(context);

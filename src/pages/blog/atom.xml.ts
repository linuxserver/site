import type { APIContext } from 'astro';
import { atomResponse } from '@/lib/feed';

export const GET = (context: APIContext) => atomResponse(context);

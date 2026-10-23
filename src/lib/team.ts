import type { ImageMetadata } from 'astro';
import team from '@/data/team.json';

const avatars = import.meta.glob<{ default: ImageMetadata }>('/src/assets/team/*.png', { eager: true });

export interface Member {
  login: string;
  name: string | null;
  url: string;
  /** Local copy of the GitHub avatar (refreshed by `npm run data`), optimised at build time. */
  avatar: ImageMetadata | null;
}

export function getTeam(): Member[] {
  return (team as { login: string; name: string | null; url: string }[]).map((m) => ({
    login: m.login,
    name: m.name,
    url: m.url,
    avatar: avatars[`/src/assets/team/${m.login.toLowerCase()}.png`]?.default ?? null,
  }));
}

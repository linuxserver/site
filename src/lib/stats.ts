/**
 * Headline numbers, from src/data/stats.json (written by `npm run data`).
 * Each stat carries its own label, long-form text for screen readers and a source note, so every page
 * presents the same facts the same honest way.
 */
import raw from '@/data/stats.json';
import { compact, compactLong, grouped } from './format';

export const STATS = raw as {
  generated: string;
  images: number;
  deprecated: number;
  monthly_pulls: number;
  hub_pulls: number;
  stars: number;
  arm64: number;
  updated_this_week: number;
  since: string;
  team: number;
  backers: number;
};

export interface Stat {
  id: string;
  value: string;
  /** Raw number, for count-up animations. */
  raw: number;
  suffix?: string;
  label: string;
  /** Full sentence for screen readers / tooltips. */
  long: string;
  source: string;
}

const years = Math.floor((Date.parse(STATS.generated) - Date.parse(STATS.since)) / (365.25 * 864e5));

const stats = {
  hubPulls: {
    id: 'hub-pulls',
    value: compact(STATS.hub_pulls),
    raw: STATS.hub_pulls,
    suffix: '+',
    label: 'Docker Hub pulls',
    long: `More than ${compactLong(STATS.hub_pulls)} pulls from Docker Hub alone`,
    source: 'Docker Hub, all linuxserver repositories. GHCR and lscr.io pulls are not included.',
  },
  monthlyPulls: {
    id: 'monthly-pulls',
    value: compact(STATS.monthly_pulls),
    raw: STATS.monthly_pulls,
    label: 'pulls every month',
    long: `${compactLong(STATS.monthly_pulls)} pulls in the last month`,
    source: 'api.linuxserver.io, last 30 days, current images.',
  },
  images: {
    id: 'images',
    value: grouped(STATS.images),
    raw: STATS.images,
    label: 'maintained images',
    long: `${STATS.images} actively maintained images`,
    source: 'api.linuxserver.io, excluding deprecated images.',
  },
  stars: {
    id: 'stars',
    value: compact(STATS.stars),
    raw: STATS.stars,
    label: 'GitHub stars',
    long: `${grouped(STATS.stars)} stars across our image repositories`,
    source: 'GitHub, sum over current image repositories.',
  },
  arm64: {
    id: 'arm64',
    value: grouped(STATS.arm64),
    raw: STATS.arm64,
    label: 'multi-arch images',
    long: `${STATS.arm64} images built for both x86-64 and arm64`,
    source: 'api.linuxserver.io architectures.',
  },
  updatedThisWeek: {
    id: 'updated-week',
    value: grouped(STATS.updated_this_week),
    raw: STATS.updated_this_week,
    label: 'images rebuilt this week',
    long: `${STATS.updated_this_week} images rebuilt in the last seven days`,
    source: 'api.linuxserver.io build timestamps.',
  },
  years: {
    id: 'years',
    value: String(years),
    raw: years,
    suffix: '+',
    label: 'years of images',
    long: `Building images since ${new Date(STATS.since).getUTCFullYear()}`,
    source: 'Oldest first-build date in api.linuxserver.io.',
  },
  team: {
    id: 'team',
    value: String(STATS.team),
    raw: STATS.team,
    label: 'volunteers',
    long: `${STATS.team} volunteer team members`,
    source: 'Public members of the linuxserver GitHub organisation.',
  },
  backers: {
    id: 'backers',
    value: grouped(STATS.backers),
    raw: STATS.backers,
    label: 'backers',
    long: `${grouped(STATS.backers)} backers on Open Collective`,
    source: 'Open Collective.',
  },
} satisfies Record<string, Stat>;

/** Every stat typed as Stat, so optional fields like `suffix` can be read on any of them. */
export const stat: Record<keyof typeof stats, Stat> = stats;

export const SINCE_YEAR = new Date(STATS.since).getUTCFullYear();

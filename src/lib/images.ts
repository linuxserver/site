/**
 * The image catalogue, read from the src/data/images.json snapshot (api.linuxserver.io).
 * Refresh with `npm run data`.
 */
import { getCollection } from 'astro:content';
import type { ImageMetadata } from 'astro';
import snapshot from '@/data/images.json';
import hub from '@/data/hub.json';
import { isoWeek } from './format';

export interface EnvVar { name: string; value: string; desc: string; optional: boolean }
export interface Volume { path: string; host_path: string; desc: string; optional: boolean }
export interface Port { external: string; internal: string; desc: string; optional: boolean }
export interface Device { path: string; host_path: string; desc: string; optional: boolean }
export interface Cap { cap_add: string; desc: string; optional: boolean }
export interface SecurityOpt { run_var: string; compose_var: string; desc: string; optional: boolean }
export interface Custom { name: string; name_compose: string; value: string | string[]; desc: string; optional: boolean }

export interface ImageConfig {
  application_setup?: string;
  readonly_supported?: boolean;
  nonroot_supported?: boolean;
  env_vars?: EnvVar[];
  volumes?: Volume[];
  ports?: Port[];
  devices?: Device[];
  caps?: Cap[];
  security_opt?: SecurityOpt[];
  custom?: Custom[];
  networking?: string;
  privileged?: boolean;
  hostname?: { hostname: string; desc: string; optional: boolean };
  mac_address?: { mac_address: string; desc: string; optional: boolean };
}

export interface RawImage {
  name: string;
  initial_date?: string;
  github_url: string;
  project_url?: string;
  project_logo?: string;
  description: string;
  version: string;
  version_timestamp: string;
  category: string;
  stable: boolean;
  deprecated: boolean;
  stars: number;
  monthly_pulls: number;
  tags: { tag: string; desc: string }[];
  architectures: { arch: string; tag: string }[];
  changelog?: { date: string; desc: string }[];
  config?: ImageConfig;
}

export interface Image extends RawImage {
  /** Display name: "adguardhome-sync" stays as is; the API has no separate title. */
  title: string;
  categories: string[];
  /** Description with Markdown links reduced to their text. */
  summary: string;
  arm64: boolean;
  hubPulls: number | null;
  docsUrl: string;
  url: string;
  logo: ImageMetadata | null;
}

const logos = import.meta.glob<{ default: ImageMetadata }>('/src/assets/logos/*.{png,jpg,gif,svg,webp}', { eager: true });
const logoFor = (name: string): ImageMetadata | null => {
  for (const ext of ['png', 'svg', 'jpg', 'webp', 'gif']) {
    const m = logos[`/src/assets/logos/${name}.${ext}`];
    if (m) return m.default;
  }
  return null;
};

/** "[AudioSilo] is…" / "[text](url)" -> plain text. */
export function plainDescription(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

const pulls = (hub as { pulls: Record<string, number> }).pulls;

const all: Image[] = (snapshot.images as RawImage[])
  .map((i) => ({
    ...i,
    title: i.name,
    categories: (i.category ?? '')
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean),
    summary: plainDescription(i.description ?? ''),
    arm64: i.architectures.some((a) => a.arch === 'arm64'),
    hubPulls: pulls[i.name] ?? null,
    docsUrl: `https://docs.linuxserver.io/images/docker-${i.name}/`,
    url: `/images/${i.name}/`,
    logo: logoFor(i.name),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

/** When the snapshot was taken. Use this, not `new Date()`, for "updated 3 days ago" style text. */
export const SNAPSHOT_DATE = new Date(snapshot.last_updated.replace(' ', 'T'));

export const getAllImages = () => all;
export const getImages = () => all.filter((i) => !i.deprecated);
export const getImage = (name: string) => all.find((i) => i.name === name);

export interface Category {
  name: string;
  slug: string;
  count: number;
}

export function getCategories(): Category[] {
  const counts = new Map<string, number>();
  for (const i of getImages()) for (const c of i.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  return [...counts]
    .map(([name, count]) => ({ name, count, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** "Highest rated": most GitHub stars. */
export const mostStarred = (n = 8) => [...getImages()].sort((a, b) => b.stars - a.stars).slice(0, n);
export const mostPulled = (n = 8) => [...getImages()].sort((a, b) => b.monthly_pulls - a.monthly_pulls).slice(0, n);
export const recentlyUpdated = (n = 8) =>
  [...getImages()].sort((a, b) => b.version_timestamp.localeCompare(a.version_timestamp)).slice(0, n);

/** Newest additions to the fleet, by first build date. */
export const newest = (n = 8) =>
  getImages()
    .filter((i) => i.initial_date)
    .sort((a, b) => b.initial_date!.localeCompare(a.initial_date!))
    .slice(0, n);

export function relatedImages(image: Image, n = 4): Image[] {
  const cats = new Set(image.categories);
  return getImages()
    .filter((i) => i.name !== image.name)
    .map((i) => ({ i, score: i.categories.filter((c) => cats.has(c)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || b.i.monthly_pulls - a.i.monthly_pulls)
    .slice(0, n)
    .map((x) => x.i);
}

export interface Spotlight {
  /** "2026-W43" */
  week: string;
  image: Image;
  /** Note from src/content/spotlight.yaml, if the entry has one. */
  note?: string;
  by?: string;
  /** Other recent additions, for a "new this season" strip next to the spotlight. */
  alsoNew: Image[];
}

/** The Monday the rotation starts from: the first image in spotlight.yaml is featured this week. */
const ROTATION_START = Date.UTC(2026, 9, 19);
const WEEK = 7 * 864e5;

/**
 * The weekly spotlight: the images in src/content/spotlight.yaml take turns, one per week, in file order,
 * changing every Monday (CI builds daily). An image name that doesn't exist, or is deprecated, fails the
 * build so a typo can't slip through.
 */
export async function getSpotlight(now = new Date()): Promise<Spotlight> {
  const { year, week } = isoWeek(now);
  const entries = (await getCollection('spotlight')).sort((a, b) => a.data.position - b.data.position);
  if (!entries.length) throw new Error('src/content/spotlight.yaml needs at least one image');
  for (const e of entries) {
    const img = getImage(e.id);
    if (!img) throw new Error(`src/content/spotlight.yaml: there is no image called "${e.id}"`);
    if (img.deprecated) throw new Error(`src/content/spotlight.yaml: "${e.id}" is deprecated`);
  }
  const monday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - ((now.getUTCDay() + 6) % 7) * 864e5;
  const turn = Math.round((monday - ROTATION_START) / WEEK);
  const entry = entries[((turn % entries.length) + entries.length) % entries.length];
  const image = getImage(entry.id)!;
  return {
    week: `${year}-W${String(week).padStart(2, '0')}`,
    image,
    note: entry.data.note,
    by: entry.data.by,
    alsoNew: newest(7).filter((i) => i.name !== image.name).slice(0, 6),
  };
}

// ---------------------------------------------------------------------------------------------------
// Quick start snippets, generated from the image's config the same way docs.linuxserver.io does.

const q = (s: string) => (/[\s:#{}[\],&*?|<>=!%@`'"]/.test(s) || s === '' ? JSON.stringify(s) : s);

export function composeSnippet(image: Image, { optional = true } = {}): string {
  const c = image.config ?? {};
  const keep = <T extends { optional: boolean }>(xs?: T[]) => (xs ?? []).filter((x) => optional || !x.optional);
  const opt = (x: { optional: boolean }) => (x.optional ? ' # optional' : '');
  const L: string[] = ['---', 'services:', `  ${image.name}:`, `    image: ${SITE_REGISTRY}/${image.name}:latest`, `    container_name: ${image.name}`];

  if (c.networking) L.push(`    network_mode: ${c.networking}`);
  if (c.privileged) L.push('    privileged: true');
  if (c.hostname && (optional || !c.hostname.optional)) L.push(`    hostname: ${q(c.hostname.hostname)}${opt(c.hostname)}`);
  if (c.mac_address && (optional || !c.mac_address.optional)) L.push(`    mac_address: ${q(c.mac_address.mac_address)}${opt(c.mac_address)}`);
  const caps = keep(c.caps);
  if (caps.length) L.push('    cap_add:', ...caps.map((x) => `      - ${x.cap_add}${opt(x)}`));
  const sec = keep(c.security_opt);
  if (sec.length) L.push('    security_opt:', ...sec.map((x) => `      - ${x.compose_var}${opt(x)}`));
  const env = keep(c.env_vars);
  if (env.length) L.push('    environment:', ...env.map((e) => `      - ${e.name}=${e.value}${opt(e)}`));
  const vols = keep(c.volumes);
  if (vols.length) L.push('    volumes:', ...vols.map((v) => `      - ${v.host_path}:${v.path}${opt(v)}`));
  const ports = c.networking === 'host' ? [] : keep(c.ports);
  if (ports.length) L.push('    ports:', ...ports.map((p) => `      - ${p.external}:${p.internal}${opt(p)}`));
  const devs = keep(c.devices);
  if (devs.length) L.push('    devices:', ...devs.map((d) => `      - ${d.host_path}:${d.path}${opt(d)}`));
  for (const x of keep(c.custom)) {
    if (Array.isArray(x.value)) L.push(`    ${x.name_compose}:`, ...x.value.map((v) => `      - ${v}`));
    else L.push(`    ${x.name_compose}: ${q(x.value)}${opt(x)}`);
  }
  L.push('    restart: unless-stopped');
  return L.join('\n');
}

export function dockerRunSnippet(image: Image, { optional = true } = {}): string {
  const c = image.config ?? {};
  const keep = <T extends { optional: boolean }>(xs?: T[]) => (xs ?? []).filter((x) => optional || !x.optional);
  const opt = (x: { optional: boolean }) => (x.optional ? ' `#optional`' : '');
  const L: string[] = ['docker run -d', `  --name=${image.name}`];
  if (c.networking) L.push(`  --net=${c.networking}`);
  if (c.privileged) L.push('  --privileged');
  if (c.hostname && (optional || !c.hostname.optional)) L.push(`  --hostname=${c.hostname.hostname}${opt(c.hostname)}`);
  if (c.mac_address && (optional || !c.mac_address.optional)) L.push(`  --mac-address=${c.mac_address.mac_address}${opt(c.mac_address)}`);
  for (const x of keep(c.caps)) L.push(`  --cap-add=${x.cap_add}${opt(x)}`);
  for (const x of keep(c.security_opt)) L.push(`  --security-opt ${x.run_var}${opt(x)}`);
  for (const e of keep(c.env_vars)) L.push(`  -e ${e.name}=${e.value}${opt(e)}`);
  if (c.networking !== 'host') for (const p of keep(c.ports)) L.push(`  -p ${p.external}:${p.internal}${opt(p)}`);
  for (const v of keep(c.volumes)) L.push(`  -v ${v.host_path}:${v.path}${opt(v)}`);
  for (const d of keep(c.devices)) L.push(`  --device ${d.host_path}:${d.path}${opt(d)}`);
  for (const x of keep(c.custom)) {
    for (const v of Array.isArray(x.value) ? x.value : [x.value]) L.push(`  --${x.name}=${v}${opt(x)}`);
  }
  L.push('  --restart unless-stopped', `  ${SITE_REGISTRY}/${image.name}:latest`);
  return L.join(' \\\n');
}

const SITE_REGISTRY = 'lscr.io/linuxserver';

/** Slim records for client-side islands (catalogue filtering, command palette). Logos are resolved by the caller. */
export interface ImageCard {
  name: string;
  summary: string;
  categories: string[];
  version: string;
  updated: string;
  added?: string;
  stars: number;
  monthlyPulls: number;
  arm64: boolean;
  deprecated: boolean;
  url: string;
  logo?: string;
}

export function toCard(i: Image, logo?: string): ImageCard {
  return {
    name: i.name,
    summary: i.summary,
    categories: i.categories,
    version: i.version,
    updated: i.version_timestamp,
    added: i.initial_date,
    stars: i.stars,
    monthlyPulls: i.monthly_pulls,
    arm64: i.arm64,
    deprecated: i.deprecated,
    url: i.url,
    logo,
  };
}

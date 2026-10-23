#!/usr/bin/env node
/**
 * Refreshes the data snapshots in src/data/ that the site is built from:
 *
 *   images.json   every image from api.linuxserver.io (config included, deprecated included)
 *   hub.json      Docker Hub pull counts per repository, plus the namespace total
 *   stats.json    the headline numbers shown around the site
 *   team.json     public members of the linuxserver GitHub org
 *   backers.json  Open Collective totals
 *
 * The build only ever reads these files, so it is deterministic and works offline or when an
 * upstream API is down. CI runs this daily before building (see .github/workflows/deploy.yml);
 * the weekly image spotlight rotates on its own because it is keyed on the ISO week.
 *
 * Usage: node scripts/refresh-data.mjs [--skip-hub]
 */
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

const out = (name) => new URL(`../src/data/${name}`, import.meta.url);
const skipHub = process.argv.includes('--skip-hub');
const UA = { 'User-Agent': 'linuxserver.io-site-build (+https://www.linuxserver.io)' };

async function getJSON(url, { retries = 4, headers = {} } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { ...UA, ...headers } });
    if (res.ok) return res.json();
    if (attempt >= retries || (res.status !== 429 && res.status < 500)) {
      throw new Error(`${res.status} ${res.statusText} for ${url}`);
    }
    const wait = Number(res.headers.get('retry-after')) * 1000 || 1500 * 2 ** attempt;
    await new Promise((r) => setTimeout(r, wait));
  }
}

async function pool(items, size, fn) {
  const results = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) {
        const idx = i++;
        results[idx] = await fn(items[idx]);
      }
    }),
  );
  return results;
}

const write = (name, data) => {
  writeFileSync(out(name), JSON.stringify(data, null, 1) + '\n');
  console.log(`  wrote src/data/${name}`);
};

// ---------------------------------------------------------------- images
console.log('api.linuxserver.io …');
const api = await getJSON('https://api.linuxserver.io/api/v1/images?include_config=true&include_deprecated=true');
const images = api.data.repositories.linuxserver;
write('images.json', { last_updated: api.last_updated, images });

// Logos are copied locally so Astro can resize them to WebP and pages never hotlink GitHub.
console.log('logos …');
mkdirSync(out('../assets/logos/'), { recursive: true });
await pool(images.filter((i) => i.project_logo), 8, async (i) => {
  const ext = (i.project_logo.match(/\.(png|jpe?g|svg|webp|gif)(?:\?|$)/i)?.[1] ?? 'png').toLowerCase().replace('jpeg', 'jpg');
  try {
    const res = await fetch(i.project_logo, { headers: UA });
    if (!res.ok) throw new Error(String(res.status));
    writeFileSync(out(`../assets/logos/${i.name}.${ext}`), Buffer.from(await res.arrayBuffer()));
  } catch (e) {
    console.warn(`  ! logo ${i.name}: ${e.message}`);
  }
});

// ---------------------------------------------------------------- Docker Hub
let hub = existsSync(out('hub.json')) ? JSON.parse(readFileSync(out('hub.json'), 'utf8')) : null;
if (!skipHub) {
  console.log('hub.docker.com …');
  const pulls = {};
  // Anonymous requests can only page 100 repos deep, so: the first page of the namespace under several
  // orderings (catches retired repos with large historic counts, e.g. letsencrypt) plus every current
  // image individually. The result is a lower bound for the namespace total.
  let first;
  for (const ordering of ['', 'name', '-name', 'last_updated', '-last_updated', '-pull_count']) {
    const page = await getJSON(`https://hub.docker.com/v2/repositories/linuxserver/?page_size=100&ordering=${ordering}`);
    first ??= page;
    for (const r of page.results) pulls[r.name] = r.pull_count;
  }
  await pool(images.map((i) => i.name), 4, async (name) => {
    try {
      const r = await getJSON(`https://hub.docker.com/v2/repositories/linuxserver/${name}/`);
      pulls[name] = r.pull_count;
    } catch (e) {
      console.warn(`  ! ${name}: ${e.message}`);
    }
  });
  hub = {
    fetched: new Date().toISOString(),
    repositories: first.count,
    total_pulls: Object.values(pulls).reduce((a, b) => a + b, 0),
    pulls,
  };
  write('hub.json', hub);
}

// ---------------------------------------------------------------- GitHub team
console.log('api.github.com …');
const ghHeaders = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
const members = await getJSON('https://api.github.com/orgs/linuxserver/members?per_page=100', { headers: ghHeaders });
const team = await pool(
  members.filter((m) => m.type === 'User' && !/-CI$/i.test(m.login)),
  4,
  async (m) => {
    const u = await getJSON(m.url, { headers: ghHeaders }).catch(() => ({}));
    return { login: m.login, name: u.name || null, avatar: m.avatar_url, url: m.html_url };
  },
);
team.sort((a, b) => a.login.localeCompare(b.login, 'en', { sensitivity: 'base' }));
write('team.json', team);
mkdirSync(out('../assets/team/'), { recursive: true });
await pool(team, 4, async (m) => {
  const res = await fetch(`${m.avatar}${m.avatar.includes('?') ? '&' : '?'}s=192`, { headers: UA });
  if (res.ok) writeFileSync(out(`../assets/team/${m.login.toLowerCase()}.png`), Buffer.from(await res.arrayBuffer()));
});

// ---------------------------------------------------------------- Open Collective
console.log('opencollective.com …');
const oc = await getJSON('https://opencollective.com/linuxserver.json');
write('backers.json', { backers: oc.backersCount, yearly_income: oc.yearlyIncome, currency: oc.currency });

// ---------------------------------------------------------------- headline stats
const active = images.filter((i) => !i.deprecated);
const week = Date.now() - 7 * 864e5;
const stats = {
  generated: new Date().toISOString(),
  images: active.length,
  deprecated: images.length - active.length,
  monthly_pulls: active.reduce((a, i) => a + (i.monthly_pulls ?? 0), 0),
  hub_pulls: hub?.total_pulls ?? null,
  stars: active.reduce((a, i) => a + (i.stars ?? 0), 0),
  arm64: active.filter((i) => i.architectures.some((a) => a.arch === 'arm64')).length,
  updated_this_week: active.filter((i) => Date.parse(i.version_timestamp) >= week).length,
  since: images.map((i) => i.initial_date).filter(Boolean).sort()[0],
  team: team.length,
  backers: oc.backersCount,
};
write('stats.json', stats);
console.log(stats);

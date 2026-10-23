# www.linuxserver.io

The LinuxServer.io website: home, the image catalogue with a page for every image, the blog, and the
about, support and donate pages. Built with [Astro](https://astro.build), Tailwind CSS and
[shadcn/ui](https://ui.shadcn.com), with no server or database.

> **Design review.** This repository currently holds three candidate designs (`src/designs/holt`,
> `raft` and `current`) over one shared codebase. `npm run build && npm run preview` serves all three
> at http://localhost:4321 with a chooser page. Once one is picked, delete the other two folders and
> `scripts/build-all.mjs`, and set `DESIGN` in `.github/workflows/*.yml`.

## Quick start

```bash
npm install
npm run dev:holt          # or dev:raft / dev:current: http://localhost:4321
npm run build             # all three designs → dist/<design>/ + chooser at dist/index.html
npm run preview           # serve dist/ at http://localhost:4321
npm run build:one         # one design (DESIGN=…) at the site root, plus the search index. This is what CI deploys
```

Writing a blog post? See [CONTRIBUTING.md](CONTRIBUTING.md), or just run `npm run new-post`.

## How it fits together

```
src/
  data/            snapshots of api.linuxserver.io, Docker Hub, GitHub and Open Collective (npm run data)
  assets/logos/    image logos, copied locally and optimised to WebP at build time
  assets/team/     team avatars, likewise
  content/
    posts/         one folder per blog post (index.md + images)
    authors/       one YAML file per author
    spotlights.yaml  optional hand-written weekly spotlights
  lib/             data layer: images, posts, stats, compose generator, feeds, JSON-LD, formatting
  pages/           routes. Each one gathers data and renders @design/pages/<Page>.astro
  designs/<name>/  Layout, theme, page components and islands for one design (see designs/README.md)
  components/
    ui/            shadcn/ui components (Radix), themed by each design's tokens
    islands/       shared React islands: ⌘K search, theme toggle, mobile nav, quick start, copy
    shared/        head/SEO, logo, otter illustrations, image logos, post body
scripts/           data refresh, new-post, brand assets, review build, screenshots, accessibility checks
```

### Data

The build only reads the JSON snapshots in `src/data/`, so it's fast, deterministic, and keeps working
when an upstream API is down. `npm run data` refreshes them (set `GITHUB_TOKEN` to avoid rate limits; add
`--skip-hub` to skip the ~300 Docker Hub requests). The deploy workflow runs this daily and commits the result.

| Snapshot | Source | Used for |
| --- | --- | --- |
| `images.json` | api.linuxserver.io (with config) | catalogue, image pages, compose snippets, monthly pulls, stars |
| `hub.json` | Docker Hub, every repository in the namespace | lifetime pull counts |
| `team.json` | GitHub org public members | About page |
| `backers.json` | Open Collective | backer count |
| `stats.json` | derived from the above | headline numbers |

### Pages

| URL | |
| --- | --- |
| `/` | home: stats, weekly spotlight, favourites, blog |
| `/images/` | searchable, filterable catalogue (state in the query string, e.g. `?category=Games&sort=newest`) |
| `/images/<name>/` | every image, deprecated ones included: quick start (compose + docker run), parameters, tags, changelog |
| `/blog/`, `/blog/page/<n>/` | blog |
| `/blog/<slug>/` | post (same URLs as the Grav site) |
| `/blog/tags/`, `/blog/tags/<tag>/`, `/blog/authors/<id>/` | topics and authors |
| `/search/?q=` | full-text search (Pagefind) |
| `/about/`, `/support/`, `/donate/` | |
| `/blog/rss.xml`, `/blog/atom.xml` | feeds (`/blog.rss` and `/blog.atom` kept for existing subscribers) |
| `/search-index.json` | index for the ⌘K palette |

Old Grav URLs (`/our-images`, `/blog/page:2`, `/blog/tag:docker`) are redirected by `public/_redirects`
(Cloudflare Pages / Netlify format).

### Quality checks

```bash
node scripts/a11y.mjs http://localhost:4321                 # axe-core, WCAG 2.2 A/AA/AAA, light + dark
node scripts/shot.mjs http://localhost:4321/ out.png --full  # screenshot (--dark, --mobile)
node scripts/overflow.mjs http://localhost:4321/             # finds horizontal overflow at 390px
npm run check                                                # TypeScript / Astro diagnostics
```

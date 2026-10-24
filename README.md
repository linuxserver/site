# www.linuxserver.io

The LinuxServer.io website: home, the image catalogue with a page for every image, the blog, and the
about, support and donate pages. Built with [Astro](https://astro.build), Tailwind CSS and
[shadcn/ui](https://ui.shadcn.com), with no server or database.

Staging: https://linuxserver.github.io/site/ (deployed from `main` by `.github/workflows/deploy.yml`).

## Quick start

```bash
npm install
npm run dev               # http://localhost:4321
npm run build             # dist/ plus the Pagefind search index. This is what CI deploys
npm run preview           # serve dist/
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
    spotlight.yaml   images that take turns in the weekly spotlight
  lib/             data layer: images, posts, stats, compose generator, feeds, JSON-LD, formatting
  pages/           routes: each gathers its data in the frontmatter and renders the page
  layouts/         Layout.astro: <html>, <head> (via BaseHead), header, footer
  styles/          globals.css: Tailwind, fonts, colour tokens (:root and .dark), utilities, article typography
  components/      Astro components: page header, panels, post cards, image rows, logos, otters, blog listing
    islands/       React islands: ⌘K search, catalogue, search results, rankings, theme toggle, mobile nav, quick start, copy
    ui/            shadcn/ui components (Radix). Do not edit; restyle with `className`
scripts/           data refresh, new-post, brand assets, screenshots, accessibility checks
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

### Design

Raft: dark-first, technical, product-grade. Geist for UI, Geist Mono for every number, version and date,
hairline panels (`raft-panel`) and the logo gradient used as light, never as text. The colour tokens and
their contrast ratios are at the top of `src/styles/globals.css`.

- **Content is real.** Use the data layer and `lib/site.ts`. Never invent stats, quotes, testimonials or features.
- **Stats are honest.** Use `stat.<x>.value`, `.label`, `.long` and `.source`. `hubPulls` is a lower bound, so show its `+`.
- **Every internal href goes through `withBase()`** (`lib/base.ts`); staging is served under `/site/`.
- **Accessibility (WCAG 2.2 AA everywhere, AAA contrast for text):** one `<h1>` per page and no skipped heading levels;
  landmarks (`header`, `nav[aria-label]`, `main#main`, `footer`); visible focus; `aria-current="page"` in nav;
  text contrast ≥ 7:1 (≥ 4.5:1 for large/UI text); logo pinks `#ff4f97`/`#d93b92` are decoration only on light
  backgrounds; no information by colour alone; respect `prefers-reduced-motion`; images have `alt` (decorative
  `alt=""`); external links that open new tabs say so to screen readers; everything works by keyboard.
- **SEO:** pass `title`, `description`, `breadcrumbs` and `jsonLd` (`lib/jsonld.ts`) to the Layout. Use real `<a href>`
  links for everything navigational; islands must server-render their initial content.
- **Performance:** no client JS unless it earns it (`client:idle` for header widgets, `client:visible` below the fold,
  `client:load` only for above-the-fold interactivity); images through `astro:assets` or `ImageLogo`, with
  `loading="eager"` + `fetchpriority="high"` only for the LCP image.
- **Responsive and themed:** check 390px, 768px, 1280px and 1440px wide with no horizontal scroll, in light and dark.

### Quality checks

```bash
node scripts/a11y.mjs http://localhost:4321                 # axe-core, WCAG 2.2 A/AA/AAA, light + dark
node scripts/shot.mjs http://localhost:4321/ out.png --full  # screenshot (--light, --mobile)
node scripts/overflow.mjs http://localhost:4321/             # finds horizontal overflow at 390px
npm run check                                                # TypeScript / Astro diagnostics
```

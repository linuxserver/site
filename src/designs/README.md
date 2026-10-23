# Design

The site's look lives in `raft/` (dark-first, technical, product-grade). Routes in `src/pages` gather data
and render `@design/pages/<Page>.astro`, where `@design` is aliased to `src/designs/raft`
(`astro.config.mjs`). `types.ts` is the props contract between the two, so presentation can change
without touching data logic.

```
raft/
  Layout.astro      <html> shell: <BaseHead>, skip link, header, <main id="main">, footer
  theme.css         first line: @import '../../styles/globals.css'; then fonts, tokens (:root and .dark), utilities
  pages/            Home  Images  Image  BlogList  Post  Tags  Search  Donate  Support  About  NotFound
  components/       design-specific Astro components
  islands/          design-specific React islands (catalogue, search results, …)
```

## Shared building blocks

| Import | What it is |
| --- | --- |
| `@/components/shared/BaseHead.astro` | All `<head>` SEO. Pass the Layout's SEO props through, plus `defaultTheme` and `themeColor`. |
| `@/components/shared/Logo.astro` | Otter mark or full logo. Wordmark follows `color`. `title=""` when inside a named link. |
| `@/components/shared/Otter.astro` | Mascot illustrations: `pose="peek" \| "wave" \| "float"`. Decorative unless `label`. |
| `@/components/shared/Icon.astro` | Brand icons (github, discord, mastodon, bluesky, rss, opencollective, docker). Others: `lucide-react`. |
| `@/components/shared/ImageLogo.astro` | Optimised image logo with monogram fallback. |
| `@/components/shared/PostBody.astro` | Wrap `<Content />` in it. Gives article typography, callouts, code, click-to-enlarge. |
| `@/components/islands/CommandSearch` | ⌘K palette over images, posts and pages. `trigger="input" \| "button" \| "icon" \| "none"`. |
| `@/components/islands/ThemeToggle` | Light / dark / system menu. |
| `@/components/islands/MobileNav` | Sheet-based mobile menu. |
| `@/components/islands/QuickStart` | Compose / docker run tabs with copy and an "optional settings" switch. |
| `@/components/islands/CopyButton` | Copy to clipboard with a screen-reader announcement. |
| `@/components/ui/*` | shadcn/ui (Radix, Nova). Themed entirely by your tokens. Do not edit; restyle with `className`. |
| `@/lib/catalog` | `useCatalog(cards)` gives URL-synced search, filter and sort for your catalogue island. |
| `@/lib/jsonld` | `imageJsonLd`, `postJsonLd`, `itemListJsonLd` → pass to `<Layout jsonLd={[…]}>`. |
| `@/lib/format` | `compact`, `grouped`, `formatDate`, `relative`, `isoDate`, `plural`. |
| `@/lib/site` | `SITE`, `NAV`, `NAV_SECONDARY`, `LINKS`, `SOCIAL`, `SUPPORT_CHANNELS`, `SUPPORTERS`, `PILLARS`, `MISSION`, `DONATE_URL`. |
| `@/lib/base` | `withBase(path)`. **Every internal href goes through it** (staging is served under `/site/`). |

React islands need a `client:*` directive to be interactive (`client:idle` for header widgets,
`client:visible` below the fold, `client:load` only for above-the-fold interactivity). shadcn components
used without a directive render as static HTML, which is fine for Card, Badge, Button-as-link and so on.

## Rules the design follows

- **Content is real.** Use only the props and `lib/site.ts`. Never invent stats, quotes, testimonials or features.
- **Stats are honest.** Use `stats.<x>.value`, `.label`, `.long` and `.source`. `hubPulls` is a lower bound, so show its `+`.
- **Accessibility (target WCAG 2.2 AA everywhere, AAA contrast for text):** one `<h1>` per page and no skipped heading levels;
  landmarks (`header`, `nav[aria-label]`, `main#main`, `footer`); skip link; visible focus; `aria-current="page"` in nav;
  text contrast ≥ 7:1 (≥ 4.5:1 minimum for large/UI text); logo pinks `#ff4f97`/`#d93b92` are decoration only
  on light backgrounds; no information by colour alone; respect `prefers-reduced-motion`; images have `alt`
  (decorative `alt=""`); external links that open new tabs say so to screen readers; every interactive
  thing works by keyboard.
- **SEO:** pass `title`, `description`, `breadcrumbs` and `jsonLd` to the Layout. Use real `<a href>` links
  (crawlable) for everything navigational; islands must server-render their initial content.
- **Performance:** no client JS unless it earns it; images through `astro:assets` (`<Image>`/`<Picture>` or
  `ImageLogo`), `loading="eager"` + `fetchpriority="high"` only for the LCP image; fonts come from `@fontsource-variable`.
- **Responsive:** check 390px, 768px, 1280px and 1440px wide. No horizontal scroll.
- **Light and dark:** both must look intentional.

## Working on the design

```bash
npm run dev                                                  # http://localhost:4321
node scripts/shot.mjs http://localhost:4321/images/ /tmp/x.png --full [--dark] [--mobile]
node scripts/a11y.mjs http://localhost:4321 / /images/ /images/webtop/   # axe, light + dark
npm run build && npm run check                               # must pass
```

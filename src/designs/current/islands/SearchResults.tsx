import * as React from 'react';
import { ArrowRight, FileText, Search } from 'lucide-react';
import { filterCards, short } from '@/lib/catalog';
import type { ImageCard } from '@/lib/images';
import { search, type SearchHit } from '@/lib/pagefind-client';

interface Props {
  indexUrl: string;
  imagesUrl: string;
  searchUrl: string;
}

interface IndexData {
  images: { n: string; s: string; u: string; l?: string; c: string[]; p: number }[];
}

/**
 * Full search: images matched client-side from /search-index.json, posts via the Pagefind full-text index
 * (built by `pagefind` after `astro build`, so it is absent in `astro dev`). The query lives in ?q=.
 */
export default function SearchResults({ indexUrl, imagesUrl, searchUrl }: Props) {
  const [query, setQuery] = React.useState('');
  const [cards, setCards] = React.useState<ImageCard[]>([]);
  const [posts, setPosts] = React.useState<SearchHit[] | null | undefined>(undefined);
  const [busy, setBusy] = React.useState(false);
  const id = React.useId();

  React.useEffect(() => {
    setQuery(new URLSearchParams(location.search).get('q') ?? '');
    fetch(indexUrl)
      .then((r) => r.json())
      .then((d: IndexData) =>
        setCards(
          d.images.map((i) => ({
            name: i.n,
            summary: i.s,
            categories: i.c,
            url: i.u,
            logo: i.l,
            monthlyPulls: i.p,
            version: '',
            updated: '',
            stars: 0,
            arm64: false,
            deprecated: false,
          })),
        ),
      )
      .catch(() => {});
  }, [indexUrl]);

  const q = query.trim();
  React.useEffect(() => {
    const url = q ? `?q=${encodeURIComponent(q)}` : location.pathname;
    history.replaceState(null, '', url);
    if (!q) return setPosts(undefined);
    setBusy(true);
    const t = setTimeout(() => {
      search(q, 20).then((r) => {
        setPosts(r);
        setBusy(false);
      });
    }, 180);
    return () => clearTimeout(t);
  }, [q]);

  const images = q ? filterCards(cards, { query: q, category: '', arch: 'any', sort: 'popular', deprecated: false }) : [];

  return (
    <div>
      <form action={searchUrl} method="get" role="search" onSubmit={(e) => e.preventDefault()} className="relative">
        <label htmlFor={`${id}-q`} className="sr-only">
          Search images and posts
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          autoComplete="off"
          placeholder="Search 200+ images and 160 posts"
          className="h-14 w-full rounded-xl border border-input bg-card pr-4 pl-12 font-heading text-lg outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25"
        />
      </form>

      <p role="status" aria-live="polite" className="mt-4 min-h-6 text-sm text-muted-foreground">
        {q
          ? `${images.length} image${images.length === 1 ? '' : 's'}${posts ? ` and ${posts.length}${posts.length === 20 ? '+' : ''} post${posts.length === 1 ? '' : 's'}` : ''} for “${q}”`
          : 'Start typing to search.'}
      </p>

      {q && (
        <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section aria-labelledby={`${id}-img`}>
            <h2 id={`${id}-img`} className="cur-eyebrow mb-3">
              Images
            </h2>
            {images.length ? (
              <ul className="divide-y divide-border rounded-xl border border-border bg-card">
                {images.slice(0, 12).map((c) => (
                  <li key={c.url}>
                    <a href={c.url} className="flex items-center gap-3 px-4 py-3 hover:bg-muted">
                      {c.logo ? (
                        <img src={c.logo} alt="" width={32} height={32} className="size-8 shrink-0 rounded object-contain" />
                      ) : (
                        <span className="grid size-8 shrink-0 place-items-center rounded bg-muted font-semibold uppercase" aria-hidden="true">
                          {c.name[0]}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading font-semibold">{c.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.summary}</span>
                      </span>
                      <span className="text-xs text-muted-foreground tabular-nums">{short(c.monthlyPulls)}/mo</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No images match.</p>
            )}
            {images.length > 12 && (
              <a href={`${imagesUrl}?q=${encodeURIComponent(q)}`} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                All {images.length} in the catalogue <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            )}
          </section>

          <section aria-labelledby={`${id}-posts`} aria-busy={busy}>
            <h2 id={`${id}-posts`} className="cur-eyebrow mb-3">
              Blog posts
            </h2>
            {posts === null && (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                Full-text search of posts runs on the Pagefind index, which is generated by the production build (<code>npm run build</code>). It is not available in the dev server.
              </p>
            )}
            {posts && posts.length === 0 && <p className="text-muted-foreground">No posts mention that.</p>}
            {posts && posts.length > 0 && (
              <ol className="space-y-5">
                {posts.map((p) => (
                  <li key={p.url}>
                    <a href={p.url} className="group block">
                      <span className="flex items-center gap-2 font-heading text-lg font-semibold group-hover:text-primary">
                        <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                        {p.title}
                      </span>
                      <span
                        data-search-results
                        className="mt-1 block text-sm leading-relaxed text-muted-foreground"
                        // Pagefind returns an excerpt with <mark> around matches; it escapes the source text.
                        dangerouslySetInnerHTML={{ __html: p.excerpt }}
                      />
                    </a>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

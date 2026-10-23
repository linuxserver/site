import * as React from 'react';
import { ArrowRight, Search, X } from 'lucide-react';
import { filterCards, short } from '@/lib/catalog';
import type { ImageCard } from '@/lib/images';

interface Props {
  /** /search-index.json, base included. Loaded on first focus so the home page stays light. */
  indexUrl: string;
  /** /images/, base included. The form submits here without JS. */
  imagesUrl: string;
  total: number;
  suggestions: { label: string; query: string }[];
}

interface IndexImage {
  n: string;
  s: string;
  u: string;
  l?: string;
  c: string[];
  p: number;
}

let loading: Promise<ImageCard[]> | undefined;
const load = (url: string) =>
  (loading ??= fetch(url)
    .then((r) => r.json())
    .then((d: { images: IndexImage[] }) =>
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
    ));

/**
 * The home page's search: a GET form to /images/?q= that, once hydrated, shows the best matches inline as you type.
 * Results are a listbox-free list of links, so keyboard users simply Tab into them.
 */
export default function HeroSearch({ indexUrl, imagesUrl, total, suggestions }: Props) {
  const [query, setQuery] = React.useState('');
  const [cards, setCards] = React.useState<ImageCard[] | null>(null);
  const input = React.useRef<HTMLInputElement>(null);
  const id = React.useId();

  const warm = () => {
    if (!cards) load(indexUrl).then(setCards).catch(() => {});
  };

  // Keep anything typed before hydration finished.
  React.useEffect(() => {
    const typed = input.current?.value;
    if (typed) {
      setQuery(typed);
      load(indexUrl).then(setCards).catch(() => {});
    }
  }, [indexUrl]);

  const q = query.trim();
  const all = React.useMemo(
    () => (cards && q ? filterCards(cards, { query: q, category: '', arch: 'any', sort: 'popular', deprecated: false }) : []),
    [cards, q],
  );
  const shown = all.slice(0, 6);
  const seeAll = `${imagesUrl}?q=${encodeURIComponent(q)}`;

  const pick = (s: string) => {
    setQuery(s);
    warm();
    input.current?.focus();
  };

  return (
    <div>
      <form action={imagesUrl} method="get" role="search" aria-label="Find an image" className="relative">
        <label htmlFor={`${id}-q`} className="sr-only">
          Find a container
        </label>
        <Search className="pointer-events-none absolute top-1/2 left-5 size-6 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <input
          ref={input}
          id={`${id}-q`}
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            warm();
          }}
          onFocus={warm}
          placeholder="Find a container…"
          aria-describedby={`${id}-status`}
          className="h-16 w-full rounded-xl border border-border bg-card pr-36 pl-14 font-heading text-lg text-foreground shadow-[0_20px_50px_-20px_rgb(15_23_42/0.45)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/25 md:h-[4.5rem] md:text-xl [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => pick('')}
            className="absolute top-1/2 right-[7.25rem] grid size-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          className="absolute top-1/2 right-2.5 inline-flex h-11 -translate-y-1/2 items-center gap-1.5 rounded-lg bg-primary px-4 font-heading font-semibold text-primary-foreground transition hover:brightness-110 md:h-12 md:px-5"
        >
          Search
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <span className="text-white/85">Try</span>
        {suggestions.map((s) => (
          <button
            key={s.query}
            type="button"
            onClick={() => pick(s.query)}
            aria-pressed={q === s.query}
            className="rounded-full border border-white/30 bg-white/10 px-3 py-1.5 font-medium text-white backdrop-blur transition hover:bg-white/20 aria-pressed:bg-white aria-pressed:text-[#0f172a]"
          >
            {s.label}
          </button>
        ))}
      </div>

      <p id={`${id}-status`} role="status" aria-live="polite" className="sr-only">
        {q ? (cards ? `${all.length} ${all.length === 1 ? 'image matches' : 'images match'} “${q}”` : 'Loading images…') : ''}
      </p>

      {q && (
        <div className="mt-5 rounded-xl border border-border bg-card p-2 text-card-foreground shadow-2xl">
          {cards && shown.length === 0 && (
            <p className="px-3 py-6 text-center text-muted-foreground">
              No images match “{q}”. Try a broader word, or{' '}
              <a href={imagesUrl} className="cur-link">
                browse all {total}
              </a>
              .
            </p>
          )}
          {!cards && <p className="px-3 py-6 text-center text-muted-foreground">Loading…</p>}
          {shown.length > 0 && (
            <>
              <ul className="grid grid-cols-[minmax(0,1fr)] gap-1 sm:grid-cols-2">
                {shown.map((c) => (
                  <li key={c.url}>
                    <a href={c.url} className="flex items-center gap-3 rounded-lg p-2.5 transition hover:bg-muted focus-visible:bg-muted">
                      {c.logo ? (
                        <img src={c.logo} alt="" width={36} height={36} className="size-9 shrink-0 rounded-md object-contain" />
                      ) : (
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted font-heading font-semibold uppercase" aria-hidden="true">
                          {c.name[0]}
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-heading font-semibold">{c.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{c.summary}</span>
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{short(c.monthlyPulls)}/mo</span>
                    </a>
                  </li>
                ))}
              </ul>
              <a
                href={seeAll}
                className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 font-heading text-sm font-semibold text-primary hover:bg-muted"
              >
                {all.length === 1 ? 'Open it in the catalogue' : `See all ${all.length} results in the catalogue`}
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
            </>
          )}
        </div>
      )}
    </div>
  );
}

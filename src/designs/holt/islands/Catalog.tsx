import * as React from 'react';
import { Cpu, Download, LayoutGrid, List, Search, Star, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SORTS, short, useCatalog, type SortKey } from '@/lib/catalog';
import type { ImageCard } from '@/lib/images';
import type { Category } from '@/lib/images';
import { cn } from '@/lib/utils';

interface Props {
  cards: ImageCard[];
  categories: Category[];
  /** Base path prefix for card links (withBase applied on the server). */
  base: string;
  /** Rendered when nothing matches (an otter, server-rendered by the page). */
  emptyArt?: React.ReactNode;
}

function Logo({ card, size = 40 }: { card: ImageCard; size?: number }) {
  if (card.logo) return <img src={card.logo} alt="" width={size} height={size} loading="lazy" decoding="async" className="size-full object-contain" />;
  let hue = 0;
  for (const c of card.name) hue = (hue * 31 + c.charCodeAt(0)) % 360;
  return (
    <span
      aria-hidden="true"
      className="grid size-full place-items-center rounded-[22%] font-semibold text-white uppercase"
      style={{ background: `linear-gradient(135deg,oklch(0.62 0.17 ${hue}),oklch(0.45 0.17 ${(hue + 40) % 360}))`, fontSize: size * 0.42 }}
    >
      {card.name[0]}
    </span>
  );
}

export default function Catalog({ cards, categories, base, emptyArt }: Props) {
  const { state, set, reset, results, active, total } = useCatalog(cards);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [allCats, setAllCats] = React.useState(false);
  const TOP = 14;
  const shownCats = allCats ? categories : categories.slice(0, TOP).concat(categories.slice(TOP).filter((c) => c.name === state.category));
  const searchRef = React.useRef<HTMLInputElement>(null);
  const deprecatedCount = cards.filter((c) => c.deprecated).length;

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        e.stopImmediatePropagation();
        searchRef.current?.focus();
      }
    };
    // Capture phase, so "/" focuses this search instead of opening the site-wide palette on this page.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, []);

  const href = (url: string) => base.replace(/\/$/, '') + url;

  return (
    <div>
      {/* Toolbar */}
      <div className="holt-card sticky top-[4.75rem] z-20 flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            ref={searchRef}
            type="search"
            value={state.query}
            onChange={(e) => set('query', e.target.value)}
            placeholder={`Search ${total} images by name, category or what they do…`}
            aria-label="Search images"
            className="h-12 rounded-full border-transparent bg-muted pr-12 pl-12 text-base shadow-none focus-visible:bg-card md:text-base"
          />
          <kbd className="pointer-events-none absolute top-1/2 right-4 hidden -translate-y-1/2 rounded-md border border-border bg-card px-1.5 text-xs text-muted-foreground sm:block" aria-hidden="true">
            /
          </kbd>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={state.sort} onValueChange={(v) => set('sort', v as SortKey)}>
            <SelectTrigger className="h-11 w-44 rounded-full" aria-label="Sort images">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORTS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && setView(v as 'grid' | 'list')}
            aria-label="Layout"
            variant="outline"
            className="rounded-full"
          >
            <ToggleGroupItem value="grid" aria-label="Grid view" className="h-11 w-11 rounded-l-full">
              <LayoutGrid aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view" className="h-11 w-11 rounded-r-full">
              <List aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={state.category === ''}
            onClick={() => set('category', '')}
            className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
          >
            All
          </button>
          {shownCats.map((c) => (
            <button
              key={c.name}
              type="button"
              aria-pressed={state.category === c.name}
              onClick={() => set('category', state.category === c.name ? '' : c.name)}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground transition hover:border-primary/50 aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-primary-foreground"
            >
              {c.name} <span className="tabular-nums text-muted-foreground in-aria-pressed:text-primary-foreground/90">{c.count}</span>
            </button>
          ))}
          {categories.length > TOP && (
            <button
              type="button"
              aria-expanded={allCats}
              onClick={() => setAllCats((v) => !v)}
              className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-[var(--link)] hover:underline"
            >
              {allCats ? 'Fewer categories' : `${categories.length - TOP} more categories`}
            </button>
          )}
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-5 text-sm">
          <div className="flex items-center gap-2">
            <Switch id="f-arm" checked={state.arch === 'arm64'} onCheckedChange={(v) => set('arch', v ? 'arm64' : 'any')} />
            <Label htmlFor="f-arm" className="font-medium">
              arm64 only
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="f-dep" checked={state.deprecated} onCheckedChange={(v) => set('deprecated', v)} />
            <Label htmlFor="f-dep" className="font-medium">
              Deprecated ({deprecatedCount})
            </Label>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {state.deprecated ? 'Showing ' : ''}
          <strong className="font-semibold text-foreground">{results.length}</strong> {results.length === 1 ? 'image' : 'images'}
          {state.category && <> in {state.category}</>}
          {state.query && <> matching “{state.query}”</>}
        </p>
        {active && (
          <button type="button" onClick={reset} className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--link)] hover:underline">
            <X className="size-4" aria-hidden="true" /> Clear filters
          </button>
        )}
      </div>

      {state.deprecated && (
        <p className="mt-4 rounded-2xl bg-accent px-4 py-3 text-sm text-accent-foreground">
          Deprecated images are no longer updated. They are listed so existing users can find migration notes.
        </p>
      )}

      {results.length === 0 ? (
        <div className="mx-auto mt-10 max-w-md text-center">
          <div className="mx-auto w-40">{emptyArt}</div>
          <p className="mt-4 font-heading text-2xl font-bold text-foreground">The otter looked everywhere.</p>
          <p className="mt-2 text-muted-foreground">Nothing matches those filters. Try a different word, or clear the filters.</p>
          <button type="button" onClick={reset} className="mt-5 rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground">
            Clear filters
          </button>
        </div>
      ) : view === 'grid' ? (
        <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((c) => (
            <li key={c.name}>
              <a href={href(c.url)} className="holt-card holt-lift group flex h-full flex-col gap-4 p-5 focus-visible:outline-2 focus-visible:outline-offset-3">
                <div className="flex items-start gap-4">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-muted holt-tile p-2.5">
                    <Logo card={c} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate font-heading text-lg leading-tight font-bold text-foreground group-hover:text-primary">{c.name}</h2>
                    <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.categories.slice(0, 2).join(' · ') || 'Uncategorised'}</p>
                  </div>
                </div>
                <p className="line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">{c.summary}</p>
                <p className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-foreground">
                  <span className="inline-flex items-center gap-1.5">
                    <Download className="size-4 text-primary" aria-hidden="true" />
                    <span className="font-semibold tabular-nums">{short(c.monthlyPulls)}</span>
                    <span className="sr-only">pulls a month</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="size-4 text-primary" aria-hidden="true" />
                    <span className="font-semibold tabular-nums">{short(c.stars)}</span>
                    <span className="sr-only">GitHub stars</span>
                  </span>
                  {c.arm64 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                      <Cpu className="size-3.5" aria-hidden="true" /> arm64
                    </span>
                  )}
                </p>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="holt-card mt-6 divide-y divide-border overflow-hidden">
          {results.map((c) => (
            <li key={c.name}>
              <a href={href(c.url)} className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/60">
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted holt-tile p-2">
                  <Logo card={c} size={28} />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-heading font-bold text-foreground group-hover:text-primary">{c.name}</h2>
                  <p className="truncate text-sm text-muted-foreground">{c.summary}</p>
                </div>
                <span className="hidden w-44 truncate text-sm text-muted-foreground md:block">{c.categories.join(', ')}</span>
                <span className="hidden w-20 text-right text-sm font-semibold text-foreground tabular-nums sm:block">
                  {short(c.monthlyPulls)}
                  <span className="sr-only"> pulls a month</span>
                </span>
                <span className={cn('hidden w-14 text-right text-sm tabular-nums text-muted-foreground sm:block')}>
                  ★ {short(c.stars)}
                  <span className="sr-only"> stars</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

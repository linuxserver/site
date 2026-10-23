import * as React from 'react';
import { Download, LayoutGrid, List, Search, Star, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd } from '@/components/ui/kbd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { SORTS, short, useCatalog, type SortKey } from '@/lib/catalog';
import { relative } from '@/lib/format';
import type { ImageCard } from '@/lib/images';
import { cn } from '@/lib/utils';

interface Props {
  cards: ImageCard[];
  categories: { name: string; count: number }[];
  /** ISO string of the data snapshot, the "now" for relative dates. */
  snapshot: string;
  /** Base path prefix for links (cards carry root-relative urls). */
  base: string;
}

const ALL = '__all';

function Logo({ card, size }: { card: ImageCard; size: number }) {
  return card.logo ? (
    <img src={card.logo} alt="" width={size} height={size} loading="lazy" decoding="async" className="object-contain" style={{ width: size, height: size }} />
  ) : (
    <span className="grid place-items-center font-mono text-sm uppercase" style={{ width: size, height: size }} aria-hidden="true">
      {card.name[0]}
    </span>
  );
}

export default function Catalog({ cards, categories, snapshot, base }: Props) {
  const { state, set, reset, results, active, total } = useCatalog(cards);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const search = React.useRef<HTMLInputElement>(null);
  const now = React.useMemo(() => new Date(snapshot), [snapshot]);
  const deprecatedCount = cards.filter((c) => c.deprecated).length;

  React.useEffect(() => {
    try {
      const v = localStorage.getItem('raft-catalog-view');
      if (v === 'list' || v === 'grid') setView(v);
    } catch {}
    // "/" focuses this search instead of opening the site-wide palette (capture phase runs first).
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        e.stopPropagation();
        search.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  const chooseView = (v: string) => {
    if (v !== 'grid' && v !== 'list') return;
    setView(v);
    try {
      localStorage.setItem('raft-catalog-view', v);
    } catch {}
  };

  const href = (url: string) => base + url;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[14rem_1fr]">
      {/* Category rail */}
      <nav aria-label="Categories" className="hidden lg:block">
        <p className="raft-eyebrow mb-3 px-2">Category</p>
        <ul className="sticky top-20 max-h-[calc(100dvh-7rem)] space-y-px overflow-y-auto pr-1 pb-4">
          {[{ name: '', count: total }, ...categories].map((c) => {
            const on = state.category === c.name;
            return (
              <li key={c.name || 'all'}>
                <button
                  type="button"
                  onClick={() => set('category', c.name)}
                  aria-pressed={on}
                  className={cn(
                    'flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                    on ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="truncate">{c.name || 'All images'}</span>
                  <span className="font-mono text-xs tabular-nums">{c.count}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="raft-panel sticky top-[3.75rem] z-20 flex flex-wrap items-center gap-2 p-2">
          <div className="relative min-w-0 flex-1 basis-56">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <label htmlFor="raft-catalog-q" className="sr-only">
              Search images
            </label>
            <Input
              id="raft-catalog-q"
              ref={search}
              type="search"
              value={state.query}
              onChange={(e) => set('query', e.target.value)}
              placeholder={`Filter ${total} images…`}
              autoComplete="off"
              spellCheck={false}
              className="h-9 pr-10 pl-8"
            />
            <Kbd className="absolute top-1/2 right-2 -translate-y-1/2" aria-hidden="true">
              /
            </Kbd>
          </div>

          <div className="lg:hidden">
            <Select value={state.category || ALL} onValueChange={(v) => set('category', v === ALL ? '' : v)}>
              <SelectTrigger className="h-9 w-44" aria-label="Category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name} ({c.count})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={state.sort} onValueChange={(v) => set('sort', v as SortKey)}>
            <SelectTrigger className="h-9 w-44" aria-label="Sort by">
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

          <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-sm text-muted-foreground">
            <Switch checked={state.arch === 'arm64'} onCheckedChange={(on) => set('arch', on ? 'arm64' : 'any')} />
            arm64
          </label>

          <ToggleGroup type="single" value={view} onValueChange={chooseView} variant="outline" size="sm" aria-label="Layout" className="ml-auto">
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid aria-hidden="true" />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List aria-hidden="true" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-sm">
          <p role="status" aria-live="polite" className="font-mono text-xs text-muted-foreground">
            {results.length} {results.length === 1 ? 'image' : 'images'}
            {state.category && <> in {state.category}</>}
            {state.deprecated && <> (deprecated)</>}
          </p>
          {active && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-7">
              <X aria-hidden="true" /> Clear filters
            </Button>
          )}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
            <Switch checked={state.deprecated} onCheckedChange={(on) => set('deprecated', on)} size="sm" />
            Show {deprecatedCount} deprecated instead
          </label>
        </div>

        {results.length === 0 ? (
          <div className="raft-panel mt-6 grid place-items-center gap-3 px-6 py-16 text-center">
            <p className="text-lg font-medium">No images match those filters.</p>
            <p className="text-muted-foreground">Try a different word, or ask for an image on our forum.</p>
            <Button variant="outline" onClick={reset}>
              Clear filters
            </Button>
          </div>
        ) : view === 'grid' ? (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c) => (
              <li key={c.name}>
                <article className="raft-panel raft-glow-edge relative flex h-full flex-col p-4 transition-colors hover:bg-muted/40">
                  <div className="flex items-start gap-3">
                    <span className="grid size-11 shrink-0 place-items-center rounded-md border border-[var(--raft-hair)] bg-[var(--raft-surface)] p-1.5">
                      <Logo card={c} size={32} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold">
                        <a href={href(c.url)} className="after:absolute after:inset-0 after:rounded-[inherit] after:content-['']">
                          {c.name}
                        </a>
                      </h2>
                      <p className="truncate font-mono text-xs text-muted-foreground">{c.version}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{c.summary}</p>
                  <div className="mt-auto flex items-center gap-3.5 pt-4 font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Download className="size-3.5" aria-hidden="true" />
                      {short(c.monthlyPulls)}
                      <span className="sr-only"> pulls per month</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3.5" aria-hidden="true" />
                      {short(c.stars)}
                      <span className="sr-only"> GitHub stars</span>
                    </span>
                    {c.categories[0] && <span className="min-w-0 truncate">{c.categories[0]}</span>}
                    {c.arm64 && <span className="ml-auto shrink-0 rounded border border-[var(--raft-hair)] px-1.5 py-px">arm64</span>}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <div className="raft-panel mt-4 overflow-hidden">
            <div className="hidden grid-cols-[minmax(0,1fr)_10rem_7rem_5rem_4rem] gap-4 border-b border-[var(--raft-hair)] bg-[var(--raft-surface)] px-4 py-2 font-mono text-[0.6875rem] text-muted-foreground uppercase md:grid" aria-hidden="true">
              <span>Image</span>
              <span>Version</span>
              <span>Built</span>
              <span className="text-right">Pulls/mo</span>
              <span className="text-right">Stars</span>
            </div>
            <ul className="divide-y divide-[var(--raft-hair)]">
              {results.map((c) => (
                <li key={c.name}>
                  <a
                    href={href(c.url)}
                    className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-muted md:grid-cols-[minmax(0,1fr)_10rem_7rem_5rem_4rem]"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-[var(--raft-hair)] bg-[var(--raft-surface)] p-1">
                        <Logo card={c} size={22} />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium group-hover:text-primary">{c.name}</span>
                        <span className="block truncate text-[0.8125rem] text-muted-foreground">{c.summary}</span>
                      </span>
                    </span>
                    <span className="hidden truncate font-mono text-xs text-muted-foreground md:block">{c.version}</span>
                    <span className="hidden font-mono text-xs text-muted-foreground md:block">{relative(c.updated.replace(' ', 'T'), now)}</span>
                    <span className="text-right font-mono text-sm tabular-nums">
                      {short(c.monthlyPulls)}
                      <span className="sr-only"> pulls per month</span>
                    </span>
                    <span className="hidden text-right font-mono text-sm text-muted-foreground tabular-nums md:block">
                      {short(c.stars)}
                      <span className="sr-only"> stars</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        {state.deprecated && (
          <p className="mt-4 text-sm text-muted-foreground">
            <Badge variant="outline" className="mr-2 font-mono">
              deprecated
            </Badge>
            These images are no longer maintained and receive no further updates.
          </p>
        )}
      </div>
    </div>
  );
}

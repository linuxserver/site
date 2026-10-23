import * as React from 'react';
import { ArrowDownToLine, Cpu, Search, SlidersHorizontal, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { SORTS, short, useCatalog, type SortKey } from '@/lib/catalog';
import type { Category, ImageCard } from '@/lib/images';
import { cn } from '@/lib/utils';

interface Props {
  cards: ImageCard[];
  categories: Category[];
  /** Rendered (static) otter for the empty state, passed in from Astro. */
  emptyArt?: React.ReactNode;
}

const MAX_CATS = 14;

export default function Catalog({ cards, categories, emptyArt }: Props) {
  const { state, set, reset, results, active, total } = useCatalog(cards);
  const [allCats, setAllCats] = React.useState(false);
  const id = React.useId();
  const deprecatedCount = cards.filter((c) => c.deprecated).length;

  // "/" focuses the catalogue search (the global ⌘K palette keeps Ctrl/⌘K).
  const searchRef = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === '/' && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        e.stopImmediatePropagation();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, []);

  const cats = allCats ? categories : categories.slice(0, MAX_CATS);
  // Keep a selected category visible even when the list is collapsed.
  if (state.category && !cats.some((c) => c.name === state.category)) {
    const sel = categories.find((c) => c.name === state.category);
    if (sel) cats.push(sel);
  }

  const filters = (
    <div className="space-y-7">
      <fieldset>
        <legend className="cur-eyebrow mb-2">Category</legend>
        <ul className="space-y-0.5">
          <li>
            <CategoryButton name="All categories" count={total} pressed={!state.category} onClick={() => set('category', '')} />
          </li>
          {cats.map((c) => (
            <li key={c.name}>
              <CategoryButton
                name={c.name}
                count={c.count}
                pressed={state.category === c.name}
                onClick={() => set('category', state.category === c.name ? '' : c.name)}
              />
            </li>
          ))}
        </ul>
        {categories.length > MAX_CATS && (
          <button
            type="button"
            className="mt-2 px-2.5 text-sm font-medium text-[var(--link)] hover:underline"
            onClick={() => setAllCats((v) => !v)}
            aria-expanded={allCats}
          >
            {allCats ? 'Show fewer' : `Show all ${categories.length} categories`}
          </button>
        )}
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="cur-eyebrow mb-3">Options</legend>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${id}-arm`} className="font-normal">
            Runs on arm64
          </Label>
          <Switch id={`${id}-arm`} checked={state.arch === 'arm64'} onCheckedChange={(v) => set('arch', v ? 'arm64' : 'any')} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={`${id}-dep`} className="font-normal">
            Show deprecated only ({deprecatedCount})
          </Label>
          <Switch id={`${id}-dep`} checked={state.deprecated} onCheckedChange={(v) => set('deprecated', v)} />
        </div>
      </fieldset>
    </div>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-12">
      <aside className="hidden lg:block" aria-label="Filters">
        <div className="sticky top-24">{filters}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 basis-64">
            <label htmlFor={`${id}-q`} className="sr-only">
              Search images
            </label>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-[1.15rem] -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              ref={searchRef}
              id={`${id}-q`}
              type="search"
              value={state.query}
              onChange={(e) => set('query', e.target.value)}
              placeholder="Search images"
              autoComplete="off"
              spellCheck={false}
              className="h-11 w-full rounded-lg border border-input bg-card pr-10 pl-10 text-[0.9375rem] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-3 hidden -translate-y-1/2 rounded border border-border px-1.5 font-mono text-xs text-muted-foreground sm:block" aria-hidden="true">
              /
            </kbd>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 lg:hidden">
                <SlidersHorizontal aria-hidden="true" /> Filters
                {(state.category || state.arch !== 'any' || state.deprecated) && <span className="size-2 rounded-full bg-primary" aria-label="(active)" />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(20rem,88vw)] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>{results.length} images match</SheetDescription>
              </SheetHeader>
              <div className="px-4 pb-8">{filters}</div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <Label htmlFor={`${id}-sort`} className="text-sm whitespace-nowrap text-muted-foreground">
              Sort by
            </Label>
            <Select value={state.sort} onValueChange={(v) => set('sort', v as SortKey)}>
              <SelectTrigger id={`${id}-sort`} className="h-11! w-44">
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
          </div>
        </div>

        <div className="mt-5 mb-4 flex min-h-8 flex-wrap items-center justify-between gap-2">
          <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
            <span className="font-heading font-semibold text-foreground tabular-nums">{results.length}</span>{' '}
            {state.deprecated ? 'deprecated ' : ''}
            {results.length === 1 ? 'image' : 'images'}
            {state.category && (
              <>
                {' '}
                in <span className="font-medium text-foreground">{state.category}</span>
              </>
            )}
            {state.query && (
              <>
                {' '}
                matching <span className="font-medium text-foreground">“{state.query}”</span>
              </>
            )}
          </p>
          {active && (
            <Button variant="ghost" size="sm" onClick={reset}>
              <X aria-hidden="true" /> Clear filters
            </Button>
          )}
        </div>

        {results.length ? (
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {results.map((c) => (
              <li key={c.name}>
                <Card card={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-border px-6 py-16 text-center">
            <div className="w-36">{emptyArt}</div>
            <h2 className="mt-2 font-heading text-xl font-semibold">Nothing in the river by that name</h2>
            <p className="mt-2 max-w-md text-muted-foreground">
              No images match those filters. Try a broader search, or ask on Discord. Someone may know a container that fits.
            </p>
            <Button className="mt-5" onClick={reset}>
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryButton({ name, count, pressed, onClick }: { name: string; count: number; pressed: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-sm text-foreground/90 transition hover:bg-muted aria-pressed:bg-accent aria-pressed:font-semibold aria-pressed:text-accent-foreground"
    >
      <span className="truncate">{name}</span>
      <span className="ml-2 text-xs text-muted-foreground tabular-nums">{count}</span>
    </button>
  );
}

function Card({ card: c }: { card: ImageCard }) {
  return (
    <article className="cur-card cur-hover group relative flex h-full flex-col p-4">
      <div className="flex items-start gap-3">
        {c.logo ? (
          <img src={c.logo} alt="" width={44} height={44} loading="lazy" decoding="async" className="size-11 shrink-0 rounded-lg object-contain" />
        ) : (
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-muted font-heading text-lg font-semibold uppercase" aria-hidden="true">
            {c.name[0]}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="truncate font-heading text-base font-semibold">
            <a href={c.url} className="cur-stretch outline-none group-focus-within:underline">
              {c.name}
            </a>
          </h2>
          <p className="truncate text-xs text-muted-foreground">{c.categories.slice(0, 2).join(' · ') || 'Uncategorised'}</p>
        </div>
        {c.deprecated && <span className="rounded border border-border px-1.5 py-0.5 text-[0.6875rem] font-medium text-muted-foreground">Deprecated</span>}
      </div>
      <p className="cur-clamp-2 mt-3 text-sm leading-relaxed text-muted-foreground">{c.summary}</p>
      <dl className="mt-auto flex items-center gap-4 pt-4 text-xs text-muted-foreground tabular-nums">
        <div className="flex items-center gap-1">
          <dt>
            <ArrowDownToLine className="size-3.5" aria-hidden="true" />
            <span className="sr-only">Monthly pulls</span>
          </dt>
          <dd>{short(c.monthlyPulls)}/mo</dd>
        </div>
        <div className="flex items-center gap-1">
          <dt>
            <Star className="size-3.5" aria-hidden="true" />
            <span className="sr-only">GitHub stars</span>
          </dt>
          <dd>{short(c.stars)}</dd>
        </div>
        {c.arm64 && (
          <div className={cn('ml-auto flex items-center gap-1 rounded border border-border px-1.5 py-0.5 font-mono text-[0.6875rem]')}>
            <dt className="sr-only">Architectures</dt>
            <dd className="flex items-center gap-1">
              <Cpu className="size-3" aria-hidden="true" />
              arm64
            </dd>
          </div>
        )}
      </dl>
    </article>
  );
}

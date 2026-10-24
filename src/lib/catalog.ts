/**
 * Client-side filtering for the image catalogue island.
 * Filter state lives in the URL (?q=&category=&arch=&sort=&deprecated=1) so results can be linked to,
 * survive reloads and work with the back button. Browser-safe: no astro:* imports here.
 */
import * as React from 'react';
import type { ImageCard } from './images';

export type SortKey = 'popular' | 'stars' | 'name' | 'updated' | 'newest';
export type Arch = 'any' | 'arm64';

export const SORTS: { value: SortKey; label: string }[] = [
  { value: 'popular', label: 'Most pulled' },
  { value: 'stars', label: 'Most starred' },
  { value: 'updated', label: 'Recently updated' },
  { value: 'newest', label: 'Newest' },
  { value: 'name', label: 'Name (A–Z)' },
];

export interface CatalogState {
  query: string;
  category: string;
  arch: Arch;
  sort: SortKey;
  deprecated: boolean;
}

const DEFAULTS: CatalogState = { query: '', category: '', arch: 'any', sort: 'popular', deprecated: false };

function readUrl(): CatalogState {
  if (typeof window === 'undefined') return DEFAULTS;
  const p = new URLSearchParams(window.location.search);
  const sort = p.get('sort') as SortKey | null;
  return {
    query: p.get('q') ?? '',
    category: p.get('category') ?? '',
    arch: p.get('arch') === 'arm64' ? 'arm64' : 'any',
    sort: sort && SORTS.some((s) => s.value === sort) ? sort : DEFAULTS.sort,
    deprecated: p.get('deprecated') === '1',
  };
}

function writeUrl(s: CatalogState) {
  const p = new URLSearchParams();
  if (s.query) p.set('q', s.query);
  if (s.category) p.set('category', s.category);
  if (s.arch !== 'any') p.set('arch', s.arch);
  if (s.sort !== DEFAULTS.sort) p.set('sort', s.sort);
  if (s.deprecated) p.set('deprecated', '1');
  const qs = p.toString();
  history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
}

/** Scores a card against the query: name prefix > name contains > category > description. */
function score(card: ImageCard, terms: string[]): number {
  let total = 0;
  const name = card.name.toLowerCase();
  const cats = card.categories.join(' ').toLowerCase();
  const text = card.summary.toLowerCase();
  for (const t of terms) {
    if (name === t) total += 100;
    else if (name.startsWith(t)) total += 50;
    else if (name.includes(t)) total += 30;
    else if (cats.includes(t)) total += 15;
    else if (text.includes(t)) total += 5;
    else return 0;
  }
  return total;
}

export function filterCards(cards: ImageCard[], s: CatalogState): ImageCard[] {
  const terms = s.query.toLowerCase().split(/\s+/).filter(Boolean);
  let list = cards.filter(
    (c) =>
      (s.deprecated ? c.deprecated : !c.deprecated) &&
      (!s.category || c.categories.includes(s.category)) &&
      (s.arch === 'any' || c.arm64),
  );
  const scores = new Map<ImageCard, number>();
  if (terms.length) {
    list = list.filter((c) => {
      const v = score(c, terms);
      if (v) scores.set(c, v);
      return v > 0;
    });
  }
  const by: Record<SortKey, (a: ImageCard, b: ImageCard) => number> = {
    popular: (a, b) => b.monthlyPulls - a.monthlyPulls,
    stars: (a, b) => b.stars - a.stars,
    name: (a, b) => a.name.localeCompare(b.name),
    updated: (a, b) => b.updated.localeCompare(a.updated),
    newest: (a, b) => (b.added ?? '').localeCompare(a.added ?? ''),
  };
  return list.sort((a, b) => (terms.length ? (scores.get(b)! - scores.get(a)!) : 0) || by[s.sort](a, b));
}

export function useCatalog(cards: ImageCard[]) {
  // Start from defaults so server and first client render match; then adopt the URL.
  const [state, setState] = React.useState<CatalogState>(DEFAULTS);
  const ready = React.useRef(false);

  React.useEffect(() => {
    setState(readUrl());
    ready.current = true;
    const onPop = () => setState(readUrl());
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  React.useEffect(() => {
    if (ready.current) writeUrl(state);
  }, [state]);

  const results = React.useMemo(() => filterCards(cards, state), [cards, state]);
  const set = React.useCallback(<K extends keyof CatalogState>(key: K, value: CatalogState[K]) => setState((s) => ({ ...s, [key]: value })), []);
  const reset = React.useCallback(() => setState(DEFAULTS), []);
  const active = state.query !== '' || state.category !== '' || state.arch !== 'any' || state.deprecated;

  return { state, set, reset, results, active, total: cards.filter((c) => !c.deprecated).length };
}

/** "1.2M" style, client-safe copy of lib/format compact(). */
export function short(n: number): string {
  for (const [size, suffix] of [
    [1e9, 'B'],
    [1e6, 'M'],
    [1e3, 'K'],
  ] as const) {
    if (n >= size) {
      const v = Math.floor((n / size) * 10) / 10;
      return `${v.toFixed(v >= 100 ? 0 : 1).replace(/\.0$/, '')}${suffix}`;
    }
  }
  return String(n);
}

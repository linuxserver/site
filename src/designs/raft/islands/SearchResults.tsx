import * as React from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { search, type SearchHit } from '@/lib/pagefind-client';

/**
 * Full-text search over every post and image page (Pagefind). The form is a plain GET form, so
 * /search/?q=… works as a link and without JavaScript the browser simply reloads with the query.
 */
export default function SearchResults({ action }: { action: string }) {
  const [q, setQ] = React.useState('');
  const [hits, setHits] = React.useState<SearchHit[] | null | undefined>(undefined);
  const [busy, setBusy] = React.useState(false);

  const run = React.useCallback(async (query: string) => {
    if (!query.trim()) return setHits(undefined);
    setBusy(true);
    setHits(await search(query, 30));
    setBusy(false);
  }, []);

  React.useEffect(() => {
    const initial = new URLSearchParams(location.search).get('q') ?? '';
    setQ(initial);
    if (initial) run(initial);
  }, [run]);

  const submit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    history.replaceState(null, '', q ? `?q=${encodeURIComponent(q)}` : location.pathname);
    run(q);
  };

  return (
    <div>
      <form action={action} method="get" role="search" onSubmit={submit} className="raft-panel flex items-center gap-2 p-2">
        <label htmlFor="raft-search" className="sr-only">
          Search posts and images
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input id="raft-search" name="q" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="wireguard, reverse proxy, PUID…" className="h-11 pl-9 text-base" autoFocus />
        </div>
        <Button type="submit" size="lg" className="h-11 px-5">
          Search
        </Button>
      </form>

      <div role="status" aria-live="polite" className="mt-6 font-mono text-xs text-muted-foreground">
        {busy ? 'Searching…' : hits === null ? '' : hits ? `${hits.length} result${hits.length === 1 ? '' : 's'} for “${q}”` : ''}
      </div>

      {hits === null && (
        <p className="raft-panel mt-4 p-5 text-sm text-muted-foreground">
          The search index is created by the production build, so full-text search is not available in development. The ⌘K palette still finds images and post titles.
        </p>
      )}

      {hits && hits.length > 0 && (
        <ol className="mt-4 space-y-2" data-search-results>
          {hits.map((h) => (
            <li key={h.url}>
              <a href={h.url} className="raft-panel block p-4 transition-colors hover:bg-muted/50">
                <span className="block font-medium text-foreground">{h.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: h.excerpt }} />
                <span className="mt-2 block truncate font-mono text-xs text-muted-foreground">{h.url}</span>
              </a>
            </li>
          ))}
        </ol>
      )}
      {hits && hits.length === 0 && <p className="mt-4 text-muted-foreground">Nothing found. Try fewer or different words.</p>}
    </div>
  );
}

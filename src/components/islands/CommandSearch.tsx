import * as React from 'react';
import { ArrowRight, Box, FileText, Search, TextSearch } from 'lucide-react';
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Kbd } from '@/components/ui/kbd';
import { cn } from '@/lib/utils';

export interface SearchIndex {
  images: { n: string; s: string; u: string; l?: string; c: string[]; p: number }[];
  posts: { t: string; u: string; y: number; g: string[] }[];
  pages: { t: string; u: string; k?: string }[];
}

interface Props {
  /** URL of /search-index.json, base path included. */
  indexUrl: string;
  /** URL of the full-text search page, base path included. */
  searchUrl: string;
  /** What the visible trigger looks like: a search field, or an icon button for small screens. */
  trigger?: 'input' | 'icon';
  placeholder?: string;
  className?: string;
}

let indexPromise: Promise<SearchIndex> | undefined;
/** Every term has to match somewhere; matches in the name rank far above category or description matches. */
const startsWord = (text: string, t: string) => (' ' + text).includes(' ' + t);
function scoreImage(i: SearchIndex['images'][number], terms: string[]): number {
  const name = i.n.toLowerCase();
  const cats = i.c.join(' ').toLowerCase();
  const text = i.s.toLowerCase();
  let total = 0;
  for (const t of terms) {
    if (name === t) total += 100;
    else if (name.startsWith(t)) total += 60;
    else if (name.includes(t)) total += 40;
    else if (startsWord(cats, t)) total += 15;
    else if (startsWord(text, t)) total += 6;
    else return 0;
  }
  return total;
}
function scorePost(p: SearchIndex['posts'][number], terms: string[]): number {
  const title = p.t.toLowerCase();
  const tags = p.g.join(' ').toLowerCase();
  let total = 0;
  for (const t of terms) {
    if (startsWord(title, t)) total += 20;
    else if (startsWord(tags, t)) total += 8;
    else return 0;
  }
  return total;
}
/** Highest score first; ties go to `tiebreak` (higher first), e.g. monthly pulls for images. */
const ranked = <T,>(items: T[], score: (x: T) => number, limit: number, tiebreak: (x: T) => number = () => 0) =>
  items
    .map((x) => [x, score(x)] as const)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1] || tiebreak(b[0]) - tiebreak(a[0]))
    .slice(0, limit)
    .map(([x]) => x);

/**
 * Several triggers can be on a page (e.g. a desktop search bar and a mobile icon), each its own island.
 * The first one to mount owns the dialog and the keyboard shortcuts; the others ask it to open, so there is
 * only ever one palette.
 */
let owner: symbol | null = null;
const loadIndex = (url: string) => (indexPromise ??= fetch(url).then((r) => r.json()));

/** Open the palette from anywhere: window.dispatchEvent(new CustomEvent('lsio:search')) */
export default function CommandSearch({ indexUrl, searchUrl, trigger = 'input', placeholder = 'Search images and posts…', className }: Props) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [index, setIndex] = React.useState<SearchIndex | null>(null);
  const [mac, setMac] = React.useState(true);
  const [selected, setSelected] = React.useState('');
  const listRef = React.useRef<HTMLDivElement>(null);
  const me = React.useRef(Symbol('search'));
  const [isOwner, setIsOwner] = React.useState(false);

  React.useEffect(() => {
    setMac(/Mac|iPhone|iPad/.test(navigator.platform));
    if (owner) return;
    owner = me.current;
    setIsOwner(true);
    return () => {
      if (owner === me.current) owner = null;
    };
  }, []);

  React.useEffect(() => {
    if (!isOwner) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('lsio:search', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('lsio:search', onOpen);
    };
  }, [isOwner]);

  const show = () => (isOwner ? setOpen(true) : window.dispatchEvent(new CustomEvent('lsio:search')));

  React.useEffect(() => {
    if (open && !index) loadIndex(indexUrl).then(setIndex).catch(() => {});
  }, [open, index, indexUrl]);

  // Fetch the index once the page is idle, so results are there the moment someone starts typing.
  React.useEffect(() => {
    if (!isOwner) return;
    const load = () => loadIndex(indexUrl).then(setIndex).catch(() => {});
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(load, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(load, 1500);
    return () => clearTimeout(t);
  }, [isOwner, indexUrl]);

  const go = (url: string) => {
    setOpen(false);
    window.location.href = url;
  };

  const q = query.trim();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const popular = React.useMemo(() => (index ? [...index.images].sort((a, b) => b.p - a.p).slice(0, 6) : []), [index]);
  const images = q ? ranked(index?.images ?? [], (i) => scoreImage(i, terms), 8, (i) => i.p) : popular;
  const posts = q ? ranked(index?.posts ?? [], (p) => scorePost(p, terms), 6) : (index?.posts.slice(0, 4) ?? []);
  const pages = (index?.pages ?? []).filter((p) => !q || terms.every((t) => `${p.t} ${p.k ?? ''}`.toLowerCase().includes(t)));
  const first = images[0] ? `image ${images[0].n}` : posts[0] ? `post ${posts[0].t}` : pages[0] ? `page ${pages[0].t}` : q ? `fulltext ${q}` : '';

  // Every keystroke: highlight the best match and scroll back to the top so it is visible.
  React.useEffect(() => {
    setSelected(first);
    listRef.current?.scrollTo({ top: 0 });
  }, [q, index, first]);

  const shortcut = mac ? '⌘K' : 'Ctrl K';

  return (
    <>
      {trigger === 'input' && (
        <button
          type="button"
          onClick={show}
          className={cn(
            'inline-flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-background/60 px-3 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none',
            className,
          )}
          aria-haspopup="dialog"
        >
          <Search className="size-4" aria-hidden="true" />
          <span className="flex-1 truncate text-left">{placeholder}</span>
          <Kbd className="hidden sm:inline-flex" aria-hidden="true">
            {shortcut}
          </Kbd>
          <span className="sr-only">(shortcut {shortcut})</span>
        </button>
      )}
      {trigger === 'icon' && (
        <button
          type="button"
          onClick={show}
          className={cn('inline-flex size-9 items-center justify-center rounded-lg hover:bg-muted', className)}
          aria-label={`Search (${shortcut})`}
          aria-haspopup="dialog"
        >
          <Search className="size-[1.15rem]" aria-hidden="true" />
        </button>
      )}

      {isOwner && (
        <CommandDialog
          open={open}
          onOpenChange={setOpen}
          title="Search LinuxServer.io"
          description="Find an image, a blog post or a page"
          className="sm:max-w-xl"
        >
          {/* cmdk's input and items need a <Command> root; this shadcn CommandDialog does not add one. */}
          <Command label="Search LinuxServer.io" shouldFilter={false} value={selected} onValueChange={setSelected}>
            <CommandInput placeholder="Search 200+ images and 160 posts…" value={query} onValueChange={setQuery} />
            <CommandList ref={listRef} className="max-h-[min(60vh,28rem)]">
              <CommandEmpty>{index ? 'Nothing matches that.' : 'Loading…'}</CommandEmpty>
              {images.length > 0 && (
                <CommandGroup heading={q ? 'Images' : 'Popular images'}>
                  {images.map((i) => (
                    <CommandItem key={i.u} value={`image ${i.n}`} onSelect={() => go(i.u)}>
                      {i.l ? (
                        <img src={i.l} alt="" width={20} height={20} className="size-5 rounded object-contain" loading="lazy" />
                      ) : (
                        <Box aria-hidden="true" />
                      )}
                      <span className="font-medium">{i.n}</span>
                      <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{i.s}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {posts.length > 0 && (
                <CommandGroup heading={q ? 'Blog posts' : 'Latest posts'}>
                  {posts.map((p) => (
                    <CommandItem key={p.u} value={`post ${p.t}`} onSelect={() => go(p.u)}>
                      <FileText aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate">{p.t}</span>
                      <span className="ml-auto text-xs text-muted-foreground tabular-nums">{p.y}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {pages.length > 0 && (
                <CommandGroup heading="Pages">
                  {pages.map((p) => (
                    <CommandItem key={p.u} value={`page ${p.t}`} onSelect={() => go(p.u)}>
                      <ArrowRight aria-hidden="true" />
                      {p.t}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {q && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem value={`fulltext ${q}`} onSelect={() => go(`${searchUrl}?q=${encodeURIComponent(q)}`)}>
                      <TextSearch aria-hidden="true" />
                      Search every post for “{q}”
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </CommandDialog>
      )}
    </>
  );
}

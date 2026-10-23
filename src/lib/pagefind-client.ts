/**
 * Thin wrapper around the Pagefind index that `npm run build` writes to dist/pagefind/.
 * In `astro dev` the index does not exist, so search() resolves to null and the UI says so.
 */
export interface SearchHit {
  url: string;
  title: string;
  excerpt: string;
  date?: string;
}

interface PagefindModule {
  init?: () => Promise<void>;
  options?: (opts: Record<string, unknown>) => Promise<void>;
  search: (query: string) => Promise<{ results: { data: () => Promise<PagefindResult> }[] }>;
}

interface PagefindResult {
  url: string;
  excerpt: string;
  meta?: Record<string, string>;
}

let modulePromise: Promise<PagefindModule | null> | undefined;

export function loadPagefind(): Promise<PagefindModule | null> {
  if (!modulePromise) {
    const base = (import.meta.env.BASE_URL ?? '/').replace(/\/+$/, '');
    const path = `${base}/pagefind/pagefind.js`;
    modulePromise = import(/* @vite-ignore */ path)
      .then(async (pf: PagefindModule) => {
        await pf.options?.({ baseUrl: `${base}/` });
        await pf.init?.();
        return pf;
      })
      .catch(() => null);
  }
  return modulePromise;
}

export async function search(query: string, limit = 8): Promise<SearchHit[] | null> {
  const pf = await loadPagefind();
  if (!pf) return null;
  const res = await pf.search(query);
  const items = await Promise.all(res.results.slice(0, limit).map((r) => r.data()));
  return items.map((d) => ({
    url: d.url,
    title: d.meta?.title ?? d.url,
    excerpt: d.excerpt,
    date: d.meta?.date,
  }));
}

export function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface RankRow {
  name: string;
  url: string;
  logo?: string;
  summary: string;
  metric: string;
  metricLabel: string;
}

interface Props {
  lists: { key: string; label: string; rows: RankRow[] }[];
}

/**
 * Most pulled / most starred / recently updated, as tabs. Every panel is server-rendered (forceMount)
 * so all the links are in the HTML; inactive panels are hidden.
 */
export default function RankTabs({ lists }: Props) {
  return (
    <Tabs defaultValue={lists[0].key} className="gap-0">
      <div className="border-b border-[var(--raft-hair)] px-3 pt-3">
        <TabsList variant="line" aria-label="Rankings" className="h-9">
          {lists.map((l) => (
            <TabsTrigger key={l.key} value={l.key} className="px-3 font-mono text-xs">
              {l.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {lists.map((l) => (
        <TabsContent key={l.key} value={l.key} forceMount className="p-2 data-[state=inactive]:hidden">
          {/* Fill down then across, so the first column reads 1..n/2 */}
          <ol
            className="grid grid-cols-1 gap-x-4 md:grid-flow-col md:grid-cols-2 md:grid-rows-[repeat(var(--rows),auto)]"
            style={{ '--rows': Math.ceil(l.rows.length / 2) } as React.CSSProperties}
          >
            {l.rows.map((r, i) => (
              <li key={r.name}>
                <a href={r.url} className="group flex items-center gap-3.5 rounded-md px-3 py-2.5 transition-colors hover:bg-muted focus-visible:bg-muted">
                  <span className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-md border border-[var(--raft-hair)] bg-[var(--raft-surface)] p-1">
                    {r.logo ? (
                      <img src={r.logo} alt="" width={28} height={28} loading="lazy" className="size-7 object-contain" />
                    ) : (
                      <span className="font-mono text-sm uppercase" aria-hidden="true">
                        {r.name[0]}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-foreground group-hover:text-primary">{r.name}</span>
                    <span className="block truncate text-[0.8125rem] text-muted-foreground">{r.summary}</span>
                  </span>
                  <span className="shrink-0 text-right font-mono text-sm text-foreground tabular-nums">
                    {r.metric}
                    <span className="block text-[0.6875rem] text-muted-foreground">{r.metricLabel}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </TabsContent>
      ))}
    </Tabs>
  );
}

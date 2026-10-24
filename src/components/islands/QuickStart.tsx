import * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CopyButton from './CopyButton';

interface Props {
  name: string;
  compose: string;
  composeRequired: string;
  run: string;
  runRequired: string;
}

/**
 * Compose / docker run tabs with a "show optional settings" switch and copy buttons.
 * Server-rendered with the full snippets, so it reads fine before (or without) hydration.
 */
export default function QuickStart({ name, compose, composeRequired, run, runRequired }: Props) {
  const [optional, setOptional] = React.useState(true);
  const id = React.useId();
  const hasOptional = compose !== composeRequired;
  const snippets = { compose: optional ? compose : composeRequired, run: optional ? run : runRequired };

  return (
    <Tabs defaultValue="compose" className="gap-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-3 py-2">
        <TabsList aria-label={`Ways to run ${name}`}>
          <TabsTrigger value="compose">Docker Compose</TabsTrigger>
          <TabsTrigger value="run">docker run</TabsTrigger>
        </TabsList>
        {hasOptional && (
          <label htmlFor={`${id}-opt`} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
            <input
              id={`${id}-opt`}
              type="checkbox"
              checked={optional}
              onChange={(e) => setOptional(e.target.checked)}
              className="size-4 accent-primary"
            />
            Include optional settings
          </label>
        )}
      </div>
      {(['compose', 'run'] as const).map((k) => (
        <TabsContent key={k} value={k} className="relative">
          <pre
            className="max-h-[28rem] overflow-x-auto p-4 pr-14 font-mono text-[0.8125rem] leading-relaxed"
            tabIndex={0}
            aria-label={k === 'compose' ? 'docker-compose.yml' : 'docker run command'}
          >
            <code>{snippets[k]}</code>
          </pre>
          <CopyButton
            text={snippets[k]}
            label={k === 'compose' ? 'Copy compose file' : 'Copy docker run command'}
            className="absolute top-2 right-2"
            variant="secondary"
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}

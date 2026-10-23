import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/** Copies `text` and announces it to screen readers. */
export default function CopyButton({
  text,
  label = 'Copy',
  className,
  showLabel = false,
  variant = 'ghost',
}: {
  text: string;
  label?: string;
  className?: string;
  showLabel?: boolean;
  variant?: 'ghost' | 'outline' | 'secondary';
}) {
  const [copied, setCopied] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={showLabel ? 'sm' : 'icon-sm'}
      onClick={copy}
      className={cn('shrink-0', className)}
      aria-label={showLabel ? undefined : label}
    >
      {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      {showLabel && <span>{copied ? 'Copied' : label}</span>}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </Button>
  );
}

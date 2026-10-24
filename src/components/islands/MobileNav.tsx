import { ArrowUpRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export interface MobileNavItem {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
  current?: boolean;
}

interface Props {
  items: MobileNavItem[];
  secondary?: MobileNavItem[];
  cta?: { label: string; href: string };
  className?: string;
}

/** Hamburger + slide-over navigation for small screens (shadcn Sheet: focus-trapped, Esc to close). */
export default function MobileNav({ items, secondary = [], cta, className }: Props) {
  const link = (item: MobileNavItem, big: boolean) => (
    <SheetClose asChild key={item.href}>
      <a
        href={item.href}
        aria-current={item.current ? 'page' : undefined}
        {...(item.external ? { target: '_blank', rel: 'noopener' } : {})}
        className={cn(
          'flex items-center justify-between gap-3 rounded-lg px-3 transition-colors hover:bg-muted aria-[current=page]:bg-accent aria-[current=page]:text-accent-foreground',
          big ? 'py-3 text-lg font-semibold' : 'py-2 text-sm text-muted-foreground',
        )}
      >
        <span>
          {item.label}
          {big && item.description && <span className="block text-sm font-normal text-muted-foreground">{item.description}</span>}
        </span>
        {item.external && (
          <>
            <ArrowUpRight className="size-4 shrink-0 opacity-60" aria-hidden="true" />
            <span className="sr-only">(opens in a new tab)</span>
          </>
        )}
      </a>
    </SheetClose>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label="Open menu">
          <Menu className="size-5" aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[min(22rem,90vw)] gap-0 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Main" className="flex flex-col gap-1 px-2">
          {items.map((i) => link(i, true))}
        </nav>
        {secondary.length > 0 && (
          <nav aria-label="More" className="mt-4 flex flex-col gap-0.5 border-t border-border px-2 pt-4">
            {secondary.map((i) => link(i, false))}
          </nav>
        )}
        {cta && (
          <div className="mt-auto p-4">
            <Button asChild className="w-full" size="lg">
              <a href={cta.href}>{cta.label}</a>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

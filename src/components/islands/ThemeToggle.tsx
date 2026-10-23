import * as React from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Pref = 'light' | 'dark' | 'system';

function apply(pref: Pref) {
  const dark = pref === 'dark' || (pref === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
  const root = document.documentElement;
  root.classList.toggle('dark', dark);
  root.style.colorScheme = dark ? 'dark' : 'light';
  root.dataset.themePref = pref;
}

/** Light / dark / system switch. The initial theme is applied before paint by BaseHead. */
export default function ThemeToggle({ className, variant = 'ghost' }: { className?: string; variant?: 'ghost' | 'outline' }) {
  const [pref, setPref] = React.useState<Pref>('system');

  React.useEffect(() => {
    setPref((document.documentElement.dataset.themePref as Pref) ?? 'system');
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => document.documentElement.dataset.themePref === 'system' && apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const choose = (value: string) => {
    const p = value as Pref;
    setPref(p);
    try {
      localStorage.setItem('theme', p);
    } catch {}
    apply(p);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="icon" className={className} aria-label="Colour theme">
          <Sun className="size-[1.15rem] dark:hidden" aria-hidden="true" />
          <Moon className="hidden size-[1.15rem] dark:block" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={pref} onValueChange={choose}>
          <DropdownMenuRadioItem value="light">
            <Sun aria-hidden="true" /> Light
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">
            <Moon aria-hidden="true" /> Dark
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">
            <Monitor aria-hidden="true" /> System
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

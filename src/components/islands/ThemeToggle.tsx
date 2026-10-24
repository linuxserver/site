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

declare global {
  interface Window {
    /** Defined by the inline script in BaseHead, which applies the initial theme before paint. */
    applyTheme(pref: Pref): void;
  }
}

/** Light / dark / system switch. */
export default function ThemeToggle() {
  const [pref, setPref] = React.useState<Pref>('dark');

  React.useEffect(() => {
    setPref(document.documentElement.dataset.themePref as Pref);
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => document.documentElement.dataset.themePref === 'system' && window.applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const choose = (value: string) => {
    const p = value as Pref;
    setPref(p);
    try {
      localStorage.setItem('theme', p);
    } catch {}
    window.applyTheme(p);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Colour theme">
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

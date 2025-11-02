'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';
import { MAIN_NAV_ITEMS } from '@/lib/constants/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden md:flex items-center gap-8"
      aria-label="Main navigation"
    >
      {MAIN_NAV_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname?.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
              'after:absolute after:left-1/2 after:bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-accent after:opacity-0 after:transition-all after:duration-300',
              isActive
                ? 'bg-accent text-accent-foreground shadow-md ring-1 ring-accent/60 after:w-3/4 after:opacity-100'
                : 'text-foreground/75 hover:text-foreground hover:bg-accent/15 hover:shadow-md hover:ring-1 hover:ring-accent/40 group-hover:after:w-3/4 group-hover:after:opacity-100'
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

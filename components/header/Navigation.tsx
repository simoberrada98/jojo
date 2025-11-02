'use client';

import Link from 'next/link';
import { MAIN_NAV_ITEMS } from '@/lib/constants/navigation';

export function Navigation() {
  return (
    <nav
      className="hidden md:flex items-center gap-8"
      aria-label="Main navigation"
    >
      {MAIN_NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="relative text-foreground/80 transition-colors hover:text-foreground after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-accent after:transition-[width] after:duration-200 hover:after:w-full"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

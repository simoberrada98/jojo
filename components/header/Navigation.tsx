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
          className="text-foreground/80 hover:text-accent transition"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  MAIN_NAV_ITEMS,
  type NavigationItem,
} from '@/lib/constants/navigation';

export function Navigation() {
  const pathname = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const menuRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Close dropdowns on Escape for accessibility
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenIndex(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <nav
      className="hidden md:flex items-center gap-3 lg:gap-6"
      aria-label="Main navigation"
      role="navigation"
    >
      {MAIN_NAV_ITEMS.map((item, index) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/' && pathname?.startsWith(item.href));

        const hasChildren =
          Array.isArray(item.children) && item.children.length > 0;

        if (!hasChildren) {
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group inline-flex relative items-center px-3 py-1.5 rounded-full font-medium text-sm transition-[color,background,box-shadow] duration-200',
                'after:absolute after:left-1/2 after:bottom-1 after:h-0.5 after:w-0 after:-translate-x-1/2 after:rounded-full after:bg-accent after:opacity-0 after:transition-all after:duration-300',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-md ring-1 ring-accent/60 after:w-3/4 after:opacity-100'
                  : 'text-foreground/75 hover:text-foreground hover:bg-accent/10 hover:shadow-sm hover:ring-1 hover:ring-accent/30 group-hover:after:w-3/4 group-hover:after:opacity-100'
              )}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <div
            key={item.href}
            className="relative"
            ref={(el) => {
              menuRefs.current[index] = el;
            }}
            onMouseEnter={() => setOpenIndex(index)}
            onMouseLeave={() =>
              setOpenIndex((cur) => (cur === index ? null : cur))
            }
          >
            <button
              type="button"
              className={cn(
                'group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-sm transition-[color,background,box-shadow] duration-200',
                isActive
                  ? 'bg-accent text-accent-foreground shadow-md ring-1 ring-accent/60'
                  : 'text-foreground/75 hover:text-foreground hover:bg-accent/10 hover:shadow-sm hover:ring-1 hover:ring-accent/30'
              )}
              aria-haspopup="menu"
              aria-expanded={openIndex === index}
              aria-controls={`nav-submenu-${index}`}
              onClick={() =>
                setOpenIndex((cur) => (cur === index ? null : index))
              }
              onKeyDown={(e) => {
                if (e.key === 'ArrowDown') setOpenIndex(index);
                if (e.key === 'Escape') setOpenIndex(null);
              }}
            >
              <span>{item.label}</span>
              <ChevronDown
                className={cn(
                  'opacity-70 size-4 transition-transform duration-200',
                  openIndex === index ? 'rotate-180' : 'rotate-0'
                )}
                aria-hidden="true"
              />
            </button>

            {/* Submenu */}
            <div
              id={`nav-submenu-${index}`}
              role="menu"
              aria-label={`${item.label} submenu`}
              className={cn(
                'left-0 absolute bg-card shadow-md mt-2 border ring-border/50 border-border rounded-md ring-1 min-w-[220px]',
                'transition-transform duration-200 ease-out',
                openIndex === index
                  ? 'opacity-100 translate-y-0'
                  : 'pointer-events-none opacity-0 -translate-y-1'
              )}
            >
              <ul className="py-1.5" role="none">
                {item.children?.map((child: NavigationItem) => (
                  <li key={child.href} role="none">
                    <Link
                      href={child.href}
                      role="menuitem"
                      className="block hover:bg-accent/10 px-3 py-1.5 text-foreground/80 hover:text-foreground text-sm"
                    >
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

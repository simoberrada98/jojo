'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className,
  placeholder = 'Search products…',
}: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const initial = params.get('q') || '';
  const [query, setQuery] = useState(initial);
  const [expanded, setExpanded] = useState(false);
  const inputRefOverlay = useRef<HTMLInputElement | null>(null);
  const closeRefOverlay = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setQuery(params.get('q') || '');
  }, [params]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPath = '/products';
    const next = new URLSearchParams(params.toString());
    if (query && query.trim().length > 0) {
      next.set('q', query.trim());
      router.push(`${targetPath}?${next.toString()}`);
    } else {
      next.delete('q');
      router.push(targetPath);
    }
    return false;
  };

  // Auto-focus overlay input when expanded
  useEffect(() => {
    if (!expanded) return;
    inputRefOverlay.current?.focus();
  }, [expanded]);

  const onToggle = () => setExpanded((v) => !v);
  // No inline input: all sizes use overlay

  // Simple focus trap for the mobile overlay: cycle between input and close
  const onOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setExpanded(false);
      return;
    }
    if (e.key === 'Tab') {
      const focusables = [
        inputRefOverlay.current,
        closeRefOverlay.current,
      ].filter(Boolean) as HTMLElement[];
      if (focusables.length < 2) return; // no trap needed
      const active = document.activeElement as HTMLElement | null;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && active === last) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last?.focus();
      }
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={onToggle}
        aria-label="Toggle search"
        aria-expanded={expanded}
        aria-controls="site-search-input"
        className={cn(
          'inline-flex justify-center items-center rounded-md w-9 h-9 transition-colors',
          expanded
            ? 'bg-accent text-accent-foreground shadow-sm'
            : 'bg-card/70 text-foreground/70 hover:text-foreground hover:bg-accent/10 border border-border/80'
        )}
      >
        <Search className="w-4 h-4" />
      </button>

      {/* Full-screen overlay: command palette style on all sizes */}

      {expanded && (
        <div
          className={cn(
            'z-50 fixed inset-0',
            'transition-opacity duration-200 ease-out'
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Site search"
          onKeyDown={onOverlayKeyDown}
        >
          {/* Scrim */}
          <div
            className={cn(
              'absolute inset-0 bg-background/60 backdrop-blur-sm',
              'transition-opacity duration-200 ease-out'
            )}
            onClick={() => setExpanded(false)}
          />

          {/* Content (centered panel) */}
          <div className="relative px-4 pt-24 sm:pt-28">
            <form onSubmit={onSubmit} role="search" aria-label="Site search">
              <div className="mx-auto w-full max-w-lg">
                <div className="flex items-center gap-2 bg-card/90 shadow-lg p-2 border border-border/80 rounded-lg">
                  <input
                    id="site-search-input"
                    ref={inputRefOverlay}
                    aria-label="Search products"
                    className={cn(
                      'flex-1 bg-transparent py-3 pr-10 pl-4 rounded-md h-11 text-base',
                      'placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50'
                    )}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={placeholder}
                    type="search"
                    autoComplete="off"
                  />
                  <button
                    ref={closeRefOverlay}
                    type="button"
                    onClick={() => setExpanded(false)}
                    aria-label="Close search"
                    className={cn(
                      'inline-flex justify-center items-center rounded-md w-10 h-10',
                      'bg-card/70 text-foreground/70 hover:text-foreground hover:bg-accent/10 border border-border/80'
                    )}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </form>
            {/* Helper actions / hierarchy spacing */}
            <div className="mx-auto mt-3 px-1 w-full max-w-lg text-foreground/60 text-xs">
              <span>Press Escape to close. Enter to search.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

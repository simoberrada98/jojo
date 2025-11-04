'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
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

  return (
    <form
      onSubmit={onSubmit}
      className={cn('relative', className)}
      role="search"
      aria-label="Site search"
    >
      <Search className="top-1/2 left-3 absolute -translate-y-1/2 w-4 h-4 text-foreground/60" />
      <input
        aria-label="Search products"
        className={cn(
          'pl-9 pr-3 py-2 bg-card/70 border border-border/80 rounded-md text-sm w-64',
          'placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent/50'
        )}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        type="search"
        autoComplete="off"
      />
    </form>
  );
}

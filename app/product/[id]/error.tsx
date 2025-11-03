'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { H2 } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for diagnostics

    console.error(error);
  }, [error]);

  return (
    <article className="flex flex-col items-center gap-4 py-24">
      <H2 className="font-semibold text-lg">Something went wrong</H2>
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => reset()}
          className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md"
        >
          Try again
        </Button>
        <Link
          href="/"
          className="hover:bg-gray-50 px-4 py-2 border border-gray-300 rounded-md"
        >
          Go home
        </Link>
      </div>
    </article>
  );
}

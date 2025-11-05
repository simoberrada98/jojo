'use client';

import { Button } from '@/components/ui/button';
import { H2, P } from '@/components/ui/typography';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error('[GlobalError]', error?.message, error?.digest);

  return (
    <html>
      <body className="flex justify-center items-center bg-background px-6 min-h-screen text-foreground">
        <article className="space-y-4 max-w-md text-center">
          <H2 className="font-semibold text-2xl">Something went wrong.</H2>
          <P className="text-muted-foreground text-sm">
            Try refreshing the page or come back later. Reference:{' '}
            <span className="font-mono">{error?.digest ?? 'unavailable'}</span>
          </P>
          <Button
            type="button"
            onClick={reset}
            className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm transition"
          >
            Try again
          </Button>
        </article>
      </body>
    </html>
  );
}

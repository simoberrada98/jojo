'use client';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error('[GlobalError]', error?.message, error?.digest);

  return (
    <html>
      <body className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <h2 className="text-2xl font-semibold">Something went wrong.</h2>
          <p className="text-sm text-muted-foreground">
            Try refreshing the page or come back later. Reference:{' '}
            <span className="font-mono">{error?.digest ?? 'unavailable'}</span>
          </p>
          <button
            type="button"
            onClick={reset}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

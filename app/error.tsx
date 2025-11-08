'use client';

import { Button } from '@/components/ui/button';
import { H2, P } from '@/components/ui/typography';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  console.error('[GlobalError]', error?.message, error?.digest);

  const isDev = process.env.NODE_ENV !== 'production';

  // Provide friendlier messaging for common component validation issues (e.g., SelectItem value)
  const message = (() => {
    const raw = error?.message ?? 'Unexpected error';
    const selectValueIssue =
      /Select(Item|\.Item).*value/i.test(raw) ||
      /Invalid\s+Select(Item|\.Item).*value/i.test(raw) ||
      /Select.*value.*(missing|empty|required)/i.test(raw);
    if (selectValueIssue) {
      return 'Select component misconfiguration detected. Each option must have a unique, non-empty string value.';
    }
    return 'Something went wrong.';
  })();

  return (
    <html>
      <body className="flex justify-center items-center bg-background px-6 min-h-screen text-foreground">
        <article className="space-y-4 max-w-md text-center">
          <H2 className="font-semibold text-2xl">{message}</H2>
          <P className="text-muted-foreground text-sm">
            Try refreshing the page or come back later. Reference:{' '}
            <span className="font-mono">{error?.digest ?? 'unavailable'}</span>
          </P>
          {isDev && (
            <div className="bg-muted/30 mt-2 p-3 border rounded-md text-left">
              <P className="m-0 text-xs">
                <span className="font-semibold">Details:</span> {error?.message}
              </P>
            </div>
          )}
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

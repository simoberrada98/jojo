import { H2, P } from '@/components/ui/typography';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex justify-center items-center px-6 py-12 min-h-[60vh]">
      <section className="max-w-xl text-center">
        <H2 className="font-semibold text-3xl tracking-tight">
          Page Not Found
        </H2>
        <P className="mt-3 text-muted-foreground">
          The page you’re looking for doesn’t exist or may have moved.
        </P>
        <div className="mt-6">
          <Link
            href="/"
            className="inline-flex items-center bg-primary hover:bg-primary/90 px-4 py-2 rounded-md font-medium text-primary-foreground text-sm"
          >
            Go back home
          </Link>
        </div>
      </section>
    </main>
  );
}

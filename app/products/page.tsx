'use client';

import { Suspense } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ProductCatalog from '@/components/product-catalog';
import { H1, P } from '@/components/ui/typography';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductsPage() {
  return (
    <PageLayout>
      <main className="pt-20">
        <section className="bg-linear-to-b from-card/40 to-background py-12 md:py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl text-center">
            <H1 className="mb-4 text-4xl md:text-5xl font-bold text-foreground">
              Explore Mining Hardware
            </H1>
            <P className="mx-auto max-w-2xl text-muted-foreground text-lg">
              Browse verified inventory with finance-safe descriptions and
              detailed specifications for every computing server we stock.
            </P>
          </div>
        </section>
        <Suspense fallback={<ProductCatalogSkeleton />}>
          <ProductCatalog />
        </Suspense>
      </main>
    </PageLayout>
  );
}

function ProductCatalogSkeleton() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <Skeleton className="w-64 h-10 mx-auto mb-4" />
          <Skeleton className="w-96 h-6 mx-auto" />
        </div>
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="w-full h-64" />
              <Skeleton className="w-3/4 h-6" />
              <Skeleton className="w-1/2 h-4" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

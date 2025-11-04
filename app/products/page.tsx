import PageLayout from '@/components/layout/PageLayout';
import ProductCatalog from '@/components/product-catalog';
import { H1, P } from '@/components/ui/typography';

export const revalidate = 300;

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
        <ProductCatalog />
      </main>
    </PageLayout>
  );
}

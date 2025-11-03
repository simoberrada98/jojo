import type { Metadata } from 'next';
import {
  fetchActiveProductsForSeo,
  type SeoProduct,
} from '@/lib/data/seo-products';
import { logger } from '@/lib/utils/logger';
import { P, H1, H2 } from '@/components/ui/typography';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://jhuangnyc.com';
const canonicalUrl = `${baseUrl}/products/specs`;
const LAST_UPDATED = 'Nov 2 2025';

export const metadata: Metadata = {
  title: 'Miner Specifications Reference | MineHub',
  description:
    'Up-to-date ASIC product specification matrix with algorithm, hashrate, efficiency, and acoustic profiles for procurement and operations teams.',
  alternates: {
    canonical: '/products/specs',
  },
  openGraph: {
    type: 'article',
    url: canonicalUrl,
    title: 'Miner Specifications Reference',
    description:
      'Compare ASIC products by hashrate, watt draw, efficiency, and expected noise levels before deployment.',
  },
};

function extractNoiseLevel(product: SeoProduct): string {
  if (product.noise_level) {
    return product.noise_level;
  }

  const source = `${product.short_description ?? ''} ${product.description ?? ''}`;
  const match = source.match(/(\d{2,3})\s?(?:dB|db)/i);
  if (match) {
    return `${match[1]} dB`;
  }

  return 'Not specified';
}

export default async function MinersSpecsPage() {
  let products: SeoProduct[] = [];

  try {
    products = await fetchActiveProductsForSeo();
  } catch (error) {
    logger.error('Failed to load product specs for reference page', error);
  }

  const tableRows = products
    .map((product) => ({
      name: product.name,
      url: `${baseUrl}/products/${product.slug}`,
      algorithm: product.algorithm ?? 'Not specified',
      hashrate: product.hash_rate ?? 'Not specified',
      power: product.power_consumption ?? 'Not specified',
      efficiency: product.efficiency ?? 'Not specified',
      noise: extractNoiseLevel(product),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <article className="bg-background text-foreground">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-6xl">
        <header className="mb-10">
          <P className="text-accent text-xs uppercase tracking-widest">
            Reference
          </P>
          <H1 className="mt-3 font-semibold text-4xl md:text-5xl text-balance">
            ASIC Miner Specification Matrix
          </H1>
          <P className="mt-4 text-muted-foreground text-base leading-relaxed">
            Reference live ASIC models with the metrics procurement teams track
            most: algorithm, hashrate, power draw, efficiency, and acoustic
            profile. Link into each product page for warranty, pricing, and
            inventory context.
          </P>
          <div className="flex flex-wrap items-center gap-3 mt-4 text-muted-foreground text-sm">
            <span>Updated {LAST_UPDATED}</span>
            <span aria-hidden="true">|</span>
            <a
              href={`${canonicalUrl}#spec-table`}
              className="text-accent hover:underline underline-offset-4"
            >
              Cite this page
            </a>
          </div>
        </header>

        <section
          id="spec-table"
          aria-labelledby="spec-table-heading"
          className="bg-card/40 border border-border rounded-2xl"
        >
          <div className="px-6 py-5 border-border border-b">
            <H2 id="spec-table-heading" className="font-semibold text-2xl">
              Miner comparison table
            </H2>
            <P className="mt-2 text-muted-foreground text-sm">
              Data sourced from active product listings and refreshed
              dynamically via Supabase inventory sync. Noise levels fall back to
              supplier documentation when not explicitly recorded.
            </P>
          </div>
          <div className="overflow-x-auto">
            <table className="divide-y divide-border w-full min-w-[720px] text-sm text-left">
              <caption className="sr-only">
                Comparison matrix of ASIC products with key specifications
              </caption>
              <thead className="bg-accent/10 text-foreground">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Miner
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Algorithm
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Hashrate
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Power draw
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Efficiency
                  </th>
                  <th scope="col" className="px-4 py-3 font-semibold">
                    Noise level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background/70 divide-y divide-border">
                {tableRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-muted-foreground text-center"
                    >
                      Miner inventory is unavailable right now. Please refresh
                      after syncing Supabase credentials.
                    </td>
                  </tr>
                )}
                {tableRows.map((row) => (
                  <tr key={row.name} className="align-top">
                    <th scope="row" className="px-4 py-3 font-medium">
                      <a
                        href={`${row.url}?utm_source=reference&utm_medium=table&utm_campaign=product-specs`}
                        className="text-accent hover:underline underline-offset-4"
                      >
                        {row.name}
                      </a>
                    </th>
                    <td className="px-4 py-3 text-foreground/80">
                      {row.algorithm}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {row.hashrate}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {row.power}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {row.efficiency}
                    </td>
                    <td className="px-4 py-3 text-foreground/80">
                      {row.noise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section
          id="usage-notes"
          className="bg-card/30 mt-12 p-6 border border-border border-dashed rounded-2xl"
        >
          <H2 className="font-semibold text-2xl">How to use this matrix</H2>
          <ul className="space-y-3 mt-4 pl-5 text-muted-foreground list-disc">
            <li>
              Review efficiency against your facility power cost to prioritise
              miners that reduce heat density per rack.
            </li>
            <li>
              Use the noise column to set acoustic expectations for retail or
              hosted deployments; anything above 75 dB requires hearing
              protection.
            </li>
            <li>
              Follow each linked product page for warranty coverage, payment
              methods, and availability windows.
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}

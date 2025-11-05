import type { Metadata } from 'next';
import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import ProductImage from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import ProductCatalog from '@/components/product-catalog';
import { H1, P, H3 } from '@/components/ui/typography';
import { createClient } from '@/lib/supabase/server';
import { siteMetadata } from '@/lib/seo/site-metadata';

export const metadata: Metadata = {
  title: 'Mining Hardware Collections',
  description: 'Explore our curated collections of cryptocurrency mining hardware, from entry-level ASIC miners to enterprise-grade solutions.',
  alternates: {
    canonical: '/collections',
  },
  openGraph: {
    type: 'website',
    url: `${siteMetadata.baseUrl}/collections`,
    title: 'Mining Hardware Collections',
    description: 'Browse curated collections of premium cryptocurrency mining equipment',
    siteName: siteMetadata.siteName,
    images: [
      {
        url: '/og/og_square.jpg',
        width: 1200,
        height: 1200,
        alt: 'Mining Hardware Collections',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mining Hardware Collections',
    description: 'Browse curated collections of premium cryptocurrency mining equipment',
    images: ['/og/og_square.jpg'],
  },
};

type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
  position: number | null;
};

async function fetchCollections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('position', { ascending: true });
  if (error) return [] as CollectionRow[];
  return (data || []) as CollectionRow[];
}

interface ProductCollectionRow {
  collection_id: string;
}

async function fetchProductCounts(collectionIds: string[]) {
  if (collectionIds.length === 0) return new Map<string, number>();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('product_collections')
    .select('id, product_id, collection_id')
    .in('collection_id', collectionIds);
  const map = new Map<string, number>();
  if (!error && data) {
    for (const row of data as ProductCollectionRow[]) {
      const cid = row.collection_id;
      map.set(cid, (map.get(cid) || 0) + 1);
    }
  }
  return map;
}

function pickCategoryTheme(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('gpu')) return 'GPU';
  if (n.includes('enterprise')) return 'Enterprise';
  if (n.includes('compact')) return 'Compact';
  return 'ASIC';
}

export default async function CollectionPage() {
  const collections = await fetchCollections();
  const counts = await fetchProductCounts(collections.map((c) => c.id));

  return (
    <PageLayout>
      <main className="pt-20">
        {/* Breadcrumb */}
        <div className="border-border border-b">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
            <div className="flex items-center gap-2 text-sm">
              <Link
                href="/"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                Home
              </Link>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium text-foreground">Collections</span>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-linear-to-b from-card/50 to-background py-12 md:py-16">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="text-center">
              <H1 className="mb-4 font-bold text-foreground text-4xl md:text-5xl">
                Mining Hardware Collections
              </H1>
              <P className="mx-auto max-w-2xl text-muted-foreground text-lg">
                Explore our curated collections of mining hardware, from
                entry-level to enterprise-grade solutions
              </P>
            </div>
          </div>
        </section>

        {/* Collections Grid */}
        <section className="mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href="/products"
                className="group block"
              >
                <div className="relative mb-4 border border-border group-hover:border-accent rounded-lg h-64 overflow-hidden transition-all duration-300">
                  <div className="h-full group-hover:scale-105 transition-transform duration-500">
                    <ProductImage
                      category={pickCategoryTheme(collection.name)}
                    />
                  </div>
                  {collection.is_featured && (
                    <div className="top-4 right-4 z-10 absolute bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full font-semibold text-xs text-accent-foreground">
                      Featured
                    </div>
                  )}
                </div>
                <H3 className="mb-2 font-bold text-foreground group-hover:text-accent text-xl transition-colors">
                  {collection.name}
                </H3>
                <P className="mb-4 text-muted-foreground text-sm">
                  {collection.description || ''}
                </P>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-accent text-xs">
                    {counts.get(collection.id) || 0} Products
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:bg-accent/10 text-accent hover:text-accent"
                  >
                    Explore →
                  </Button>
                </div>
              </Link>
            ))}
          </div>
          <ProductCatalog />
        </section>
      </main>
    </PageLayout>
  );
}

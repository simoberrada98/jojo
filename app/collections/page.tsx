'use client';

import Link from 'next/link';
import PageLayout from '@/components/layout/PageLayout';
import ProductImage from '@/components/product-image';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import ProductCatalog from '@/components/product-catalog';
import { H1, P, H3 } from '@/components/ui/typography';

const collections = [
  {
    id: 'asic-miners',
    name: 'ASIC Miners',
    category: 'ASIC',
    description:
      'Professional ASIC mining hardware for Bitcoin and other cryptocurrencies',
    productCount: 12,
    featured: true,
  },
  {
    id: 'gpu-rigs',
    name: 'GPU Mining Rigs',
    category: 'GPU',
    description: 'High-performance GPU rigs for Ethereum and altcoin mining',
    productCount: 8,
    featured: true,
  },
  {
    id: 'compact-miners',
    name: 'Compact Miners',
    category: 'Compact',
    description:
      'Space-efficient mining solutions for home and small operations',
    productCount: 6,
    featured: false,
  },
  {
    id: 'enterprise-solutions',
    name: 'Enterprise Solutions',
    category: 'Enterprise',
    description: 'Large-scale mining infrastructure and datacenter equipment',
    productCount: 15,
    featured: true,
  },
  {
    id: 'accessories',
    name: 'Mining Accessories',
    category: 'ASIC',
    description: 'Power supplies, cooling systems, and mining accessories',
    productCount: 24,
    featured: false,
  },
  {
    id: 'software-tools',
    name: 'Software & Tools',
    category: 'GPU',
    description:
      'Mining software, monitoring tools, and optimization utilities',
    productCount: 10,
    featured: false,
  },
];

export default function CollectionPage() {
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
                    <ProductImage category={collection.category} />
                  </div>
                  {collection.featured && (
                    <div className="top-4 right-4 z-10 absolute bg-accent/90 backdrop-blur-sm px-3 py-1 rounded-full font-semibold text-xs text-accent-foreground">
                      Featured
                    </div>
                  )}
                </div>
                <H3 className="mb-2 font-bold text-foreground group-hover:text-accent text-xl transition-colors">
                  {collection.name}
                </H3>
                <P className="mb-4 text-muted-foreground text-sm">
                  {collection.description}
                </P>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-accent text-xs">
                    {collection.productCount} Products
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

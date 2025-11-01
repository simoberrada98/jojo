'use client';

import PageLayout from '@/components/layout/PageLayout';
import HeroSection from '@/components/hero-section';
import TrustedBySection from '@/components/trusted-by';
import TopProducts from '@/components/top-products';

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <TrustedBySection />
      <TopProducts />
    </PageLayout>
  );
}

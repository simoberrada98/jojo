"use client";

import PageLayout from "@/components/layout/PageLayout";
import HeroSection from "@/components/hero-section";
import TopProducts from "@/components/top-products";
import ProductCatalog from "@/components/product-catalog";

export default function Home() {
  return (
    <PageLayout>
      <HeroSection />
      <TopProducts />
      <ProductCatalog />
    </PageLayout>
  );
}

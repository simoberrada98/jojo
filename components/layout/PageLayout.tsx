"use client";

import type { ReactNode } from "react";
import Header from "../header";
import Footer from "../footer";
import { useCart } from "@/lib/contexts/cart-context";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { itemCount } = useCart();

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header cartCount={itemCount} />
      <main className="flex-grow pt-24">{children}</main>
      <Footer />
    </div>
  );
}

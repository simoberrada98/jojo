"use client";

import type { ReactNode } from "react";

import Footer from "../footer";
import { useCart } from "@/lib/contexts/cart-context";
import { Header } from "../header/Header";

interface PageLayoutProps {
  children: ReactNode;
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { itemCount } = useCart();

  return (
    <div className="relative flex min-h-screen flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-background/60 backdrop-blur-2xl"
      />
      <Header cartCount={itemCount} />
      <main className="grow">{children}</main>
      <Footer />
    </div>
  );
}

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
    <div className="relative flex min-h-screen flex-col bg-background">
      <Header cartCount={itemCount} />
      <main className="grow ">{children}</main>
      <Footer />
    </div>
  );
}

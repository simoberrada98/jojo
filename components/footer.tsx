"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { H4, Muted } from "@/components/ui/typography";

export function Footer() {
  return (
    <footer className="bg-card border-border border-t" role="contentinfo">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-7xl">
        <div
          className="gap-8 grid grid-cols-1 md:grid-cols-4 mb-8"
          role="navigation"
          aria-label="Footer navigation"
        >
          {/* Brand */}
          <div>
            <BrandLogo className="w-48 text-white" title="Jhuangnyc" />
          </div>

          {/* Products */}
          <div>
            <H4 className="mb-4 font-semibold text-base">Products</H4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li>
                <Link
                  href="/collection"
                  className="hover:text-accent transition"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="hover:text-accent transition"
                >
                  ASIC Miners
                </Link>
              </li>
              <li>
                <Link
                  href="/collection"
                  className="hover:text-accent transition"
                >
                  GPU Rigs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <H4 className="mb-4 font-semibold text-base">Company</H4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li>
                <Link href="/about" className="hover:text-accent transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-accent transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-accent transition">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-accent transition">
                  Returns & Refunds
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Info */}
          <div>
            <H4 className="mb-4 font-semibold text-base">Legal</H4>
            <ul className="space-y-2 text-foreground/60 text-sm">
              <li>
                <Link
                  href="/privacy-policy"
                  className="hover:text-accent transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-of-service"
                  className="hover:text-accent transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-accent transition">
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-accent transition">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex sm:flex-row flex-col justify-between items-center pt-8 border-border border-t text-foreground/60 text-sm">
          <Muted className="m-0">
            &copy; 2025 Jhuangnyc. All rights reserved.
          </Muted>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link
              href="/privacy-policy"
              className="hover:text-accent transition"
            >
              Privacy
            </Link>
            <Link
              href="/terms-of-service"
              className="hover:text-accent transition"
            >
              Terms
            </Link>
            <Link href="/returns" className="hover:text-accent transition">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

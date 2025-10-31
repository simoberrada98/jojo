"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { H4, Muted } from "@/components/ui/typography"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8" role="navigation" aria-label="Footer navigation">
          {/* Brand */}
          <div>
            <BrandLogo className="w-48 text-white" title="Jhuangnyc" />
          </div>

          {/* Products */}
          <div>
            <H4 className="font-semibold mb-4 text-base">Products</H4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <Link href="/collection" className="hover:text-accent transition">
                  Collections
                </Link>
              </li>
              <li>
                <Link href="/collection" className="hover:text-accent transition">
                  ASIC Miners
                </Link>
              </li>
              <li>
                <Link href="/collection" className="hover:text-accent transition">
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
            <H4 className="font-semibold mb-4 text-base">Company</H4>
            <ul className="space-y-2 text-sm text-foreground/60">
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
            <H4 className="font-semibold mb-4 text-base">Legal</H4>
            <ul className="space-y-2 text-sm text-foreground/60">
              <li>
                <Link href="/privacy" className="hover:text-accent transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-accent transition">
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
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-foreground/60">
          <Muted className="m-0">&copy; 2025 Jhuangnyc. All rights reserved.</Muted>
          <div className="flex gap-6 mt-4 sm:mt-0">
            <Link href="/privacy" className="hover:text-accent transition">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-accent transition">
              Terms
            </Link>
            <Link href="/returns" className="hover:text-accent transition">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

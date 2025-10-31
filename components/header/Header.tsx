"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { AuthDialog } from "@/components/auth-dialog";
import CurrencyToggle from "@/components/currency-toggle";
import { BrandLogo } from "@/components/brand-logo";
import { APP_BRANDING } from "@/lib/constants/navigation";
import { CartButton } from "./CartButton";
import { Navigation } from "./Navigation";
import { UserMenu } from "./UserMenu";
import { MobileMenu } from "./MobileMenu";

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 bg-background/60 backdrop-blur-md border-b border-border"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={`${APP_BRANDING.name} home`}
          >
            <BrandLogo className="text-foreground p-6" decorative />

            <span className="sr-only">{APP_BRANDING.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <Navigation />

          {/* Actions: Currency Toggle, Cart, User Menu, Mobile Toggle */}
          <div className="flex items-center gap-4">
            <CurrencyToggle />
            <CartButton cartCount={cartCount} />
            <UserMenu onAuthDialogOpen={() => setAuthDialogOpen(true)} />

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          <MobileMenu
            isOpen={isOpen}
            onAuthDialogOpen={() => setAuthDialogOpen(true)}
          />
        </AnimatePresence>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </motion.header>
  );
}

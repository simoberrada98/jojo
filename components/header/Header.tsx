'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { AuthDialog } from '@/components/auth-dialog';
import CurrencyToggle from '@/components/currency-toggle';
import { BrandLogo } from '@/components/brand-logo';
import { APP_BRANDING } from '@/lib/constants/navigation';
import { CartButton } from './CartButton';
import { Navigation } from './Navigation';
import { UserMenu } from './UserMenu';
import { MobileMenu } from './MobileMenu';
import { useAnimationConfig } from '@/lib/animation';
import { MotionButton } from '@/components/ui/button';
import { SearchBar } from '@/components/search/SearchBar';

interface HeaderProps {
  cartCount?: number;
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const anim = useAnimationConfig();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: anim.enter, ease: anim.easeStandard }}
      className="top-0 z-50 fixed bg-background/60 backdrop-blur-md border-border border-b w-full"
      role="banner"
    >
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label={`${APP_BRANDING.name} home`}
          >
            <BrandLogo className="p-4 sm:p-6 text-foreground" decorative />

            <span className="sr-only">{APP_BRANDING.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <Navigation />

          {/* Actions: Search, Currency Toggle, Cart, User Menu, Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            <CurrencyToggle />
            <CartButton cartCount={cartCount} />
            <UserMenu onAuthDialogOpen={() => setAuthDialogOpen(true)} />

            {/* Mobile Menu Button */}
            <MotionButton
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </MotionButton>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          <MobileMenu
            isOpen={isOpen}
            onAuthDialogOpen={() => setAuthDialogOpen(true)}
            onClose={() => setIsOpen(false)}
          />
        </AnimatePresence>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </motion.header>
  );
}

'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Package, Heart, Settings, LogOut, X } from 'lucide-react';
import { Muted } from '@/components/ui/typography';
import { useAuth } from '@/lib/contexts/auth-context';
import CurrencyToggle from '@/components/currency-toggle';
import { MAIN_NAV_ITEMS, USER_DASHBOARD_NAV, type NavigationItem } from '@/lib/constants/navigation';
import { SearchBar } from '@/components/search/SearchBar';
import { useAnimationConfig } from '@/lib/animation';
import { Button } from '../ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  onAuthDialogOpen: () => void;
  onClose: () => void;
}

const iconMap = {
  User,
  Package,
  Heart,
  Settings,
};

export function MobileMenu({
  isOpen,
  onAuthDialogOpen,
  onClose,
}: MobileMenuProps) {
  const { user, profile, signOut } = useAuth();
  const anim = useAnimationConfig();

  // Close on Escape key for accessibility (stable hook order)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.nav
      initial={{ y: '-100%' }}
      animate={{ y: 0 }}
      exit={{ y: '-100%' }}
      transition={{ duration: anim.pageTransition, ease: anim.easeStandard }}
      className="md:hidden z-50 fixed inset-0 flex flex-col gap-3 sm:gap-4 bg-background p-3 sm:p-4 h-dvh overflow-y-auto"
      aria-label="Mobile navigation"
    >
      {/* Top affordances: handle and close button */}
      <div className="relative pb-1">
        <div
          className="bg-muted/70 mx-auto mt-1 rounded-full w-10 h-1"
          aria-hidden
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex top-0 right-0 absolute justify-center items-center rounded-md w-14 h-14 text-foreground/80 hover:text-accent transition"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Currency Toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: anim.enter, ease: anim.easeStandard }}
        className="pb-2 border-border border-b"
      >
        <CurrencyToggle />
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: anim.enter, ease: anim.easeStandard }}
        className="px-2"
      >
        <SearchBar className="w-full" />
      </motion.div>

      <ul className="flex flex-col flex-1 gap-1 p-2 min-h-fill">
        {MAIN_NAV_ITEMS.map((item) => {
          const hasChildren = Array.isArray(item.children) && item.children.length > 0;
          return (
            <motion.li
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: anim.enter, ease: anim.easeStandard }}
              className="w-full"
            >
              <Link
                href={item.href}
                onClick={onClose}
                className="block p-2 text-foreground/80 text-md hover:text-accent sm:text-base transition"
              >
                {item.label}
              </Link>
              {hasChildren ? (
                <ul className="ml-3 pl-2 border-l border-border">
                  {item.children?.map((child: NavigationItem) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={onClose}
                        className="block px-2 py-1 text-foreground/70 text-sm hover:text-foreground hover:bg-accent/10 rounded"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </motion.li>
          );
        })}
      </ul>
      {/* User Menu */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: anim.enter, ease: anim.easeStandard }}
        className="pt-2 border-border border-t"
      >
        {user ? (
          <>
            <div className="mb-2 pb-2 border-border border-b">
              <Muted className="m-0 font-medium text-foreground text-sm">
                {profile?.full_name || 'My Account'}
              </Muted>
              <Muted className="m-0 text-xs break-all">{user.email}</Muted>
            </div>
            {USER_DASHBOARD_NAV.map((item) => {
              const Icon = item.icon
                ? iconMap[item.icon as keyof typeof iconMap]
                : User;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={async () => {
                try {
                  await Promise.resolve(signOut());
                } finally {
                  onClose();
                }
              }}
              className="flex items-center gap-2 py-2 w-full text-destructive hover:text-destructive/80 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <button
            onClick={() => {
              onAuthDialogOpen();
              onClose();
            }}
            className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition"
          >
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        )}
      </motion.div>
    </motion.nav>
  );
}

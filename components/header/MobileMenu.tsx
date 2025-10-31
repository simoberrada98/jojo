"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User, Package, Heart, Settings, LogOut } from "lucide-react";
import { Muted } from "@/components/ui/typography";
import { useAuth } from "@/lib/contexts/auth-context";
import CurrencyToggle from "@/components/currency-toggle";
import { MAIN_NAV_ITEMS, USER_DASHBOARD_NAV } from "@/lib/constants/navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onAuthDialogOpen: () => void;
}

const iconMap = {
  User,
  Package,
  Heart,
  Settings,
};

export function MobileMenu({ isOpen, onAuthDialogOpen }: MobileMenuProps) {
  const { user, profile, signOut } = useAuth();

  if (!isOpen) return null;

  return (
    <motion.nav
      initial={{ y: "-100%", opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="md:hidden flex flex-col gap-4 pb-4"
      aria-label="Mobile navigation"
    >
      {/* Currency Toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="pb-2 border-border border-b"
      >
        <CurrencyToggle />
      </motion.div>

      {/* Main Navigation */}
      {MAIN_NAV_ITEMS.map((item) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href={item.href}
            className="text-foreground/80 hover:text-accent transition"
          >
            {item.label}
          </Link>
        </motion.div>
      ))}

      {/* User Menu */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="pt-2 border-border border-t"
      >
        {user ? (
          <>
            <div className="mb-2 pb-2 border-border border-b">
              <Muted className="m-0 font-medium text-foreground text-sm">
                {profile?.full_name || "My Account"}
              </Muted>
              <Muted className="m-0 text-xs">{user.email}</Muted>
            </div>
            {USER_DASHBOARD_NAV.map((item) => {
              const Icon = item.icon
                ? iconMap[item.icon as keyof typeof iconMap]
                : User;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 py-2 w-full text-destructive hover:text-destructive/80 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <button
            onClick={onAuthDialogOpen}
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

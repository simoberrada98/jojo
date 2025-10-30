"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { User, Package, Heart, Settings, LogOut } from "lucide-react"
import { Muted } from "@/components/ui/typography"
import { useAuth } from "@/lib/contexts/auth-context"
import CurrencyToggle from "@/components/currency-toggle"
import { MAIN_NAV_ITEMS, USER_DASHBOARD_NAV } from "@/lib/constants/navigation"

interface MobileMenuProps {
  isOpen: boolean
  onAuthDialogOpen: () => void
}

const iconMap = {
  User,
  Package,
  Heart,
  Settings,
}

export function MobileMenu({ isOpen, onAuthDialogOpen }: MobileMenuProps) {
  const { user, profile, signOut } = useAuth()

  if (!isOpen) return null

  return (
    <motion.nav
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="md:hidden pb-4 flex flex-col gap-4 overflow-hidden"
      aria-label="Mobile navigation"
    >
      {/* Currency Toggle */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="pb-2 border-b border-border"
      >
        <CurrencyToggle />
      </motion.div>

      {/* Main Navigation */}
      {MAIN_NAV_ITEMS.map((item, index) => (
        <motion.div
          key={item.href}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + index * 0.05 }}
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
        transition={{ delay: 0.3 }}
        className="pt-2 border-t border-border"
      >
        {user ? (
          <>
            <div className="pb-2 mb-2 border-b border-border">
              <Muted className="text-sm font-medium m-0 text-foreground">
                {profile?.full_name || "My Account"}
              </Muted>
              <Muted className="text-xs m-0">{user.email}</Muted>
            </div>
            {USER_DASHBOARD_NAV.map((item) => {
              const Icon = item.icon ? iconMap[item.icon as keyof typeof iconMap] : User
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 py-2 w-full text-destructive hover:text-destructive/80 transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </button>
          </>
        ) : (
          <button
            onClick={onAuthDialogOpen}
            className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition"
          >
            <User className="h-4 w-4" />
            <span>Sign In</span>
          </button>
        )}
      </motion.div>
    </motion.nav>
  )
}

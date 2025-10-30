"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ShoppingCart, Menu, X, User, Settings, LogOut, Package, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Muted } from "@/components/ui/typography"
import { useAuth } from "@/lib/contexts/auth-context"
import { AuthDialog } from "@/components/auth-dialog"
import CurrencyToggle from "@/components/currency-toggle"

interface HeaderProps {
  cartCount?: number
}

export default function Header({ cartCount = 0 }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const { user, profile, signOut } = useAuth()
  
  const getInitials = (email?: string) => {
    if (!email) return "U"
    return email.substring(0, 2).toUpperCase()
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border"
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 180, transition: { duration: 0.5 } }}
              className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-lg">⚙</span>
            </motion.div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">MineHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            <Link href="/collection" className="text-foreground/80 hover:text-accent transition">
              Collections
            </Link>
            <Link href="/contact" className="text-foreground/80 hover:text-accent transition">
              Contact
            </Link>
            <Link href="/shipping" className="text-foreground/80 hover:text-accent transition">
              Shipping
            </Link>
          </nav>

          {/* Currency Toggle, Cart, User Menu and Mobile Menu */}
          <div className="flex items-center gap-4">
            <CurrencyToggle />
            <Link href="/cart" className="relative">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button variant="ghost" size="icon" className="glow-accent-hover">
                  <ShoppingCart className="w-5 h-5" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </Link>

            {/* User Account Dropdown */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <Muted className="text-sm font-medium leading-none m-0 text-foreground">
                        {profile?.full_name || "My Account"}
                      </Muted>
                      <Muted className="text-xs leading-none m-0">
                        {user.email}
                      </Muted>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/orders" className="cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/wishlist" className="cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive focus:text-destructive"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAuthDialogOpen(true)}
                className="rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden pb-4 flex flex-col gap-4 overflow-hidden"
              aria-label="Mobile navigation"
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="pb-2 border-b border-border"
              >
                <CurrencyToggle />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Link href="/collection" className="text-foreground/80 hover:text-accent transition">
                  Collections
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/contact" className="text-foreground/80 hover:text-accent transition">
                  Contact
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 }}
              >
                <Link href="/shipping" className="text-foreground/80 hover:text-accent transition">
                  Shipping
                </Link>
              </motion.div>
            
              {/* Mobile User Menu */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-2 border-t border-border"
              >
              {user ? (
                <>
                  <div className="pb-2 mb-2 border-b border-border">
                    <Muted className="text-sm font-medium m-0 text-foreground">{profile?.full_name || "My Account"}</Muted>
                    <Muted className="text-xs m-0">{user.email}</Muted>
                  </div>
                  <Link href="/dashboard" className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition">
                    <User className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link href="/dashboard/orders" className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition">
                    <Package className="h-4 w-4" />
                    <span>Orders</span>
                  </Link>
                  <Link href="/dashboard/wishlist" className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition">
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                  <Link href="/dashboard/settings" className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
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
                  onClick={() => setAuthDialogOpen(true)}
                  className="flex items-center gap-2 py-2 text-foreground/80 hover:text-accent transition"
                >
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
              </motion.div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
      
      {/* Auth Dialog */}
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </motion.header>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  cartCount?: number
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">⚙</span>
            </div>
            <span className="text-xl font-bold text-foreground hidden sm:inline">MineHub</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
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

          {/* Cart and Mobile Menu */}
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" className="glow-accent-hover">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-4">
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
        )}
      </div>
    </header>
  )
}

export default Header

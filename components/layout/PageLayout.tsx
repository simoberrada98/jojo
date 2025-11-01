'use client'

import type { ReactNode } from 'react'

import Footer from '../footer'
import { useCart } from '@/lib/contexts/cart-context'
import { Header } from '../header/Header'

interface PageLayoutProps {
  children: ReactNode
}

export default function PageLayout({ children }: PageLayoutProps) {
  const { itemCount } = useCart()

  return (
    <div className='relative flex flex-col min-h-screen'>
      <div
        aria-hidden
        className='-z-10 absolute inset-0 bg-background/60 backdrop-blur-2xl pointer-events-none'
      />
      <Header cartCount={itemCount} />
      <main className='grow'>{children}</main>
      <Footer />
    </div>
  )
}

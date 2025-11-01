'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CartButtonProps {
  cartCount: number;
}

export function CartButton({ cartCount }: CartButtonProps) {
  return (
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
                className="-top-2 -right-2 absolute flex justify-center items-center bg-accent rounded-full w-5 h-5 text-xs text-accent-foreground"
              >
                {cartCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>
    </Link>
  );
}

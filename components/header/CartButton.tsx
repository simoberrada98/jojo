'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { MotionButton } from '@/components/ui/button';
import { useAnimationConfig } from '@/lib/animation';

interface CartButtonProps {
  cartCount: number;
}

export function CartButton({ cartCount }: CartButtonProps) {
  const anim = useAnimationConfig();
  return (
    <Link href="/cart" className="relative">
      <MotionButton variant="ghost" size="icon" className="glow-accent-hover">
        <ShoppingCart className="w-5 h-5" />
        <AnimatePresence>
          {cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: 'tween', duration: anim.tap }}
              className="-top-2 -right-2 absolute flex justify-center items-center bg-accent rounded-full w-5 h-5 text-xs text-accent-foreground"
            >
              {cartCount}
            </motion.span>
          )}
        </AnimatePresence>
      </MotionButton>
    </Link>
  );
}

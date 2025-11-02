'use client';

import { motion } from 'framer-motion';
import { ReactNode, useMemo } from 'react';
import { useAnimationConfig } from '@/lib/animation';

interface AnimatedPageProps {
  children: ReactNode;
  className?: string;
}

export default function AnimatedPage({
  children,
  className = '',
}: AnimatedPageProps) {
  const anim = useAnimationConfig();
  const pageVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: 20 },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: anim.enter,
          ease: anim.easeStandard,
        },
      },
      exit: {
        opacity: 0,
        y: -20,
        transition: {
          duration: Math.max(0.2, anim.pageTransition - 0.05),
          ease: 'easeIn' as const,
        },
      },
    }),
    [anim]
  );
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

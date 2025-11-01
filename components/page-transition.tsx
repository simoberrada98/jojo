'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode, useEffect, useMemo, useState } from 'react'

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1024 : window.innerWidth
  )

  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const isMobile = viewportWidth < 768
  const lineCount = isMobile ? 8 : 16
  const particleCount = isMobile ? 12 : 24

  const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10_000
    return x - Math.floor(x)
  }

  const horizontalLines = useMemo(
    () => Array.from({ length: 16 }, (_, i) => i),
    []
  )

  const verticalLines = horizontalLines

  const particleData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        left: `${pseudoRandom(i + 1) * 100}%`,
        top: `${pseudoRandom(i + 3) * 100}%`,
        delay: pseudoRandom(i + 5) * 0.25
      })),
    []
  )

  const overlayDuration = isMobile ? 0.4 : 0.5
  const gridLineDelay = isMobile ? 0.015 : 0.01

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.005 }}
        transition={{
          duration: 0.3,
          ease: [0.45, 0.05, 0.55, 0.95]
        }}
      >
        {/* Animated overlay layers - kept lightweight for responsiveness */}
        {!prefersReducedMotion && (
          <motion.div
            className='z-50 fixed inset-0 pointer-events-none'
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: overlayDuration }}
          >
            {/* Diagonal wipe effect */}
            <motion.div
              className='absolute inset-0 bg-linear-to-br from-accent/20 via-primary/10 to-transparent'
              initial={{ x: '-100%', skewX: -10 }}
              animate={{ x: '100%' }}
              transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
            />

            {/* Digital grid lines */}
            <motion.div
              className='absolute inset-0 overflow-hidden'
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: overlayDuration, delay: 0.12 }}
            >
              {horizontalLines.slice(0, lineCount).map((i) => (
                <motion.div
                  key={`h-${i}`}
                  className='absolute bg-linear-to-r from-transparent via-accent/30 to-transparent w-full h-px'
                  style={{ top: `${i * (100 / lineCount)}%` }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.45,
                    delay: i * gridLineDelay,
                    ease: 'easeOut'
                  }}
                />
              ))}
              {verticalLines.slice(0, lineCount).map((i) => (
                <motion.div
                  key={`v-${i}`}
                  className='absolute bg-linear-to-b from-transparent via-accent/20 to-transparent w-px h-full'
                  style={{ left: `${i * (100 / lineCount)}%` }}
                  initial={{ scaleY: 0, opacity: 0 }}
                  animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                  transition={{
                    duration: 0.45,
                    delay: i * gridLineDelay,
                    ease: 'easeOut'
                  }}
                />
              ))}
            </motion.div>

            {/* Glowing particles - only render on client */}
            {mounted && (
              <div className='absolute inset-0'>
                {particleData.slice(0, particleCount).map((particle) => (
                  <motion.div
                    key={`particle-${particle.id}`}
                    className='absolute bg-accent rounded-full w-1 h-1'
                    style={{
                      left: particle.left,
                      top: particle.top
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.4, 0],
                      y: [-14, 14]
                    }}
                    transition={{
                      duration: 0.75,
                      delay: particle.delay,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            )}

            {/* Hexagon pattern overlay */}
            <motion.div
              className='absolute inset-0 opacity-10'
              initial={{ scale: 1.1, rotate: 0 }}
              animate={{ scale: 1, rotate: 4 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <svg className='w-full h-full' xmlns='http://www.w3.org/2000/svg'>
                <defs>
                  <pattern
                    id='hexagons'
                    x='0'
                    y='0'
                    width='50'
                    height='43.4'
                    patternUnits='userSpaceOnUse'
                  >
                    <path
                      d='M25 0 L43.3 12.5 L43.3 31.2 L25 43.4 L6.7 31.2 L6.7 12.5 Z'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='0.5'
                      className='text-accent'
                    />
                  </pattern>
                </defs>
                <rect width='100%' height='100%' fill='url(#hexagons)' />
              </svg>
            </motion.div>

            {/* Scan line effect */}
            <motion.div
              className='absolute inset-x-0 bg-linear-to-r from-transparent via-accent to-transparent h-px'
              initial={{ top: '0%', opacity: 1 }}
              animate={{ top: '100%', opacity: 0 }}
              transition={{ duration: overlayDuration, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Page content */}
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

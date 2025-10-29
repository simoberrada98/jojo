"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode, useState, useEffect } from "react"

interface PageTransitionProps {
  children: ReactNode
}

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{
          duration: 0.3,
          ease: [0.43, 0.13, 0.23, 0.96],
        }}
      >
        {/* Animated overlay layers */}
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Diagonal wipe effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-accent/20 via-primary/10 to-transparent"
            initial={{ x: "-100%", skewX: -12 }}
            animate={{ x: "100%" }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          />
          
          {/* Digital grid lines */}
          <motion.div
            className="absolute inset-0 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`h-${i}`}
                className="absolute w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent"
                style={{ top: `${i * 5}%` }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.01,
                  ease: "easeOut",
                }}
              />
            ))}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={`v-${i}`}
                className="absolute h-full w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent"
                style={{ left: `${i * 5}%` }}
                initial={{ scaleY: 0, opacity: 0 }}
                animate={{ scaleY: 1, opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.5,
                  delay: i * 0.01,
                  ease: "easeOut",
                }}
              />
            ))}
          </motion.div>

          {/* Glowing particles - only render on client */}
          {mounted && (
            <div className="absolute inset-0">
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 bg-accent rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1.5, 0],
                    y: [-20, 20],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: Math.random() * 0.3,
                    ease: "easeOut",
                  }}
                />
              ))}
            </div>
          )}

          {/* Hexagon pattern overlay */}
          <motion.div
            className="absolute inset-0 opacity-10"
            initial={{ scale: 1.2, rotate: 0 }}
            animate={{ scale: 1, rotate: 5 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="hexagons" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
                  <path
                    d="M25 0 L43.3 12.5 L43.3 31.2 L25 43.4 L6.7 31.2 L6.7 12.5 Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-accent"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#hexagons)" />
            </svg>
          </motion.div>

          {/* Scan line effect */}
          <motion.div
            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent"
            initial={{ top: "0%", opacity: 1 }}
            animate={{ top: "100%", opacity: 0 }}
            transition={{ duration: 0.6, ease: "linear" }}
          />
        </motion.div>

        {/* Page content */}
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

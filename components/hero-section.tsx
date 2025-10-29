"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronDown, Zap, Shield, Cpu } from "lucide-react"

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative w-full h-screen overflow-hidden pt-16">
      {/* Parallax Background */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Animated Grid Background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(102, 204, 255, 0.05) 25%, rgba(102, 204, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(102, 204, 255, 0.05) 75%, rgba(102, 204, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(102, 204, 255, 0.05) 25%, rgba(102, 204, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(102, 204, 255, 0.05) 75%, rgba(102, 204, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: "50px 50px",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />
      </div>

      {/* Floating orbs with parallax */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          style={{
            top: "10%",
            left: "10%",
            transform: `translate(${mousePosition.x * 0.02}px, ${scrollY * 0.4}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          style={{
            bottom: "10%",
            right: "10%",
            transform: `translate(${-mousePosition.x * 0.02}px, ${-scrollY * 0.4}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/20 border border-primary/50 backdrop-blur-sm"
          >
            <span className="text-sm font-semibold text-accent flex items-center gap-2">
              <Zap className="w-4 h-4" /> Next Generation Mining Hardware
            </span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 text-balance leading-tight"
          >
            <span className="text-foreground">Maximize Your</span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Mining Potential
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg sm:text-xl text-foreground/70 mb-8 max-w-2xl mx-auto text-balance leading-relaxed"
          >
            Professional-grade mining hardware with cutting-edge technology. Pay with crypto, mine with confidence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
          >
            <a href="#products">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground glow-accent-hover transition-all duration-300"
                >
                  Shop Now
                </Button>
              </motion.div>
            </a>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="border-accent text-accent hover:bg-accent/10 bg-transparent transition-all duration-300"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats with icons */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 1,
                },
              },
            }}
            className="grid grid-cols-3 gap-4 sm:gap-8 mt-12"
          >
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Cpu className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-accent font-mono">10K+</div>
              <div className="text-sm text-foreground/60">Active Miners</div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-accent font-mono">99.9%</div>
              <div className="text-sm text-foreground/60">Uptime</div>
            </motion.div>
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
              }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
              className="group"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Zap className="w-6 h-6 text-accent" />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-accent font-mono">24/7</div>
              <div className="text-sm text-foreground/60">Support</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{
            opacity: 1 - scrollY / 300,
          }}
        >
          <ChevronDown className="w-6 h-6 text-accent" />
        </div>
      </div>
    </section>
  )
}

'use client'

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { motion, useInView } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronDown, Zap, Shield, Cpu } from 'lucide-react'

type StatConfig = {
  icon: typeof Cpu
  label: string
  target: number
  format: (value: number) => string
}

export default function HeroSection() {
  const clamp = useCallback(
    (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max),
    []
  )

  const headingLines = useMemo(() => ['Maximize Your', 'Mining Potential'], [])
  const [typedLines, setTypedLines] = useState(() => headingLines.map(() => ''))
  const [headingComplete, setHeadingComplete] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [pointerPosition, setPointerPosition] = useState({ x: 0, y: 0 })
  const [deviceTilt, setDeviceTilt] = useState({ x: 0, y: 0 })

  const pointerRaf = useRef<number | null>(null)
  const tiltRaf = useRef<number | null>(null)
  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null)

  const stats = useMemo<StatConfig[]>(
    () => [
      {
        icon: Cpu,
        label: 'Active Miners',
        target: 12_000,
        format: (value) => `${Math.round(value).toLocaleString()}+`
      },
      {
        icon: Shield,
        label: 'Verified Uptime',
        target: 99.9,
        format: (value) => `${value.toFixed(1)}%`
      },
      {
        icon: Zap,
        label: 'Support Coverage',
        target: 24,
        format: (value) => `${Math.max(1, Math.round(value))}/7`
      }
    ],
    []
  )

  const [statValues, setStatValues] = useState(() => stats.map(() => 0))
  const statsRef = useRef<HTMLDivElement | null>(null)
  const statsInView = useInView(statsRef, { once: true, margin: '-120px 0px' })

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1

      if (pointerRaf.current) cancelAnimationFrame(pointerRaf.current)
      pointerRaf.current = requestAnimationFrame(() => {
        setPointerPosition({ x: clamp(x, -1, 1), y: clamp(y, -1, 1) })
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (pointerRaf.current) cancelAnimationFrame(pointerRaf.current)
    }
  }, [clamp])

  useEffect(() => {
    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      if (event.gamma == null || event.beta == null) return
      const x = clamp(event.gamma / 45, -1, 1)
      const y = clamp(event.beta / 45, -1, 1)

      if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current)
      tiltRaf.current = requestAnimationFrame(() => {
        setDeviceTilt({ x, y })
      })
    }

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleDeviceOrientation)
      return () => {
        window.removeEventListener('deviceorientation', handleDeviceOrientation)
        if (tiltRaf.current) cancelAnimationFrame(tiltRaf.current)
      }
    }

    return undefined
  }, [clamp])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const alreadyPlayed = sessionStorage.getItem('heroHeadingPlayed') === 'true'
    if (alreadyPlayed) {
      setTypedLines(headingLines)
      setHeadingComplete(true)
      return
    }

    let partIndex = 0
    let charIndex = 1
    let timeout: ReturnType<typeof setTimeout>

    const typeNext = () => {
      const currentLine = headingLines[partIndex]
      setTypedLines((prev) => {
        const next = [...prev]
        next[partIndex] = currentLine.slice(0, charIndex)
        return next
      })

      if (charIndex < currentLine.length) {
        charIndex += 1
        timeout = setTimeout(typeNext, 60)
        return
      }

      if (partIndex < headingLines.length - 1) {
        partIndex += 1
        charIndex = 1
        timeout = setTimeout(typeNext, 220)
        return
      }

      setTypedLines(headingLines)
      setHeadingComplete(true)
      sessionStorage.setItem('heroHeadingPlayed', 'true')
    }

    typeNext()

    return () => clearTimeout(timeout)
  }, [headingLines])

  useEffect(() => {
    if (!statsInView) return

    const duration = 2000
    const start = performance.now()
    let animationFrame: number

    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      setStatValues(
        stats.map((stat) =>
          progress === 1 ? stat.target : stat.target * eased
        )
      )

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [statsInView, stats])

  useEffect(() => {
    const video = backgroundVideoRef.current
    if (!video) return

    video.muted = true
    video.loop = true
    if ('playsInline' in video) {
      try {
        video.playsInline = true
      } catch {
        // Browser may not allow setting playsInline; ignore
      }
    }
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent
      const isSafari = ua.includes('Safari') && !ua.includes('Chrome')
      if (isSafari) {
        video.setAttribute('webkit-playsinline', 'true')
      }
    }
  }, [])

  const parallax = useMemo(() => {
    const combinedX = pointerPosition.x * 0.6 + deviceTilt.x * 0.4
    const combinedY = pointerPosition.y * 0.6 + deviceTilt.y * 0.4
    return {
      x: clamp(combinedX, -1, 1),
      y: clamp(combinedY, -1, 1)
    }
  }, [clamp, deviceTilt.x, deviceTilt.y, pointerPosition.x, pointerPosition.y])

  const activeLineIndex = useMemo(
    () =>
      headingLines.findIndex(
        (line, idx) => (typedLines[idx] ?? '').length < line.length
      ),
    [headingLines, typedLines]
  )

  const formattedStats = useMemo(
    () => stats.map((stat, idx) => stat.format(statValues[idx] ?? 0)),
    [statValues, stats]
  )

  return (
    <section className='relative pt-16 w-full h-screen overflow-hidden'>
      <video
        ref={backgroundVideoRef}
        className='absolute inset-0 w-full h-full object-cover'
        src='/assets/videos/rigs_loop.mp4'
        autoPlay
        loop
        muted
        aria-hidden
      />
      <div className='absolute inset-0 bg-background/85 mix-blend-multiply' />

      <div
        className='absolute inset-0 bg-linear-to-b from-primary/25 via-background to-background'
        style={{
          transform: `translateY(${scrollY * 0.5}px)`
        }}
      />

      <div className='absolute inset-0 opacity-10'>
        <div
          className='absolute inset-0'
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(102, 204, 255, 0.05) 25%, rgba(102, 204, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(102, 204, 255, 0.05) 75%, rgba(102, 204, 255, 0.05) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(102, 204, 255, 0.05) 25%, rgba(102, 204, 255, 0.05) 26%, transparent 27%, transparent 74%, rgba(102, 204, 255, 0.05) 75%, rgba(102, 204, 255, 0.05) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
            transform: `translate3d(${parallax.x * 20}px, ${
              scrollY * 0.3
            }px, 0)`
          }}
        />
      </div>

      <div className='absolute inset-0 pointer-events-none'>
        <div
          className='absolute inset-0 opacity-60 transition-transform duration-300 ease-out mix-blend-screen'
          style={{
            background: `radial-gradient(circle at ${50 + parallax.x * 25}% ${
              50 + parallax.y * 25
            }%, rgba(56, 189, 248, 0.35), transparent 55%)`,
            transform: `scale(${1 + Math.abs(parallax.x) * 0.05})`
          }}
        />
      </div>

      <div className='absolute inset-0 overflow-hidden'>
        <div
          className='absolute bg-primary/10 blur-3xl rounded-full w-96 h-96'
          style={{
            top: '10%',
            left: '10%',
            transform: `translate3d(${parallax.x * 40}px, ${
              scrollY * 0.4 + parallax.y * 20
            }px, 0)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        <div
          className='absolute bg-accent/10 blur-3xl rounded-full w-96 h-96'
          style={{
            bottom: '10%',
            right: '10%',
            transform: `translate3d(${-parallax.x * 40}px, ${
              -scrollY * 0.4 + -parallax.y * 20
            }px, 0)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      <div className='relative flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 h-full'>
        <div className='mx-auto max-w-4xl text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='inline-block bg-primary/10 backdrop-blur-sm mb-6 px-4 py-2 animated-border rounded-full'
          >
            <span className='z-10 relative flex items-center gap-2 font-semibold text-accent text-sm'>
              <motion.div
                animate={{ scale: [1, 1.25, 1], opacity: [0.7, 1, 0.7] }}
                transition={{
                  duration: 1.4,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                className='inline-flex'
              >
                <Zap className='w-4 h-4' />
              </motion.div>
              Next Generation Mining Hardware
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className='font-tech font-bold text-4xl sm:text-5xl lg:text-7xl text-balance leading-tight'
          >
            {headingLines.map((line, idx) => {
              const isGradient = idx === 1
              const isActive = !headingComplete && activeLineIndex === idx

              return (
                <div
                  key={line}
                  className='flex justify-center items-center gap-2 leading-tight'
                >
                  <span
                    className={
                      isGradient
                        ? 'bg-linear-to-r from-primary via-accent to-secondary bg-clip-text text-transparent'
                        : 'text-foreground'
                    }
                  >
                    {typedLines[idx]}
                  </span>
                  {isActive ? (
                    <span className='inline-block bg-accent w-2.5 h-8 sm:h-10 animate-pulse' />
                  ) : null}
                </div>
              )
            })}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className='mx-auto mb-8 max-w-2xl text-foreground/70 text-lg sm:text-xl text-balance leading-relaxed'
          >
            Professional-grade mining hardware with cutting-edge technology. Pay
            with crypto, mine with confidence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className='flex sm:flex-row flex-col justify-center gap-4 mb-12'
          >
            <Link href='#products' className='block'>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size='lg'
                  className='group relative bg-primary/80 hover:shadow-xl backdrop-blur-sm px-8 border animated-border-hover border-white/20 hover:border-transparent focus-visible:border-transparent rounded-full overflow-hidden text-primary-foreground transition-all hover:-translate-y-0.5 duration-300'
                  style={
                    {
                      '--animated-border-fill':
                        'color-mix(in srgb, var(--primary) 85%, transparent 15%)'
                    } as CSSProperties
                  }
                >
                  <span className='absolute inset-0 bg-linear-to-r from-accent/0 via-accent/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none' />
                  <span className='relative font-semibold uppercase tracking-wide'>
                    Shop Now
                  </span>
                </Button>
              </motion.div>
            </Link>
            <Link href='/learn-more' className='block'>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size='lg'
                  variant='outline'
                  className='hover:bg-accent/10 px-8 border border-white/20 hover:border-accent/40 rounded-full focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background text-accent hover:text-primary-foreground transition-all hover:-translate-y-0.5 duration-300'
                >
                  <span className='font-semibold uppercase tracking-wide'>
                    Learn More
                  </span>
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          <motion.div
            initial='hidden'
            animate='visible'
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 1
                }
              }
            }}
            ref={statsRef}
            className='gap-4 sm:gap-8 grid grid-cols-1 sm:grid-cols-3 mt-12'
          >
            {stats.map((stat, idx) => {
              const Icon = stat.icon
              const value = formattedStats[idx]

              return (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.6 }
                    }
                  }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className='group bg-white/5 hover:bg-white/10 hover:shadow-[0_0_35px_rgba(102,204,255,0.2)] backdrop-blur-md px-6 py-5 border border-white/10 hover:border-accent/50 rounded-2xl overflow-hidden transition-all duration-300'
                >
                  <div className='flex justify-center mb-3'>
                    <div className='bg-primary/10 group-hover:bg-primary/20 p-3 rounded-xl transition-colors duration-300'>
                      <Icon className='w-10 h-10 text-accent' />
                    </div>
                  </div>
                  <div className='font-tech font-bold text-accent text-2xl sm:text-3xl'>
                    {value}
                  </div>
                  <div className='text-foreground/60 text-sm'>{stat.label}</div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <div
          className='bottom-8 left-1/2 absolute -translate-x-1/2 animate-bounce'
          style={{
            opacity: 1 - scrollY / 300
          }}
        >
          <ChevronDown className='w-6 h-6 text-accent' />
        </div>
      </div>
    </section>
  )
}

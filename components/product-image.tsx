import { Cpu, Zap } from "lucide-react"
import Image from "next/image"

interface ProductImageProps {
  category: string
  image?: string
  className?: string
}

export default function ProductImage({ category, image, className = "" }: ProductImageProps) {
  // Color schemes based on category
  const colorSchemes = {
    ASIC: {
      from: "from-blue-500/20",
      via: "via-cyan-500/10",
      to: "to-purple-500/20",
      icon: "text-cyan-400/60",
      glow: "bg-cyan-400/30",
    },
    GPU: {
      from: "from-green-500/20",
      via: "via-emerald-500/10",
      to: "to-teal-500/20",
      icon: "text-emerald-400/60",
      glow: "bg-emerald-400/30",
    },
    Compact: {
      from: "from-orange-500/20",
      via: "via-amber-500/10",
      to: "to-yellow-500/20",
      icon: "text-amber-400/60",
      glow: "bg-amber-400/30",
    },
    Enterprise: {
      from: "from-purple-500/20",
      via: "via-violet-500/10",
      to: "to-indigo-500/20",
      icon: "text-violet-400/60",
      glow: "bg-violet-400/30",
    },
  }

  const colors = colorSchemes[category as keyof typeof colorSchemes] || colorSchemes.ASIC

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to}`} />

      {/* Product Image or Icon */}
      {image ? (
        <>
          <Image
            src={image}
            alt={category}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
          {/* Multi-layered gradient overlays for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-accent/20 to-secondary/30 mix-blend-overlay" />
          <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-background/50 mix-blend-soft-light" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className={`absolute inset-0 ${colors.glow} blur-3xl rounded-full`} />
            <Cpu className={`w-32 h-32 md:w-48 md:h-48 ${colors.icon} relative z-10`} />
          </div>
        </div>
      )}

      {/* Circuit Pattern Overlay with blend mode */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={`circuit-${category}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <circle cx="20" cy="20" r="1.5" fill="currentColor" className="text-accent" />
              <line x1="20" y1="0" x2="20" y2="15" stroke="currentColor" strokeWidth="0.5" className="text-accent/50" />
              <line x1="0" y1="20" x2="15" y2="20" stroke="currentColor" strokeWidth="0.5" className="text-accent/50" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#circuit-${category})`} />
        </svg>
      </div>

      {/* Animated Grid with blend mode */}
      <div className="absolute inset-0 opacity-10 mix-blend-soft-light pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(102, 204, 255, 0.2) 25%, rgba(102, 204, 255, 0.2) 26%, transparent 27%),
              linear-gradient(90deg, transparent 24%, rgba(102, 204, 255, 0.2) 25%, rgba(102, 204, 255, 0.2) 26%, transparent 27%)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Corner Accents with blend mode */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent/60 mix-blend-screen" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent/60 mix-blend-screen" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent/60 mix-blend-screen" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent/60 mix-blend-screen" />

      {/* Power Icon Accent with blend mode */}
      <div className="absolute top-1/4 right-8 opacity-40 mix-blend-overlay">
        <Zap className="w-12 h-12 text-accent" />
      </div>
    </div>
  )
}

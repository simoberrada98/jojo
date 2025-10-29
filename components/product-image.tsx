import { Cpu, Zap } from "lucide-react"

interface ProductImageProps {
  category: string
  className?: string
}

export default function ProductImage({ category, className = "" }: ProductImageProps) {
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
    <div className={`relative w-full h-full bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} ${className}`}>
      {/* Main Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <div className={`absolute inset-0 ${colors.glow} blur-3xl rounded-full`} />
          <Cpu className={`w-32 h-32 md:w-48 md:w-48 ${colors.icon} relative z-10`} />
        </div>
      </div>

      {/* Circuit Pattern Overlay */}
      <div className="absolute inset-0 opacity-30">
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

      {/* Animated Grid */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(102, 204, 255, 0.1) 25%, rgba(102, 204, 255, 0.1) 26%, transparent 27%),
              linear-gradient(90deg, transparent 24%, rgba(102, 204, 255, 0.1) 25%, rgba(102, 204, 255, 0.1) 26%, transparent 27%)
            `,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Corner Accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-accent/50" />
      <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-accent/50" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-accent/50" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-accent/50" />

      {/* Power Icon Accent */}
      <div className="absolute top-1/4 right-8 opacity-30">
        <Zap className="w-12 h-12 text-accent" />
      </div>
    </div>
  )
}

export interface Product {
  id: number | string
  handle: string // SEO-friendly URL slug
  name: string
  title: string // SEO title
  description: string // SEO meta description
  price: number
  priceUSD: number
  category: string
  hashrate: string
  power: string
  image: string // Featured product image URL
  images: string[] // Additional product images
  model3d: string
  specs: string[]
  features: string[] // Key selling points
  rating: number
  reviews: number
  tags: string[] // SEO keywords
}

import { getAllProductsFromJson } from "./json"

// Load products from JSON files
let PRODUCTS: Product[] = []
try {
  PRODUCTS = getAllProductsFromJson()
} catch (error) {
  console.error("Failed to load products from JSON:", error)
  // Fallback to empty array or keep the hardcoded data
  PRODUCTS = [
  {
    id: 1,
    handle: "prominer-x1000-bitcoin-asic-miner",
    name: "ProMiner X1000",
    title: "ProMiner X1000 - 100 TH/s Bitcoin ASIC Miner | Professional Mining Hardware",
    description: "High-performance Bitcoin ASIC miner delivering 100 TH/s hashrate with advanced cooling. Industry-leading efficiency for professional cryptocurrency mining operations.",
    price: 2.5,
    priceUSD: 85000,
    category: "ASIC",
    hashrate: "100 TH/s",
    power: "3250W",
    image: "/products/prominer-x1000.jpg",
    images: ["/products/prominer-x1000.jpg", "/products/prominer-x1000-side.jpg"],
    model3d: "/assets/3d/duck.glb",
    specs: [
      "100 TH/s SHA-256 Hashrate",
      "3250W Power Consumption",
      "Advanced Liquid Cooling System",
      "WiFi & Ethernet Connectivity",
      "OLED Display with Real-Time Stats",
      "Aluminum Chassis with Heat Dissipation"
    ],
    features: [
      "Industry-leading 100 TH/s performance",
      "Energy-efficient mining with optimized power usage",
      "Advanced cooling keeps hardware running at peak performance",
      "Remote monitoring and management via WiFi"
    ],
    rating: 4.8,
    reviews: 124,
    tags: ["bitcoin miner", "asic miner", "100 th/s", "cryptocurrency mining", "btc mining hardware", "professional miner"],
  },
  {
    id: 2,
    handle: "gpu-rig-pro-ethereum-mining",
    name: "GPU Rig Pro",
    title: "GPU Rig Pro - 450 MH/s Ethereum Mining Rig | 6x RTX 4090 Graphics Cards",
    description: "Professional GPU mining rig featuring 6x RTX 4090 cards. Perfect for Ethereum, Ravencoin, and multi-algorithm mining with 450 MH/s combined hashrate.",
    price: 1.8,
    priceUSD: 62000,
    category: "GPU",
    hashrate: "450 MH/s",
    power: "2100W",
    image: "/products/gpu-rig-pro.jpg",
    images: ["/products/gpu-rig-pro.jpg", "/products/gpu-rig-pro-open.jpg"],
    model3d: "/assets/3d/duck.glb",
    specs: [
      "450 MH/s Ethash Hashrate",
      "6x NVIDIA RTX 4090 24GB",
      "2100W Total Power Draw",
      "Open-Air Aluminum Frame",
      "Individual GPU Monitoring",
      "Hot-Swap GPU Support"
    ],
    features: [
      "6x flagship RTX 4090 graphics cards for maximum performance",
      "Modular design allows easy GPU replacement and upgrades",
      "Optimized airflow with industrial-grade fans",
      "Pre-configured for Ethereum and multi-algorithm mining"
    ],
    rating: 4.6,
    reviews: 89,
    tags: ["gpu mining rig", "ethereum miner", "rtx 4090", "eth mining", "graphics card miner", "multi-algo mining"],
  },
  {
    id: 3,
    handle: "ultrahash-5000-bitcoin-mining-machine",
    name: "UltraHash 5000",
    title: "UltraHash 5000 - 150 TH/s Premium Bitcoin ASIC Miner | Enterprise Grade",
    description: "Top-tier Bitcoin ASIC miner with 150 TH/s hashrate. Enterprise-grade hardware with smart controls, advanced cooling, and maximum ROI for large-scale mining operations.",
    price: 3.2,
    priceUSD: 110000,
    category: "ASIC",
    hashrate: "150 TH/s",
    power: "4500W",
    image: "/products/ultrahash-5000.jpg",
    images: ["/products/ultrahash-5000.jpg", "/products/ultrahash-5000-detail.jpg"],
    model3d: "/assets/3d/duck.glb",
    specs: [
      "150 TH/s SHA-256 Hashrate",
      "4500W Power Consumption",
      "Dual Immersion Cooling System",
      "Smart Temperature Control",
      "Remote Management API",
      "Redundant PSU Configuration"
    ],
    features: [
      "Premium 150 TH/s performance for maximum profitability",
      "Advanced dual cooling system maintains optimal operating temps",
      "Smart control system auto-adjusts for efficiency",
      "Enterprise-grade reliability with 99.9% uptime"
    ],
    rating: 4.9,
    reviews: 156,
    tags: ["bitcoin asic", "150 th/s miner", "enterprise mining", "btc hardware", "high hashrate", "professional mining"],
  },
  {
    id: 4,
    handle: "miniminer-compact-home-bitcoin-miner",
    name: "MiniMiner Compact",
    title: "MiniMiner Compact - 50 TH/s Portable Bitcoin Miner | Home Mining Solution",
    description: "Compact and quiet Bitcoin ASIC miner perfect for home use. 50 TH/s hashrate in a portable design with whisper-quiet operation and low power consumption.",
    price: 0.8,
    priceUSD: 28000,
    category: "Compact",
    hashrate: "50 TH/s",
    power: "1500W",
    image: "/products/miniminer-compact.jpg",
    images: ["/products/miniminer-compact.jpg", "/products/miniminer-compact-setup.jpg"],
    model3d: "/assets/3d/duck.glb",
    specs: [
      "50 TH/s SHA-256 Hashrate",
      "1500W Power Consumption",
      "Ultra-Quiet Operation (<40dB)",
      "Compact 30cm x 20cm Form Factor",
      "Plug-and-Play Setup",
      "Energy Star Certified"
    ],
    features: [
      "Portable design perfect for home miners and small operations",
      "Whisper-quiet operation won't disturb your living space",
      "Low 1500W power draw keeps electricity costs manageable",
      "Plug-and-play setup gets you mining in minutes"
    ],
    rating: 4.5,
    reviews: 67,
    tags: ["home bitcoin miner", "compact miner", "quiet mining", "portable miner", "beginner friendly", "residential mining"],
  },
  {
    id: 5,
    handle: "enterprise-cluster-mining-datacenter",
    name: "Enterprise Cluster",
    title: "Enterprise Mining Cluster - 300 TH/s | Industrial Bitcoin Mining Solution",
    description: "Industrial-scale Bitcoin mining cluster delivering 300 TH/s. Redundant systems, API integration, and enterprise support for large mining operations and data centers.",
    price: 5.0,
    priceUSD: 175000,
    category: "Enterprise",
    hashrate: "300 TH/s",
    power: "8000W",
    image: "/products/enterprise-cluster.jpg",
    images: ["/products/enterprise-cluster.jpg", "/products/enterprise-cluster-rack.jpg"],
    model3d: "/assets/3d/duck.glb",
    specs: [
      "300 TH/s Combined Hashrate",
      "8000W Total Power Draw",
      "Redundant Power Supply Units",
      "Full RESTful API Access",
      "19-inch Rack Mountable",
      "Hot-Swap Component Support"
    ],
    features: [
      "Massive 300 TH/s performance for industrial mining operations",
      "Redundant systems ensure 99.9% uptime and reliability",
      "Full API access for automation and fleet management",
      "Data center ready with rack mounting and enterprise support"
    ],
    rating: 4.7,
    reviews: 42,
    tags: ["enterprise mining", "datacenter mining", "300 th/s", "industrial miner", "rack mount", "mining cluster"],
  },
  {
    id: 6,
    handle: "hyperhash-pro-efficient-bitcoin-asic",
    name: "HyperHash Pro",
    title: "HyperHash Pro - 80 TH/s Energy-Efficient Bitcoin ASIC | Remote Management",
    description: "Energy-efficient Bitcoin ASIC miner with 80 TH/s hashrate. Remote monitoring, efficient cooling, and optimized power consumption for profitable mining operations.",
    price: 2.0,
    priceUSD: 70000,
    category: "ASIC",
    hashrate: "80 TH/s",
    power: "2800W",
    image: "/products/hyperhash-pro.jpg",
    images: ["/products/hyperhash-pro.jpg", "/products/hyperhash-pro-dashboard.jpg"],
    model3d: "/assets/3d/duck.glb",
    specs: [
      "80 TH/s SHA-256 Hashrate",
      "2800W Power Consumption",
      "Energy-Efficient Design",
      "Cloud-Based Monitoring Dashboard",
      "Automatic Fan Speed Control",
      "Email & SMS Alerts"
    ],
    features: [
      "Efficient 80 TH/s performance with optimized power usage",
      "Advanced cooling system extends hardware lifespan",
      "Remote monitoring lets you manage from anywhere",
      "Smart alerts notify you of any issues immediately"
    ],
    rating: 4.7,
    reviews: 98,
    tags: ["efficient bitcoin miner", "80 th/s", "remote monitoring", "asic mining", "energy efficient", "cloud management"],
  },
  ]
}

export interface SearchOptions {
  q?: string
  limit?: number
  offset?: number
}

export interface SearchResult {
  results: Product[]
  total: number
}

/**
 * Search products by query string
 * Searches in name, category, and specs
 */
export async function searchProducts(options: SearchOptions = {}): Promise<SearchResult> {
  const { q = "", limit = 20, offset = 0 } = options

  let results = PRODUCTS

  // Filter by search query if provided
  if (q.trim()) {
    const query = q.toLowerCase()
    results = PRODUCTS.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.specs.some((spec) => spec.toLowerCase().includes(query)) ||
        product.hashrate.toLowerCase().includes(query) ||
        product.power.toLowerCase().includes(query)
      )
    })
  }

  const total = results.length
  const paginatedResults = results.slice(offset, offset + limit)

  return {
    results: paginatedResults,
    total,
  }
}

/**
 * Find a single product by ID
 */
export async function findProductById(id: string | number): Promise<Product | null> {
  const numericId = typeof id === "string" ? parseInt(id, 10) : id
  const product = PRODUCTS.find((p) => p.id === numericId || p.id === id)
  return product || null
}

/**
 * Find a single product by handle (SEO-friendly slug)
 */
export async function findProductByHandle(handle: string): Promise<Product | null> {
  const product = PRODUCTS.find((p) => p.handle === handle)
  return product || null
}

/**
 * Find multiple products by array of IDs
 */
export async function findProductsByIds(ids: (string | number)[]): Promise<Product[]> {
  const numericIds = ids.map((id) => (typeof id === "string" ? parseInt(id, 10) : id))
  return PRODUCTS.filter((p) => numericIds.includes(p.id as number) || ids.includes(p.id))
}

/**
 * Get all products (helper function)
 */
export async function getAllProducts(): Promise<Product[]> {
  return PRODUCTS
}

/**
 * Get available categories
 */
export function getCategories(): string[] {
  const categories = new Set(PRODUCTS.map((p) => p.category))
  return Array.from(categories).sort()
}

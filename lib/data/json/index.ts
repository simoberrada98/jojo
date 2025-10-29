import * as fs from "fs"
import * as path from "path"
import type { Product } from "../local-product-store"

export interface ShopifyImage { src: string }
export interface ShopifyVariant { price?: string }

export interface ShopifyProductJson {
  id: number
  title: string
  handle: string
  body_html?: string
  vendor?: string
  product_type?: string
  tags?: string[]
  images?: ShopifyImage[]
  variants?: ShopifyVariant[]
}

function stripHtml(html?: string): string {
  if (!html) return ""
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function extractHashrate(html?: string): string {
  if (!html) return ""
  const m = html.match(/(\d+[\d,.]*\s*(?:TH\/s|MH\/s|GH\/s))/i)
  return m ? m[1].replace(/\s+/g, " ") : ""
}

function extractPower(html?: string): string {
  if (!html) return ""
  const m = html.match(/(\d+[\d,.]*\s*W)\b/i)
  return m ? m[1].replace(/\s+/g, " ") : ""
}

export function loadShopifyProductsJson(): ShopifyProductJson[] {
  const dir = path.join(process.cwd(), "lib", "data", "json")
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
  return files.map((file) => {
    const content = fs.readFileSync(path.join(dir, file), "utf-8")
    return JSON.parse(content) as ShopifyProductJson
  })
}

export function mapToLocalProducts(json: ShopifyProductJson[]): Product[] {
  return json.map((p) => {
    const priceUSD = p.variants?.[0]?.price ? parseFloat(p.variants[0].price!) : 0
    const image = p.images?.[0]?.src || ""
    const images = (p.images || []).map((i) => i.src)
    const hashrate = extractHashrate(p.body_html)
    const power = extractPower(p.body_html)
    const description = stripHtml(p.body_html).slice(0, 155)

    return {
      id: p.id,
      handle: p.handle,
      name: p.title,
      title: `${p.title} | ${p.product_type || "Mining Hardware"}`,
      description: description || `Buy ${p.title} - professional cryptocurrency mining hardware.`,
      priceUSD,
      price: priceUSD ? +(priceUSD / 34000).toFixed(2) : 0,
      category: p.product_type || "Mining Hardware",
      hashrate: hashrate || "N/A",
      power: power || "N/A",
      image,
      images,
      model3d: "/assets/3d/duck.glb",
      specs: [
        hashrate ? `${hashrate} Hashrate` : "",
        power ? `${power} Power Consumption` : "",
        "Advanced Cooling System",
        "Remote Monitoring",
      ].filter(Boolean),
      features: [
        `High-performance ${p.product_type || "mining hardware"}`,
        "Energy-efficient operation",
        "Professional-grade components",
        "24/7 customer support",
      ],
      rating: 4.5 + Math.random() * 0.4,
      reviews: Math.floor(Math.random() * 100) + 20,
      tags: p.tags || [],
    }
  })
}

export function getAllProductsFromJson(): Product[] {
  const json = loadShopifyProductsJson()
  return mapToLocalProducts(json)
}
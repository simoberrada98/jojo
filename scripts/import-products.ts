import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ProductVariant {
  sku: string
  name: string
  price?: number
  compareAtPrice?: number
  options: Record<string, string>
  stockQuantity: number
  imageUrl?: string
  images?: string[]
}

interface ProductOption {
  name: string
  displayName: string
  type: 'select' | 'radio' | 'swatch' | 'button'
  values: Array<{
    value: string
    displayValue?: string
    colorHex?: string
    imageUrl?: string
  }>
}

interface Product {
  sku: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  category: string
  brand?: string
  tags?: string[]
  basePrice: number
  compareAtPrice?: number
  hashRate?: string
  powerConsumption?: string
  algorithm?: string
  efficiency?: string
  featuredImageUrl?: string
  images?: string[]
  videoUrl?: string
  model3dUrl?: string
  stockQuantity?: number
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
  variants?: ProductVariant[]
  options?: ProductOption[]
  collections?: string[]
}

interface ImportData {
  products: Product[]
  collections?: Array<{
    name: string
    slug: string
    description?: string
    imageUrl?: string
  }>
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

async function importCollections(collections: ImportData['collections']) {
  if (!collections || collections.length === 0) return {}

  console.log(`Importing ${collections.length} collections...`)
  const collectionMap: Record<string, string> = {}

  for (const collection of collections) {
    const { data, error } = await supabase
      .from('collections')
      .insert({
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        image_url: collection.imageUrl
      })
      .select('id, slug')
      .single()

    if (error) {
      console.error(`Error importing collection ${collection.name}:`, error)
      continue
    }

    collectionMap[collection.slug] = data.id
    console.log(`✓ Imported collection: ${collection.name}`)
  }

  return collectionMap
}

async function importProducts(
  products: Product[],
  collectionMap: Record<string, string>
) {
  console.log(`\nImporting ${products.length} products...`)

  for (const product of products) {
    try {
      // Insert main product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .insert({
          sku: product.sku,
          name: product.name,
          slug: product.slug || slugify(product.name),
          description: product.description,
          short_description: product.shortDescription,
          category: product.category,
          brand: product.brand,
          tags: product.tags,
          base_price: product.basePrice,
          compare_at_price: product.compareAtPrice,
          hash_rate: product.hashRate,
          power_consumption: product.powerConsumption,
          algorithm: product.algorithm,
          efficiency: product.efficiency,
          featured_image_url: product.featuredImageUrl,
          images: product.images,
          video_url: product.videoUrl,
          model_3d_url: product.model3dUrl,
          stock_quantity: product.stockQuantity || 0,
          is_featured: product.isFeatured || false,
          is_active: true,
          meta_title: product.metaTitle,
          meta_description: product.metaDescription,
          published_at: new Date().toISOString()
        })
        .select('id')
        .single()

      if (productError) {
        console.error(`Error importing product ${product.name}:`, productError)
        continue
      }

      const productId = productData.id
      console.log(`✓ Imported product: ${product.name}`)

      // Import product options
      if (product.options && product.options.length > 0) {
        for (let i = 0; i < product.options.length; i++) {
          const option = product.options[i]

          const { data: optionData, error: optionError } = await supabase
            .from('product_options')
            .insert({
              product_id: productId,
              name: option.name,
              display_name: option.displayName,
              type: option.type,
              position: i
            })
            .select('id')
            .single()

          if (optionError) {
            console.error(
              `  Error importing option ${option.name}:`,
              optionError
            )
            continue
          }

          // Import option values
          for (let j = 0; j < option.values.length; j++) {
            const value = option.values[j]

            const { error: valueError } = await supabase
              .from('product_option_values')
              .insert({
                option_id: optionData.id,
                value: value.value,
                display_value: value.displayValue,
                color_hex: value.colorHex,
                image_url: value.imageUrl,
                position: j
              })

            if (valueError) {
              console.error(
                `    Error importing value ${value.value}:`,
                valueError
              )
            }
          }

          console.log(
            `  ✓ Imported option: ${option.name} with ${option.values.length} values`
          )
        }
      }

      // Import product variants
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          const { error: variantError } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              sku: variant.sku,
              name: variant.name,
              price: variant.price,
              compare_at_price: variant.compareAtPrice,
              options: variant.options,
              stock_quantity: variant.stockQuantity,
              image_url: variant.imageUrl,
              images: variant.images,
              is_active: true
            })

          if (variantError) {
            console.error(
              `  Error importing variant ${variant.name}:`,
              variantError
            )
            continue
          }

          console.log(`  ✓ Imported variant: ${variant.name}`)
        }
      }

      // Link to collections
      if (product.collections && product.collections.length > 0) {
        for (const collectionSlug of product.collections) {
          const collectionId = collectionMap[collectionSlug]
          if (collectionId) {
            const { error: linkError } = await supabase
              .from('product_collections')
              .insert({
                product_id: productId,
                collection_id: collectionId
              })

            if (linkError) {
              console.error(
                `  Error linking to collection ${collectionSlug}:`,
                linkError
              )
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error processing product ${product.name}:`, error)
    }
  }
}

async function main() {
  const jsonFilePath = process.argv[2] || './data/products.json'

  if (!fs.existsSync(jsonFilePath)) {
    console.error(`File not found: ${jsonFilePath}`)
    console.log('Usage: ts-node import-products.ts <path-to-json-file>')
    process.exit(1)
  }

  console.log(`Reading products from: ${jsonFilePath}`)
  const jsonData = fs.readFileSync(jsonFilePath, 'utf-8')
  const data: ImportData = JSON.parse(jsonData)

  // Import collections first
  const collectionMap = await importCollections(data.collections)

  // Import products
  await importProducts(data.products, collectionMap)

  console.log('\n✅ Import completed!')
}

main().catch(console.error)

// Utility to resolve Google Product Taxonomy path for a given product.
// Lightweight mapper that prefers explicit product_type/category values
// and falls back to sensible defaults. Designed for SSR/CSR usage.

export type GoogleCategoryResolution = {
  path: string;
  segments: string[];
  source: 'product_type' | 'category' | 'tags' | 'fallback';
};

// Minimal curated mappings for common electronics and accessories seen in the catalog.
// You can extend this list safely without code changes.
const PRODUCT_TYPE_TO_TAXONOMY: Record<string, string> = {
  // Core electronics
  electronics: 'Electronics',
  'consumer electronics': 'Electronics',
  smartphone: 'Electronics > Communications > Telephony > Mobile Phones',
  'mobile phone': 'Electronics > Communications > Telephony > Mobile Phones',
  tablet: 'Electronics > Computers > Tablet Computers',
  laptop: 'Electronics > Computers > Laptops',
  'desktop computer': 'Electronics > Computers > Desktop Computers',
  'computer monitor':
    'Electronics > Electronics Accessories > Computer Accessories > Monitor Accessories',
  monitor: 'Electronics > Computers > Computer Monitors',
  camera: 'Electronics > Cameras & Optics > Cameras',
  'digital camera': 'Electronics > Cameras & Optics > Cameras',
  'video camera': 'Electronics > Cameras & Optics > Cameras',
  smartwatch: 'Electronics > Wearable Technology > Smartwatches',
  wearable: 'Electronics > Wearable Technology',
  // Accessories
  'phone case':
    'Electronics > Electronics Accessories > Mobile Phone Accessories > Mobile Phone Cases',
  charger: 'Electronics > Electronics Accessories > Power > Power Adapters',
  'screen protector':
    'Electronics > Electronics Accessories > Mobile Phone Accessories > Screen Protectors',
  earbuds: 'Electronics > Audio > Headphones',
  headphones: 'Electronics > Audio > Headphones',
  speaker: 'Electronics > Audio > Speakers',
  'bluetooth speaker': 'Electronics > Audio > Speakers',
  // Cables & adapters
  'usb cable': 'Electronics > Electronics Accessories > Cables > USB Cables',
  'hdmi cable': 'Electronics > Electronics Accessories > Cables > HDMI Cables',
  adapter: 'Electronics > Electronics Accessories > Adapters',
};

const CATEGORY_TO_TAXONOMY: Record<string, string> = {
  // Often a broader site category; map to a reasonable Google path.
  smartphones: 'Electronics > Communications > Telephony > Mobile Phones',
  phones: 'Electronics > Communications > Telephony > Mobile Phones',
  tablets: 'Electronics > Computers > Tablet Computers',
  laptops: 'Electronics > Computers > Laptops',
  wearables: 'Electronics > Wearable Technology',
  audio: 'Electronics > Audio',
  cameras: 'Electronics > Cameras & Optics > Cameras',
  accessories: 'Electronics > Electronics Accessories',
};

function normalize(value?: string | null): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (!v) return null;
  return v;
}

export function resolveGoogleProductCategory(input: {
  product_type?: string | null;
  category?: string | null;
  tags?: string[] | null;
}): GoogleCategoryResolution {
  // 1) Prefer product_type if present and mapped
  const byType = normalize(input.product_type);
  if (byType && PRODUCT_TYPE_TO_TAXONOMY[byType]) {
    const path = PRODUCT_TYPE_TO_TAXONOMY[byType];
    return { path, segments: path.split(' > '), source: 'product_type' };
  }

  // 2) Next, try site category
  const byCategory = normalize(input.category);
  if (byCategory && CATEGORY_TO_TAXONOMY[byCategory]) {
    const path = CATEGORY_TO_TAXONOMY[byCategory];
    return { path, segments: path.split(' > '), source: 'category' };
  }

  // 3) Inspect tags heuristically for common product keywords
  const tags = (input.tags || [])
    .map((t) => normalize(t))
    .filter(Boolean) as string[];
  for (const tag of tags) {
    if (tag && PRODUCT_TYPE_TO_TAXONOMY[tag]) {
      const path = PRODUCT_TYPE_TO_TAXONOMY[tag];
      return { path, segments: path.split(' > '), source: 'tags' };
    }
  }

  // 4) Fallback to a broad but correct top-level category
  const path = 'Electronics';
  return { path, segments: ['Electronics'], source: 'fallback' };
}

export function getGoogleCategoryPath(input: {
  product_type?: string | null;
  category?: string | null;
  tags?: string[] | null;
}): string {
  return resolveGoogleProductCategory(input).path;
}

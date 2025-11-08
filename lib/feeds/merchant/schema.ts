/**
 * Merchant Feed Schema and Key Specifications
 *
 * This module documents and exports the supported Google Merchant (RSS + g: namespace)
 * item attributes used by our feed, including type hints, requirements, and
 * formatting notes. It is intended for both developer reference and light
 * runtime validation.
 */

export type MerchantKeyType =
  | 'string'
  | 'number'
  | 'currency'
  | 'boolean'
  | 'url'
  | 'enum'
  | 'date'
  | 'cdata';

export type MerchantKeySpec = {
  /** XML element name, usually namespaced with `g:` for Google attributes */
  name: string;
  /** Whether the key must be present for a valid item */
  required: boolean;
  /** Expected type (used by validators/formatters) */
  type: MerchantKeyType;
  /** Optional enum of accepted values (when type === 'enum') */
  enumValues?: string[];
  /** Notes on formatting or business rules */
  notes?: string;
  /** Whether this is a custom/non-standard attribute (kept for backward compat) */
  custom?: boolean;
};

/**
 * Supported keys for our merchant feed items.
 * The feed also includes standard RSS `<title>`, `<link>`, `<description>` elements.
 */
export const SUPPORTED_KEYS: readonly MerchantKeySpec[] = [
  {
    name: 'g:id',
    required: true,
    type: 'string',
    notes: 'Unique product identifier',
  },
  {
    name: 'g:product_type',
    required: true,
    type: 'string',
    notes: 'Merchant-defined categorization',
  },
  {
    name: 'g:google_product_category',
    required: true,
    type: 'string',
    notes:
      'Google taxonomy category (string or numeric ID), kept as string for flexibility',
  },
  { name: 'g:brand', required: true, type: 'string' },
  {
    name: 'g:condition',
    required: true,
    type: 'enum',
    enumValues: ['new', 'used', 'refurbished'],
  },
  {
    name: 'g:gtin',
    required: false,
    type: 'string',
    notes: 'Optional; set identifier_exists=false when missing',
  },
  {
    name: 'g:price',
    required: true,
    type: 'currency',
    notes: 'Format: 0.00 USD',
  },
  {
    name: 'g:sale_price',
    required: false,
    type: 'currency',
    notes: 'Format: 0.00 USD',
  },
  {
    name: 'g:availability',
    required: true,
    type: 'enum',
    enumValues: ['in stock', 'out of stock', 'preorder'],
  },
  { name: 'g:image_link', required: true, type: 'url' },
  {
    name: 'g:link',
    required: true,
    type: 'url',
    notes: 'Canonical product URL',
  },
  { name: 'g:identifier_exists', required: true, type: 'boolean' },
  {
    name: 'g:shipping',
    required: false,
    type: 'string',
    notes:
      'Nested keys country/service/price; represented in XML as a composite block',
  },
  {
    name: 'g:updated_time',
    required: false,
    type: 'date',
    notes: 'RFC 2822/UTC recommended',
  },
  // Custom review attributes retained for backward compatibility
  {
    name: 'g:product_review_average',
    required: false,
    type: 'number',
    custom: true,
  },
  {
    name: 'g:product_review_count',
    required: false,
    type: 'number',
    custom: true,
  },
  {
    name: 'g:product_review_snippet',
    required: false,
    type: 'cdata',
    custom: true,
  },
  {
    name: 'g:product_review_source_link',
    required: false,
    type: 'url',
    custom: true,
  },
];

/**
 * Simple helper: returns a set of valid key names for quick membership checks.
 */
export const SUPPORTED_KEY_SET: ReadonlySet<string> = new Set(
  SUPPORTED_KEYS.map((k) => k.name)
);

/**
 * Basic currency formatter: fixed to two decimals followed by currency code.
 */
export function formatCurrencyUSD(value: number): string {
  return `${value.toFixed(2)} USD`;
}

/**
 * Availability normalization to match Google expected enums.
 */
export function normalizeAvailability(
  stockQty: number
): 'in stock' | 'out of stock' {
  return stockQty > 0 ? 'in stock' : 'out of stock';
}

import { PRICE_RANGES } from './pricing.config';

export const PRODUCT_CONFIG = {
  // Default price filter ranges
  priceRanges: {
    min: PRICE_RANGES.MIN,
    max: PRICE_RANGES.MAX,
    step: PRICE_RANGES.STEP,
  },

  // Default sort options
  sortOptions: [
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest Arrivals' },
    { value: 'popular', label: 'Most Popular' },
  ],

  // Default items per page
  itemsPerPage: 24,

  // Default product statuses
  statuses: {
    IN_STOCK: 'In Stock',
    OUT_OF_STOCK: 'Out of Stock',
    PRE_ORDER: 'Pre-order',
    DISCONTINUED: 'Discontinued',
  },

  // Default product conditions
  conditions: {
    NEW: 'New',
    REFURBISHED: 'Refurbished',
    USED: 'Used',
  },
} as const;

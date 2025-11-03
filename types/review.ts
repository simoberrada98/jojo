export interface ExternalReviewEntry {
  rating: number;
  comment: string;
  reviewerName?: string;
  date?: string;
}

export interface ExternalReviewSummary {
  gtin: string;
  productTitle?: string;
  productDescription?: string;
  averageRating: number;
  reviewCount: number;
  source: string;
  sourceUrl?: string;
  reviews: ExternalReviewEntry[];
}

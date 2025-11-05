import type { Json } from './supabase.types';

export interface ExternalReviewEntry {
  rating: number;
  comment: string;
  reviewerName?: string;
  date?: string;
  source?: string;
  link?: string;
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

export interface ReviewRecord {
  id: string;
  product_id: string;
  user_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  source: string;
  external_id: string | null;
}

export type ReviewRecordInsert = Omit<ReviewRecord, 'id' | 'created_at' | 'updated_at'> & {
  created_at?: string;
  updated_at?: string;
};

export type ReviewRecordUpdate = Partial<Omit<ReviewRecord, 'id' | 'created_at'> & {
  updated_at?: string;
}>;

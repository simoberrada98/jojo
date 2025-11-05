import type { Json } from './supabase.types';

export interface ServiceError {
  code: string;
  message: string;
  details?: Json;
  retryable: boolean;
}

export interface ServiceResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: {
    requestId?: string;
    timestamp: string;
    duration?: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
}

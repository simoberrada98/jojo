import { APP_CONFIG } from "@/lib/config/app.config";
import type { PaymentError, ServiceResponse } from "@/lib/payment/types";

/**
 * Generic retry logic wrapper
 * Eliminates repetitive try-catch-retry code
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = APP_CONFIG.retry.maxAttempts,
  delayMs: number = APP_CONFIG.retry.delayMs,
  backoffMultiplier: number = APP_CONFIG.retry.backoffMultiplier
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = delayMs * Math.pow(backoffMultiplier, attempt);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
}

/**
 * Generic database operation wrapper
 * Wraps Supabase operations with consistent error handling and timing
 */
export async function dbOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }> | { then: (onfulfilled: (value: { data: T | null; error: any }) => any) => any },
  errorCode: string,
  errorMessage: string,
  useRetry: boolean = true
): Promise<ServiceResponse<T>> {
  const startTime = Date.now();
  
  try {
    const executeOperation = async () => {
      const { data, error } = await operation();
      if (error) throw error;
      return data;
    };
    
    const data = useRetry 
      ? await withRetry(executeOperation)
      : await executeOperation();
    
    if (!data) {
      return {
        success: false,
        error: {
          code: errorCode,
          message: "No data returned",
          retryable: false,
        },
        metadata: {
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        },
      };
    }
    
    return {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: errorCode,
        message: error.message || errorMessage,
        details: error,
        retryable: true,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        duration: Date.now() - startTime,
      },
    };
  }
}

/**
 * Helper to sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Batch operation wrapper for multiple operations
 */
export async function batchDbOperations<T>(
  operations: Array<() => Promise<T>>,
  continueOnError: boolean = false
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  const results: Array<{ success: boolean; data?: T; error?: Error }> = [];
  
  for (const operation of operations) {
    try {
      const data = await operation();
      results.push({ success: true, data });
    } catch (error) {
      results.push({ success: false, error: error as Error });
      if (!continueOnError) break;
    }
  }
  
  return results;
}

import { APP_CONFIG } from '@/lib/config/app.config';
import type { ServiceResponse } from '@/types/service';

type DbOperationResult<T> = { data: T | null; error: Error | null };

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
      lastError = error instanceof Error ? error : new Error(String(error));

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
  operation: () => PromiseLike<DbOperationResult<T>>,
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
          message: 'No data returned',
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
  } catch (error: unknown) {
    // Extract meaningful error message
    let message = errorMessage;
    let details: string | undefined;
    
    if (error instanceof Error) {
      message = error.message || errorMessage;
      details = error.stack;
    } else if (typeof error === 'object' && error !== null) {
      // Handle Supabase/Postgres errors
      const errObj = error as Record<string, unknown>;
      message = String(errObj.message || errObj.error || errObj.details || errorMessage);
      details = JSON.stringify(error, null, 2);
    } else if (typeof error === 'string') {
      message = error;
    } else {
      message = errorMessage;
      details = String(error);
    }
    
    return {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
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
  return new Promise((resolve) => setTimeout(resolve, ms));
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

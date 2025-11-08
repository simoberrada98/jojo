type RetryOptions = {
  retries?: number;
  backoffMs?: number;
  backoffMultiplier?: number;
  timeoutMs?: number;
  onRetry?: (attempt: number, error: Error) => void;
};

/**
 * fetchWithRetry
 * Wraps window.fetch with exponential backoff, timeout, and error normalization.
 * Defaults are conservative to avoid hammering the API.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init: RequestInit & { cache?: RequestCache } = {},
  options: RetryOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    backoffMs = 300,
    backoffMultiplier = 2,
    timeoutMs = 10000,
    onRetry,
  } = options;

  let lastError: Error | undefined;

  // Always disable cache for dynamic API endpoints unless explicitly overridden
  const requestInit: RequestInit & { cache?: RequestCache } = {
    cache: 'no-store',
    ...init,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(input, { ...requestInit, signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) {
        const err = new Error(`HTTP ${res.status}: ${res.statusText}`);
        // 5xx and some 429s should be retried
        if (attempt < retries && (res.status >= 500 || res.status === 429)) {
          onRetry?.(attempt + 1, err);
          await sleep(backoffMs * Math.pow(backoffMultiplier, attempt));
          continue;
        }
        throw err;
      }
      return res;
    } catch (error) {
      clearTimeout(timeout);
      lastError = normalizeError(error);
      // Retry on network errors, aborts, and timeouts
      const isAbort = lastError.name === 'AbortError' || /aborted/i.test(lastError.message);
      const isNetwork = /NetworkError|Failed to fetch|ERR_/i.test(lastError.message);
      if (attempt < retries && (isAbort || isNetwork)) {
        onRetry?.(attempt + 1, lastError);
        await sleep(backoffMs * Math.pow(backoffMultiplier, attempt));
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error('Unknown fetch error');
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(String(err));
}


interface LoggerMethods {
  api?: (method: string, path: string, ...args: unknown[]) => void
  error?: (message: string, error?: unknown, context?: Record<string, unknown>) => void
  info?: (...args: unknown[]) => void
  warn?: (...args: unknown[]) => void
}

class Logger implements LoggerMethods {
  api(method: string, path: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      console.log(`[API] ${method} ${path}`, ...args)
    }
  }

  error(message: string, error?: unknown, context?: Record<string, unknown>) {
    console.error(`[ERROR] ${message}`, error, context)
  }

  info(...args: unknown[]) {
    if (process.env.NODE_ENV === "development") {
      console.log("[INFO]", ...args)
    }
  }

  warn(...args: unknown[]) {
    console.warn("[WARN]", ...args)
  }
}

export const logger = new Logger()

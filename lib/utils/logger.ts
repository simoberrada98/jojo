type StructuredContext = Record<string, unknown> | undefined;

class Logger {
  private isBrowser = typeof window !== 'undefined';

  private formatArgs(args: unknown[]): string {
    if (args.length === 0) {
      return '';
    }

    return args
      .map((arg) => {
        if (typeof arg === 'string') {
          return arg;
        }
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');
  }

  private write(
    stream: 'stdout' | 'stderr',
    message: string,
    ...args: unknown[]
  ) {
    if (this.isBrowser) {
      return;
    }

    const target =
      stream === 'stdout' ? process.stdout : process.stderr;

    if (!target) {
      return;
    }

    const formattedArgs = this.formatArgs(args);
    const line = formattedArgs ? `${message} ${formattedArgs}` : message;
    target.write(`${line}\n`);
  }

  api(method: string, path: string, ...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      this.write('stdout', `[API] ${method} ${path}`, ...args);
    }
  }

  error(message: string, error?: unknown, context?: StructuredContext) {
    const payload = context ? { error, context } : error;
    this.write('stderr', `[ERROR] ${message}`, payload);
  }

  info(...args: unknown[]) {
    if (process.env.NODE_ENV === 'development') {
      this.write('stdout', '[INFO]', ...args);
    }
  }

  warn(...args: unknown[]) {
    this.write('stdout', '[WARN]', ...args);
  }

  audit(message: string, context?: StructuredContext) {
    this.write('stdout', '[AUDIT]', { message, context, timestamp: new Date().toISOString() });
  }
}

export const logger = new Logger();

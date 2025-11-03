type StructuredContext = Record<string, unknown> | undefined;
type NodeProcessType = typeof process;
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
    // In browser, do nothing
    if (this.isBrowser) {
      return;
    }

    const formattedArgs = this.formatArgs(args);
    const line = formattedArgs ? `${message} ${formattedArgs}` : message;

    // Check if we're in a Node.js environment with process available
    if (typeof process !== 'undefined') {
      // Dynamically access process streams to avoid static analysis in Edge Runtime
      const processStreams = process as NodeProcessType;

      // Check if streams are available (Node.js, not Edge Runtime)
      if (processStreams.stdout && processStreams.stderr) {
        const target =
          stream === 'stdout' ? processStreams.stdout : processStreams.stderr;
        target.write(`${line}\n`);
        return;
      }
    }

    // Fallback to console for Edge Runtime or other environments
    if (stream === 'stderr') {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  api(method: string, path: string, ...args: unknown[]) {
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      this.write('stdout', `[API] ${method} ${path}`, ...args);
    }
  }

  error(message: string, error?: unknown, context?: StructuredContext) {
    const payload = context ? { error, context } : error;
    this.write('stderr', `[ERROR] ${message}`, payload);
  }

  info(...args: unknown[]) {
    if (
      typeof process !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      this.write('stdout', '[INFO]', ...args);
    }
  }

  warn(...args: unknown[]) {
    this.write('stdout', '[WARN]', ...args);
  }

  audit(message: string, context?: StructuredContext) {
    this.write('stdout', '[AUDIT]', {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

export const logger = new Logger();

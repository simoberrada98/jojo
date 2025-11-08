import { env } from '@/lib/config/env';

type StructuredContext = Record<string, unknown> | undefined;
type NodeProcessType = typeof process;

class Logger {
  private isBrowser = typeof window !== 'undefined';
  private groupDepth = 0;

  private now(): string {
    return new Date().toISOString();
  }

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
    if (this.isBrowser) return;

    const ts = this.now();
    const prefix = `[${ts}]`;
    const formattedArgs = this.formatArgs(args);
    const line = formattedArgs ? `${prefix} ${message} ${formattedArgs}` : `${prefix} ${message}`;

    if (typeof process !== 'undefined') {
      const processStreams = process as NodeProcessType;
      if (processStreams.stdout && processStreams.stderr) {
        const target = stream === 'stdout' ? processStreams.stdout : processStreams.stderr;
        target.write(`${line}\n`);
        return;
      }
    }

    if (stream === 'stderr') {
      console.error(line);
    } else {
      console.log(line);
    }
  }

  private debugEnabled(): boolean {
    return Boolean(env.SERPAPI_DEBUG) || env.NODE_ENV === 'development';
  }

  api(method: string, path: string, ...args: unknown[]) {
    if (this.debugEnabled()) {
      this.write('stdout', `[API] ${method} ${path}`, ...args);
    }
  }

  error(message: string, error?: unknown, context?: StructuredContext) {
    const payload = context ? { error, context } : error;
    this.write('stderr', `[ERROR] ${message}`, payload);
  }

  info(...args: unknown[]) {
    if (this.debugEnabled()) {
      this.write('stdout', '[INFO]', ...args);
    }
  }

  warn(...args: unknown[]) {
    this.write('stdout', '[WARN]', ...args);
  }

  debug(message: string, ...args: unknown[]) {
    if (this.debugEnabled()) {
      this.write('stdout', `[DEBUG] ${message}`, ...args);
    }
  }

  groupStart(label: string, context?: StructuredContext) {
    if (!this.debugEnabled() || this.isBrowser) return;
    this.groupDepth += 1;
    const header = `[GROUP] ${label}`;
    console.group(`${this.now()} ${header}`);
    if (context) {
      console.log('context:', context);
    }
  }

  groupEnd() {
    if (!this.debugEnabled() || this.isBrowser) return;
    if (this.groupDepth > 0) {
      this.groupDepth -= 1;
    }
    console.groupEnd();
  }

  audit(message: string, context?: StructuredContext) {
    this.write('stdout', '[AUDIT]', {
      message,
      context,
      timestamp: this.now(),
    });
  }
}

export const logger = new Logger();

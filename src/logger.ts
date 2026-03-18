/**
 * Structured logger — uses pino when available, falls back to JSON-over-console.
 *
 * Usage:
 *   import { logger } from './logger';
 *   logger.info({ chatId, roomId, phase }, 'beginSpeakingRound');
 *   logger.warn({ chatId }, 'room not found');
 *   logger.error({ chatId, err }, 'unexpected failure');
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LogContext = Record<string, unknown>;

interface Logger {
  debug(ctx: LogContext, msg: string): void;
  info(ctx: LogContext, msg: string): void;
  warn(ctx: LogContext, msg: string): void;
  error(ctx: LogContext, msg: string): void;
  child(bindings: LogContext): Logger;
}

// Attempt to load pino at runtime (optional dependency).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let pinoInstance: any | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  pinoInstance = require('pino')({ level: process.env.LOG_LEVEL ?? 'info' });
} catch {
  // pino not installed — use fallback
}

function makeFallback(bindings: LogContext = {}): Logger {
  const write = (level: LogLevel, ctx: LogContext, msg: string) => {
    const entry = JSON.stringify({
      time: new Date().toISOString(),
      level,
      msg,
      ...bindings,
      ...ctx,
    });
    if (level === 'error' || level === 'warn') {
      process.stderr.write(entry + '\n');
    } else {
      process.stdout.write(entry + '\n');
    }
  };
  return {
    debug: (ctx, msg) => write('debug', ctx, msg),
    info:  (ctx, msg) => write('info',  ctx, msg),
    warn:  (ctx, msg) => write('warn',  ctx, msg),
    error: (ctx, msg) => write('error', ctx, msg),
    child: (extra) => makeFallback({ ...bindings, ...extra }),
  };
}

export const logger: Logger = pinoInstance ?? makeFallback();

/** Convenience: extract error info from unknown catch values, preserving stack trace */
export function errMsg(err: unknown): string {
  if (err instanceof Error) return err.stack ?? err.message;
  return String(err);
}

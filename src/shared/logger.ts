import type { TraceLevel } from './types.js';

const TRACE_ORDER: Record<TraceLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  critical: 50
};

const resolveTraceLevel = (): TraceLevel => {
  const envLevel = (process.env.PROJECTHUB_TRACE || '').toLowerCase();
  if (envLevel && TRACE_ORDER[envLevel as TraceLevel]) return envLevel as TraceLevel;
  return process.env.DEBUG ? 'debug' : 'info';
};

// Cache values at module load
const currentLevel = resolveTraceLevel();
const currentLevelOrder = TRACE_ORDER[currentLevel];

// In Electron main, process.type is undefined; in renderer it's 'renderer'
const isMainProcess = typeof process !== 'undefined' && (!process.type || process.type === 'browser');

const formatTimestamp = (): string => new Date().toISOString();

const shouldLog = (level: TraceLevel): boolean => {
  if (!isMainProcess) return false;
  return TRACE_ORDER[level] >= currentLevelOrder;
};

/**
 * Centralized logger for ProjectHub main process.
 * Respects PROJECTHUB_TRACE environment variable.
 */
export const logger = {
  /** Log debug information (only when trace=debug) */
  debug: (prefix: string, ...args: unknown[]): void => {
    if (shouldLog('debug')) {
      // eslint-disable-next-line no-console
      console.debug(`[${formatTimestamp()}] [${prefix}]`, ...args);
    }
  },

  /** Log informational messages */
  info: (prefix: string, ...args: unknown[]): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(`[${formatTimestamp()}] [${prefix}]`, ...args);
    }
  },

  /** Log warnings */
  warn: (prefix: string, ...args: unknown[]): void => {
    if (shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(`[${formatTimestamp()}] [${prefix}]`, ...args);
    }
  },

  /** Log errors */
  error: (prefix: string, ...args: unknown[]): void => {
    if (shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(`[${formatTimestamp()}] [${prefix}]`, ...args);
    }
  },

  /** Log cache events with structured data */
  cache: (action: 'generate' | 'read' | 'clear', count: number, source: string): void => {
    if (shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.info(`[${formatTimestamp()}] [ProjectHub] cache ${action}`, { count, source });
    }
  }
};

/** Check if debug logging is enabled */
export const isDebugEnabled = (): boolean => shouldLog('debug');

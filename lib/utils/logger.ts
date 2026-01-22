/**
 * Logger utility for consistent logging across the application
 * In production, only errors are logged. In development, all logs are shown.
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },

  /**
   * Log warnings (always logged)
   */
  warn: (...args: any[]) => {
    console.warn(...args);
  },

  /**
   * Log errors (always logged)
   */
  error: (...args: any[]) => {
    console.error(...args);
  },

  /**
   * Log informational messages (only in development)
   */
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },

  /**
   * Log with context for better debugging
   */
  logWithContext: (context: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`[${context}]`, ...args);
    }
  },

  /**
   * Log errors with context
   */
  errorWithContext: (context: string, error: Error | unknown, ...args: any[]) => {
    console.error(`[${context}]`, error, ...args);
  },
};

export default logger;

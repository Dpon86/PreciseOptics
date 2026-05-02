/**
 * Conditional logger — only outputs in development builds.
 * Use instead of raw console.log/warn/error to prevent data leaks in production.
 *
 * Usage:
 *   import logger from '../../services/logger';
 *   logger.log('data:', value);   // dev only
 *   logger.error('API error:', e); // dev only
 */
const isDev = process.env.NODE_ENV === 'development';

const logger = {
  log: isDev ? console.log.bind(console) : () => {},   // eslint-disable-line no-console
  warn: isDev ? console.warn.bind(console) : () => {},  // eslint-disable-line no-console
  error: isDev ? console.error.bind(console) : () => {}, // eslint-disable-line no-console
  info: isDev ? console.info.bind(console) : () => {},   // eslint-disable-line no-console
};

export default logger;

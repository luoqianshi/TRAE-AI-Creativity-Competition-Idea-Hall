const LOG_PREFIX = '[GuoxinEnergy:Server]';

const production = process.env.NODE_ENV === 'production';

const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (!production) {
      console.info(`${LOG_PREFIX} ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${LOG_PREFIX} [WARN] ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`${LOG_PREFIX} [ERROR] ${message}`, ...args);
  },
};

export default logger;

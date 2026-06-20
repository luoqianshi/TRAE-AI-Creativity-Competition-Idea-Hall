const LOG_PREFIX = '[GuoxinEnergy]';

const isDev = (): boolean => {
  try {
    return (import.meta as any).env?.DEV === true;
  } catch {
    return false;
  }
};

const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (isDev()) {
      console.info(`${LOG_PREFIX} ${message}`, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    console.warn(`${LOG_PREFIX} ${message}`, ...args);
  },
  error: (message: string, ...args: unknown[]) => {
    console.error(`${LOG_PREFIX} ${message}`, ...args);
  },
};

export default logger;

export const DEFAULT_PRICING_CONFIG = {
  电费单价: 1.25,
  水费单价: 4.80,
  气费单价: 3.50,
};

export const getConfigFromCache = (): Record<string, any> => {
  const cached = localStorage.getItem("系统字典限额");
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      return { ...DEFAULT_PRICING_CONFIG };
    }
  }
  return { ...DEFAULT_PRICING_CONFIG };
};

export const getChinaDateStr = (): string =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

export const getChinaMonthStr = (): string => getChinaDateStr().slice(0, 7);

export const safeNum = (v: any): number => {
  if (v === undefined || v === null || v === "") return 0;
  const n = parseFloat(String(v).replace(/,/g, ""));
  return isNaN(n) ? 0 : n;
};

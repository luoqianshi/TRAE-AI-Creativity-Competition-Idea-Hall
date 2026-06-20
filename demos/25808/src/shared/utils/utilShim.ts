export const debuglog = () => () => {};

export function inspect(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null) return 'null';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export default { debuglog, inspect };

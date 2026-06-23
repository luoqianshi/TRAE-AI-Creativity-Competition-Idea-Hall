import { describe, expect, it } from 'vitest';
import { formatLocalDate, parseLocalDate } from '@/lib/date';

describe('本地日期工具', () => {
  it('按本地年月日生成 YYYY-MM-DD，不受 UTC 转换影响', () => {
    const localMorning = new Date(2026, 0, 2, 1, 30);

    expect(formatLocalDate(localMorning)).toBe('2026-01-02');
  });

  it('按本地日期解析 YYYY-MM-DD', () => {
    const date = parseLocalDate('2026-01-02');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(0);
    expect(date.getDate()).toBe(2);
  });
});

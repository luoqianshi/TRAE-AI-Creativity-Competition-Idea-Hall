import { describe, expect, it } from 'vitest';
import { buildUpdatedEntry, hasEntryChanges, normalizeEntryContent } from '@/lib/entryHistory';
import type { Entry } from '@/context/AppContext';

const baseEntry: Entry = {
  id: 'entry-1',
  date: '2026-05-04',
  rating: 2,
  content: '今天很嗨呀',
  createdAt: '2026-05-04T10:10:00.000Z',
};

describe('日记修改历史', () => {
  it('修改日记时会保留旧版本', () => {
    const updatedEntry = buildUpdatedEntry(
      baseEntry,
      { rating: 3, content: '今天更嗨呀' },
      '2026-05-04T12:00:00.000Z'
    );

    expect(updatedEntry.rating).toBe(3);
    expect(updatedEntry.content).toBe('今天更嗨呀');
    expect(updatedEntry.history).toHaveLength(1);
    expect(updatedEntry.history?.[0]).toMatchObject({
      rating: 2,
      content: '今天很嗨呀',
      archivedAt: '2026-05-04T12:00:00.000Z',
    });
  });

  it('没有实际变化时不会判断为修改', () => {
    expect(hasEntryChanges(baseEntry, { rating: 2, content: '今天很嗨呀' })).toBe(false);
  });

  it('内容长度会限制在 200 字以内', () => {
    expect(normalizeEntryContent('嗨'.repeat(205))).toHaveLength(200);
  });
});

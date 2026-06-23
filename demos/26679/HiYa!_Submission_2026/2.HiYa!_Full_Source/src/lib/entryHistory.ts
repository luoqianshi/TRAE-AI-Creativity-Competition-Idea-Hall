import type { Entry, EntryHistoryItem } from '@/context/AppContext';

export const normalizeEntryContent = (content: string) => content.slice(0, 200);

export const hasEntryChanges = (
  entry: Entry,
  updates: Pick<Entry, 'rating' | 'content'>
) => entry.rating !== updates.rating || entry.content !== normalizeEntryContent(updates.content);

export const createHistoryItem = (
  entry: Entry,
  archivedAt: string,
  suffix: string = String(Date.now())
): EntryHistoryItem => ({
  id: `${entry.id}-${suffix}`,
  rating: entry.rating,
  content: entry.content,
  createdAt: entry.updatedAt ?? entry.createdAt,
  archivedAt,
});

export const buildUpdatedEntry = (
  entry: Entry,
  updates: Pick<Entry, 'rating' | 'content'>,
  updatedAt: string = new Date().toISOString()
): Entry => ({
  ...entry,
  rating: updates.rating,
  content: normalizeEntryContent(updates.content),
  updatedAt,
  history: [
    ...(entry.history ?? []),
    createHistoryItem(entry, updatedAt),
  ],
});

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { formatLocalDate, parseLocalDate } from '@/lib/date';
import { buildUpdatedEntry, createHistoryItem, hasEntryChanges, normalizeEntryContent } from '@/lib/entryHistory';

export interface Entry {
  id: string;
  date: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt?: string;
  history?: EntryHistoryItem[];
}

export interface EntryHistoryItem {
  id: string;
  rating: number;
  content: string;
  createdAt: string;
  archivedAt: string;
}

interface AppSettings {
  userId: string;
  firstUseDate: string;
  unlockedThemes: string[];
  currentTheme: string;
  devMode?: boolean;
   themeStoreUnlocked?: boolean;
}

interface AppContextType {
  entries: Entry[];
  settings: AppSettings;
  addEntry: (entry: Omit<Entry, 'id' | 'createdAt'>) => Entry;
  updateEntry: (date: string, updates: Pick<Entry, 'rating' | 'content'>) => Entry | null;
  getEntryByDate: (date: string) => Entry | undefined;
  getTodayEntry: () => Entry | undefined;
  getWeekEntries: () => Entry[];
  updateSettings: (settings: Partial<AppSettings>) => void;
  exportData: () => string;
  importData: (data: string) => boolean;
  getDaysUsed: () => number;
   getEntriesCount: () => number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  ENTRIES: 'haiya_entries',
  SETTINGS: 'haiya_settings',
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    userId: '',
    firstUseDate: formatLocalDate(),
     unlockedThemes: ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'black', 'white'],
     currentTheme: 'orange',
    devMode: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const safeParse = <T,>(raw: string | null): T | null => {
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    };

    // Primary keys
    const savedEntries = safeParse<Entry[]>(localStorage.getItem(STORAGE_KEYS.ENTRIES));
    const savedSettings = safeParse<Partial<AppSettings>>(localStorage.getItem(STORAGE_KEYS.SETTINGS));

    // Legacy compatibility (in case older builds used different keys)
    const legacyEntries =
      safeParse<Entry[]>(localStorage.getItem('entries')) ||
      safeParse<Entry[]>(localStorage.getItem('haiyaEntries'));
    const legacySettings =
      safeParse<Partial<AppSettings>>(localStorage.getItem('settings')) ||
      safeParse<Partial<AppSettings>>(localStorage.getItem('haiyaSettings'));

    const finalEntries = savedEntries ?? legacyEntries;
    const finalSettings = savedSettings ?? legacySettings;

    if (finalEntries) {
      setEntries(finalEntries);
      // Migrate legacy -> current key
      if (!savedEntries && legacyEntries) {
        localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(legacyEntries));
      }
    }

    if (finalSettings) {
      // Migrate old theme IDs to new ones
      let migratedSettings = { ...finalSettings };
       // Map legacy theme IDs
       const legacyThemeMap: Record<string, string> = {
         'default': 'orange',
         'white-orange': 'orange',
         'white-black': 'black',
         'white-red': 'red',
         'white-green': 'green',
         'white-blue': 'blue',
       };
       if (migratedSettings.currentTheme && legacyThemeMap[migratedSettings.currentTheme]) {
         migratedSettings.currentTheme = legacyThemeMap[migratedSettings.currentTheme];
      }
      // All themes are now free
       migratedSettings.unlockedThemes = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink', 'black', 'white'];
      
      setSettings((prev) => ({ ...prev, ...migratedSettings }));
      // Migrate legacy -> current key
      if (!savedSettings && legacySettings) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...settings, ...migratedSettings }));
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
  }, [entries, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings, hydrated]);

  const addEntry = (entryData: Omit<Entry, 'id' | 'createdAt'>) => {
    const existingEntry = entries.find(e => e.date === entryData.date);
    const now = new Date().toISOString();
    const newEntry: Entry = {
      ...entryData,
      content: normalizeEntryContent(entryData.content),
      id: existingEntry?.id ?? Date.now().toString(),
      createdAt: existingEntry?.createdAt ?? now,
      updatedAt: existingEntry ? now : undefined,
      history: existingEntry
        ? [
            ...(existingEntry.history ?? []),
            createHistoryItem(existingEntry, now),
          ]
        : undefined,
    };
    
    // Remove existing entry for the same date
    const filteredEntries = entries.filter(e => e.date !== entryData.date);
    setEntries([...filteredEntries, newEntry]);
    return newEntry;
  };

  const updateEntry = (date: string, updates: Pick<Entry, 'rating' | 'content'>) => {
    const existingEntry = entries.find(e => e.date === date);
    if (!existingEntry) return null;

    if (!hasEntryChanges(existingEntry, updates)) return existingEntry;

    const updatedEntry = buildUpdatedEntry(existingEntry, updates);

    setEntries(prevEntries => prevEntries.map(entry => entry.date === date ? updatedEntry : entry));
    return updatedEntry;
  };

  const getEntryByDate = (date: string) => {
    return entries.find(e => e.date === date);
  };

  const getTodayEntry = () => {
    const today = formatLocalDate();
    return getEntryByDate(today);
  };

  const getWeekEntries = () => {
    const today = new Date();
    // 获取上周的日期范围（上周一到上周日）
    const dayOfWeek = today.getDay();
    const daysToLastSunday = dayOfWeek === 0 ? 7 : dayOfWeek;
    const lastSunday = new Date(today);
    lastSunday.setDate(today.getDate() - daysToLastSunday);
    lastSunday.setHours(23, 59, 59, 999);
    
    const lastMonday = new Date(lastSunday);
    lastMonday.setDate(lastSunday.getDate() - 6);
    lastMonday.setHours(0, 0, 0, 0);
    
    return entries.filter(e => {
      const entryDate = parseLocalDate(e.date);
      return entryDate >= lastMonday && entryDate <= lastSunday;
    }).sort((a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime());
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const exportData = () => {
     return JSON.stringify({ 
       entries, 
       settings,
       exportInfo: {
         userId: settings.userId,
         daysUsed: getDaysUsed(),
         entriesCount: entries.length,
         exportDate: new Date().toISOString(),
       }
     }, null, 2);
  };

  const importData = (data: string) => {
    try {
      const parsed = JSON.parse(data);
       if (parsed.entries) {
         setEntries(parsed.entries);
       }
       if (parsed.settings) {
         // Check if imported data has >= 20 entries to unlock theme store
         const importedEntriesCount = parsed.entries?.length || 0;
         const updatedSettings = { ...parsed.settings };
         
         // If the imported data has >= 20 entries, mark as unlocked
         if (importedEntriesCount >= 20) {
           updatedSettings.themeStoreUnlocked = true;
         }
         
         setSettings(prev => ({ ...prev, ...updatedSettings }));
       }
      return true;
    } catch {
      return false;
    }
  };

  const getDaysUsed = () => {
    const firstUse = parseLocalDate(settings.firstUseDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - firstUse.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

   const getEntriesCount = () => {
     return entries.length;
   };
 
  return (
    <AppContext.Provider
      value={{
        entries,
        settings,
        addEntry,
        updateEntry,
        getEntryByDate,
        getTodayEntry,
        getWeekEntries,
        updateSettings,
        exportData,
        importData,
        getDaysUsed,
         getEntriesCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import { useEffect, useCallback, useState } from 'react';

export interface DirtyStateOptions {
  onBeforeUnload?: boolean;
  onRouteChange?: boolean;
}

export interface DirtyStateReturn<T> {
  isDirty: boolean;
  originalValue: T;
  markClean: () => void;
  checkDirty: (currentValue: T) => boolean;
}

export function useDirtyState<T>(initialValue: T, options: DirtyStateOptions = {}): DirtyStateReturn<T> {
  const [originalValue, setOriginalValue] = useState<T>(initialValue);
  const [isDirty, setIsDirty] = useState(false);

  const checkDirty = useCallback((currentValue: T): boolean => {
    const isDirtyNow = JSON.stringify(currentValue) !== JSON.stringify(originalValue);
    setIsDirty(isDirtyNow);
    return isDirtyNow;
  }, [originalValue]);

  const markClean = useCallback(() => {
    setOriginalValue(prev => {
      try {
        return JSON.parse(JSON.stringify(prev));
      } catch {
        return prev;
      }
    });
    setIsDirty(false);
  }, []);

  useEffect(() => {
    if (options.onBeforeUnload) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        if (isDirty) {
          e.preventDefault();
          e.returnValue = '';
        }
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }
  }, [isDirty, options.onBeforeUnload]);

  return { isDirty, originalValue, markClean, checkDirty };
}

export interface DirtyContextType {
  dirtyPaths: Set<string>;
  markDirty: (path: string) => void;
  clearDirty: (path?: string) => void;
  hasDirtyChanges: () => boolean;
}

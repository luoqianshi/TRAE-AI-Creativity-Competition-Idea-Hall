import { useState, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage';

export function useStorage(key, defaultValue) {
  const [value, setValue] = useState(() => getItem(key, defaultValue));

  const update = useCallback((newValue) => {
    setValue((prev) => {
      const val = typeof newValue === 'function' ? newValue(prev) : newValue;
      setItem(key, val);
      return val;
    });
  }, [key]);

  return [value, update];
}

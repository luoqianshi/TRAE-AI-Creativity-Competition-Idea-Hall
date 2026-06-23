import { useEffect, useState } from 'react';
import { applyTheme, getThemeById } from '@/lib/themes';
import { updateStatusBarStyle } from '@/lib/statusBar';

type Theme = 'light' | 'dark' | 'system';

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('haiya_theme') as Theme) || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;

    const applySystemTheme = (resolvedTheme: 'light' | 'dark') => {
      root.classList.remove('light', 'dark');
      root.classList.add(resolvedTheme);

      // Apply the user's selected color theme (which now resets defaults first)
      const savedSettings = localStorage.getItem('haiya_settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          const colorThemeId = settings.currentTheme || 'orange';
          // Use the centralized applyTheme which handles reset + apply
          applyTheme(colorThemeId);
          // Sync status bar text color: black theme uses dark style (white text)
          const isDark = resolvedTheme === 'dark' || colorThemeId === 'black';
          updateStatusBarStyle(isDark);
        } catch {
          // Ignore parse errors
        }
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applySystemTheme(mediaQuery.matches ? 'dark' : 'light');
      };

      handleChange();
      mediaQuery.addEventListener('change', handleChange);

      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applySystemTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('haiya_theme', theme);
  }, [theme]);

  return { theme, setTheme };
};

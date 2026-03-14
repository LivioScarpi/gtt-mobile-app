import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { Colors, DarkColors, type ThemeColors } from '../constants/theme';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  colors: ThemeColors;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors: Colors,
  isDark: false,
  mode: 'system',
  setMode: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('system');

  const isDark = mode === 'system' ? systemScheme === 'dark' : mode === 'dark';
  const colors = isDark ? DarkColors : Colors;

  useEffect(() => {
    if (mode === 'system') {
      Appearance.setColorScheme(null);
    } else {
      Appearance.setColorScheme(mode);
    }
  }, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      if (prev === 'system') return isDark ? 'light' : 'dark';
      return prev === 'dark' ? 'light' : 'dark';
    });
  }, [isDark]);

  const value = useMemo(
    () => ({ colors, isDark, mode, setMode, toggleTheme }),
    [colors, isDark, mode, setMode, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeColors(): ThemeColors {
  return useContext(ThemeContext).colors;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

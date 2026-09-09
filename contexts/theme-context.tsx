import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { getItem, setItem } from '@/utils/storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

type ThemeContextType = {
  theme: 'light' | 'dark';
  mode: ThemeMode;
  setTheme: (t: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', mode: 'dark', setTheme: () => {} });

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('dark');

  useEffect(() => {
    getItem('app_theme').then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'auto') setMode(saved);
    });
  }, []);

  function setTheme(t: ThemeMode) {
    setMode(t);
    setItem('app_theme', t);
  }

  const theme = useMemo<'light' | 'dark'>(() => {
    if (mode === 'auto') return system === 'light' ? 'light' : 'dark';
    return mode;
  }, [mode, system]);

  return (
    <ThemeContext.Provider value={{ theme, mode, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

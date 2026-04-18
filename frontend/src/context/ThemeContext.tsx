import React, { createContext, useContext, useEffect, useState } from 'react';

export interface AppTheme {
  isDark: boolean;
  pageBg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  sidebarBg: string;
  sidebarBorder: string;
  text: string;
  textSub: string;
  textMuted: string;
  navActiveBg: string;
  navActiveColor: string;
  navColor: string;
  headerBg: string;
  headerBorder: string;
  inputBg: string;
  inputBorder: string;
  dividerColor: string;
  btnSecBg: string;
  btnSecColor: string;
}

const light: AppTheme = {
  isDark: false,
  pageBg: '#f4f7fa',
  cardBg: '#ffffff',
  cardBorder: '#f0f2f5',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06)',
  sidebarBg: '#ffffff',
  sidebarBorder: '#e8ecf0',
  text: '#1a1a1a',
  textSub: '#6b7280',
  textMuted: '#9ca3af',
  navActiveBg: '#f0fdf4',
  navActiveColor: '#15803d',
  navColor: '#6b7280',
  headerBg: '#ffffff',
  headerBorder: '#f0f2f5',
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  dividerColor: '#f3f4f6',
  btnSecBg: '#f3f4f6',
  btnSecColor: '#374151',
};

const dark: AppTheme = {
  isDark: true,
  pageBg: '#1a1a1a',
  cardBg: '#242424',
  cardBorder: '#333333',
  cardShadow: '0 1px 6px rgba(0,0,0,0.6)',
  sidebarBg: '#1f1f1f',
  sidebarBorder: '#2e2e2e',
  text: '#f0f0f0',
  textSub: '#a8a8a8',
  textMuted: '#6e6e6e',
  navActiveBg: '#1a3a22',
  navActiveColor: '#4ade80',
  navColor: '#a8a8a8',
  headerBg: '#1f1f1f',
  headerBorder: '#2e2e2e',
  inputBg: '#1a1a1a',
  inputBorder: '#3d3d3d',
  dividerColor: '#2e2e2e',
  btnSecBg: '#333333',
  btnSecColor: '#e0e0e0',
};

interface ThemeContextValue {
  theme: AppTheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: light,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState<boolean>(
    () => localStorage.getItem('theme') === 'dark',
  );

  useEffect(() => {
    document.body.style.background = isDark ? dark.pageBg : light.pageBg;
    document.body.style.color = isDark ? dark.text : light.text;
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme: isDark ? dark : light,
        toggleTheme: () => setIsDark((d) => !d),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}

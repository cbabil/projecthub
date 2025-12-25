import { Settings } from '@shared/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface SettingsContextValue {
  settings?: Settings;
  refresh: () => Promise<void>;
  update: (next: Settings) => Promise<void>;
  loading: boolean;
  error?: string;
}

const SettingsContext = createContext<SettingsContextValue>({
  loading: true,
  refresh: async () => undefined,
  update: async () => undefined
});

const ACCENT_COLORS: Record<Settings['accentColor'], string> = {
  primary: '#6a5acd',
  boost: '#4f46e5',
  blue: '#4c6ef5',
  green: '#23ce6b',
  red: '#ef4444'
};

const applyTheme = (settings: Settings) => {
  const root = document.documentElement;
  const isDark = settings.theme === 'dark';
  root.classList.toggle('dark', isDark);
  root.classList.toggle('light', !isDark);
  root.style.setProperty('--color-accent-primary', ACCENT_COLORS[settings.accentColor]);

  // Apply font size directly on html element (Tailwind uses rem)
  const fontSizes = { small: '12px', medium: '14px', large: '16px' };
  root.style.fontSize = fontSizes[settings.fontSize ?? 'medium'];

  // Apply reduce motion
  root.classList.toggle('reduce-motion', settings.reduceMotion === true);
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await window.projecthub.loadSettings();
    if (res.ok && res.data) {
      setSettings(res.data);
      applyTheme(res.data);
      setError(undefined);
    } else {
      setError(res.error || 'Unable to load settings');
    }
    setLoading(false);
  }, []);

  const update = useCallback(async (next: Settings) => {
    const res = await window.projecthub.updateSettings(next);
    if (res.ok && res.data) {
      setSettings(res.data);
      applyTheme(res.data);
      setError(undefined);
    } else {
      setError(res.error || 'Failed to update settings');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ settings, refresh, update, loading, error }),
    [settings, refresh, update, loading, error]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

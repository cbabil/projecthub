import type { Settings } from '@shared/types';
import { FolderOpen } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'ui-toolkit';

import pkg from '../../../../package.json';
import { useSettings } from '../../context/SettingsContext.js';
import SettingsAITab from './SettingsAITab.js';
import SettingsGeneralTab from './SettingsGeneralTab.js';
import SettingsMarketplacesTab from './SettingsMarketplacesTab.js';

const ACCENT_COLORS: Record<Settings['accentColor'], string> = {
  primary: '#6a5acd',
  boost: '#4f46e5',
  blue: '#4c6ef5',
  green: '#23ce6b',
  red: '#ef4444'
};

const FONT_SIZES: Record<NonNullable<Settings['fontSize']>, string> = {
  small: '12px',
  medium: '14px',
  large: '16px'
};

// Apply visual settings immediately (no waiting for save)
const applyVisualSettings = (settings: Settings) => {
  const root = document.documentElement;
  root.style.setProperty('--color-accent-primary', ACCENT_COLORS[settings.accentColor]);
  root.style.fontSize = FONT_SIZES[settings.fontSize ?? 'medium'];
  root.classList.toggle('reduce-motion', settings.reduceMotion === true);
};

interface Props {
  open: boolean;
}

const SettingsModalContent: React.FC<Props> = ({ open }) => {
  const { refresh } = useSettings();
  const [formValues, setFormValues] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'general' | 'marketplace' | 'ai'>('general');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadSettingsFile = async () => {
    setLoading(true);
    try {
      const rawRes = await window.projecthub.readRawSettings();
      if (rawRes.ok && typeof rawRes.data === 'string') {
        const parsed = JSON.parse(rawRes.data) as Settings;
        setFormValues(parsed);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSettingsFile();
      setTab('general');
    }
  }, [open]);

  // Auto-save with debounce
  const saveSettings = useCallback(async (settings: Settings) => {
    const res = await window.projecthub.updateSettings(settings);
    if (res.ok) {
      await refresh();
    }
  }, [refresh]);

  const updateField = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    setFormValues((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [key]: value };
      applyVisualSettings(next);
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveSettings(next), 300);
      return next;
    });
  }, [saveSettings]);

  useEffect(() => () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
  }, []);

  const handleOpenDataFolder = () => {
    if (formValues?.installPath) {
      window.projecthub.openFolder(formValues.installPath);
    }
  };

  if (loading || !formValues) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-sm text-white/50">Loading...</span>
      </div>
    );
  }

  const tabs: Array<{ id: 'general' | 'marketplace' | 'ai'; label: string }> = [
    { id: 'general', label: 'Settings' },
    { id: 'ai', label: 'AI' },
    { id: 'marketplace', label: 'Marketplace' }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-1 mb-4 shrink-0">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              tab === id
                ? 'bg-brand-accent-primary text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'general' ? (
          <SettingsGeneralTab settings={formValues} onUpdate={updateField} />
        ) : tab === 'ai' ? (
          <SettingsAITab />
        ) : (
          <SettingsMarketplacesTab />
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-brand-divider/30 flex items-center justify-between shrink-0">
        <span className="text-xs text-white/40">ProjectHub v{pkg.version}</span>
        <Button type="button" variant="ghost" onClick={handleOpenDataFolder} className="text-xs">
          <FolderOpen size={14} className="mr-1.5" />
          Open Data Folder
        </Button>
      </div>
    </div>
  );
};

export default SettingsModalContent;

import type { Settings } from '@shared/types';
import React, { useEffect, useState } from 'react';

import { useSettings } from '../../context/SettingsContext.js';
import { useTranslation } from '../../context/TranslationContext.js';
import Button from '../Button.js';
import SettingsGeneralTab from './SettingsGeneralTab.js';
import SettingsPacksTab from './SettingsPacksTab.js';

interface Props {
  open: boolean;
}

const SettingsModalContent: React.FC<Props> = ({ open }) => {
  const { refresh } = useSettings();
  const { t } = useTranslation();
  const [formValues, setFormValues] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState<string>();
  const [tab, setTab] = useState<'general' | 'packs'>('general');

  const loadSettingsFile = async () => {
    setLoading(true);
    setStatus(undefined);
    setError(undefined);
    try {
      const [rawRes] = await Promise.all([window.projecthub.readRawSettings()]);

      if (rawRes.ok && typeof rawRes.data === 'string') {
        try {
          const parsed = JSON.parse(rawRes.data) as Settings;
          setFormValues(parsed);
        } catch (parseError) {
          setError(`Invalid settings JSON: ${(parseError as Error).message}`);
          setFormValues(null);
        }
      } else {
        setError(rawRes.error || 'Unable to read settings file');
        setFormValues(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadSettingsFile();
    }
  }, [open]);

  const updateField = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setFormValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formValues) return;

    setSaving(true);
    setStatus(undefined);
    setError(undefined);

    const res = await window.projecthub.updateSettings(formValues);
    if (res.ok && res.data) {
      setStatus(t('settingsSaved'));
      await refresh();
    } else {
      setError(res.error || 'Failed to save settings');
    }
    setSaving(false);
  };

  const isReady = Boolean(formValues) && !loading;

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex gap-2 shrink-0">
        <Button type="button" variant={tab === 'general' ? 'primary' : 'ghost'} onClick={() => setTab('general')}>
          General
        </Button>
        <Button type="button" variant={tab === 'packs' ? 'primary' : 'ghost'} onClick={() => setTab('packs')}>
          Packs
        </Button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === 'general' ? (
          <SettingsGeneralTab
            formValues={formValues}
            isReady={isReady}
            saving={saving}
            status={status}
            error={error}
            onUpdate={updateField}
            onSave={handleSave}
            onReload={loadSettingsFile}
          />
        ) : (
          <SettingsPacksTab repoUrl={formValues?.packsRepoUrl} />
        )}
      </div>
    </div>
  );
};

export default SettingsModalContent;

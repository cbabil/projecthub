import type { PackMeta } from '@shared/types.js';
import React, { useEffect, useState } from 'react';

import Button from '../components/Button.js';
import Input from '../components/Input.js';
import { useSettings } from '../context/SettingsContext.js';
import { useToast } from '../context/ToastContext.js';
import { useTranslation } from '../context/TranslationContext.js';

const accents = ['primary', 'boost', 'blue', 'green', 'red'] as const;

const SettingsPage: React.FC = () => {
  const { settings, update, loading, refresh } = useSettings();
  const { t } = useTranslation();
  const toast = useToast();
  const [status, setStatus] = useState<string>();
  const [tab, setTab] = useState<'general' | 'packs'>('general');
  const [packs, setPacks] = useState<PackMeta[]>([]);
  const [packUrl, setPackUrl] = useState('');

  useEffect(() => {
    const load = async () => {
      const res = await window.projecthub.listPacks?.();
      if (res?.ok && res.data) setPacks(res.data);
    };
    load();
  }, []);

  if (!settings) return <p className="text-sm">{loading ? t('settingsLoading') : t('settingsLoadError')}</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update(settings);
    setStatus(t('settingsSaved'));
  };

  const renderGeneral = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex flex-col gap-1 text-sm flex-1">
          <span className="text-brand-text-dark/80">{t('settingsThemeLabel')}</span>
          <select
            className="input w-full"
            value={settings.theme}
            onChange={(e) => update({ ...settings, theme: e.target.value as typeof settings.theme })}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm flex-1">
          <span className="text-brand-text-dark/80">{t('settingsAccentLabel')}</span>
          <select
            className="input w-full"
            value={settings.accentColor}
            onChange={(e) => update({ ...settings, accentColor: e.target.value as typeof settings.accentColor })}
          >
            {accents.map((accent) => (
              <option key={accent} value={accent}>
                {accent}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-text-dark/80">
        <input
          type="checkbox"
          checked={settings.enforceLineLimit}
          onChange={(e) => update({ ...settings, enforceLineLimit: e.target.checked })}
        />
        {t('settingsLineLimitLabel')}
      </label>

      <div className="space-y-2 text-sm">
        <p className="text-brand-text-dark/80">{t('settingsDataFolderLabel')}</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={settings.installPath}
            onChange={(val) => update({ ...settings, installPath: val })}
            className="sm:flex-1"
            placeholder={t('settingsInstallPathPlaceholder')}
          />
          <Button type="button" onClick={() => window.projecthub.openFolder(settings.installPath)}>
            {t('settingsOpenButton')}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit">{t('settingsSaveButton')}</Button>
        <Button type="button" variant="ghost" onClick={refresh}>
          Reset
        </Button>
        {status && <span className="text-sm text-brand-accent-green">{status}</span>}
      </div>
    </form>
  );

  const renderPacks = () => (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={packUrl}
          onChange={setPackUrl}
          className="sm:flex-1"
          placeholder="Git URL (e.g., https://github.com/org/projecthub-packs.git)"
        />
        <Button type="button" onClick={() => toast('Pack install from Git is not implemented yet.', 'info')}>Add pack</Button>
      </div>

      <div className="space-y-2">
        <div className="text-sm text-brand-text-dark/70">Installed packs</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {packs.map((pack) => (
            <div key={pack.name} className="rounded-lg border border-brand-divider/40 p-3 bg-white/5">
              <div className="flex items-center justify-between text-sm font-semibold text-white">
                <span>{pack.name}</span>
                <span className="text-xs text-brand-text-dark/70">{pack.status}</span>
              </div>
              {pack.summary && <p className="text-xs text-brand-text-dark/80 mt-1">{pack.summary}</p>}
              <div className="text-[11px] text-brand-text-dark/60 mt-1">
                {pack.technology && <span>Tech: {pack.technology} · </span>}
                {pack.version && <span>v{pack.version}</span>}
              </div>
            </div>
          ))}
          {packs.length === 0 && <p className="text-sm text-brand-text-dark/70">No packs detected in ~/.projecthub/packs</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button type="button" variant={tab === 'general' ? 'primary' : 'ghost'} onClick={() => setTab('general')}>
          General
        </Button>
        <Button type="button" variant={tab === 'packs' ? 'primary' : 'ghost'} onClick={() => setTab('packs')}>
          Packs
        </Button>
      </div>

      {tab === 'general' ? renderGeneral() : renderPacks()}
    </div>
  );
};

export default SettingsPage;

import type { Settings } from '@shared/types';
import React from 'react';

import Button from '../Button.js';
import SettingsPathInputs from './SettingsPathInputs.js';

type Props = {
  formValues: Settings | null;
  isReady: boolean;
  saving: boolean;
  status?: string;
  error?: string;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  onSave: (e: React.FormEvent) => void;
  onReload: () => void;
};

const SettingsGeneralTab: React.FC<Props> = ({ formValues, isReady, saving, status, error, onUpdate, onSave, onReload }) => (
  <form onSubmit={onSave} className="space-y-4">
    {!formValues ? (
      <p className="text-sm text-brand-accent-red">{error ?? 'Failed to load settings'}</p>
    ) : (
      <SettingsPathInputs
        values={formValues}
        disabled={!isReady}
        onChange={onUpdate}
        languageLabel="Language"
        openLabel="Open"
      />
    )}

    <div className="flex items-center gap-3">
      <Button type="submit" disabled={!isReady || saving}>
        {saving ? 'Saving…' : 'Save'}
      </Button>
      <Button type="button" variant="ghost" onClick={onReload}>
        Reset
      </Button>
      {status && <span className="text-sm text-brand-accent-green">{status}</span>}
      {error && <span className="text-sm text-brand-accent-red">{error}</span>}
    </div>
  </form>
);

export default SettingsGeneralTab;

import type { Settings } from '@shared/types';
import React from 'react';

import Button from '../Button.js';
import Input from '../Input.js';

const PATH_FIELDS: Array<{ key: keyof Settings; label: string }> = [
  { key: 'installPath', label: 'Install Path' },
  { key: 'projectsPath', label: 'Projects Path' },
  { key: 'templatesPath', label: 'Templates Path' },
  { key: 'librariesPath', label: 'Libraries Path' }
];

type Props = {
  values: Settings | null;
  disabled: boolean;
  onChange: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
  languageLabel: string;
  openLabel: string;
};

const LANGUAGE_OPTIONS = ['en', 'fr', 'ja'];

const SettingsPathInputs: React.FC<Props> = ({ values, disabled, onChange, languageLabel, openLabel }) => (
  <div className="space-y-4 text-sm">
    <label className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
      <span className="text-brand-text-dark/80 sm:w-32">{languageLabel}</span>
      <select
        className={`input w-full sm:flex-1 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        value={values?.language ?? 'en'}
        onChange={(e) => !disabled && onChange('language', e.target.value)}
        disabled={disabled}
      >
        {LANGUAGE_OPTIONS.map((lang) => (
          <option key={lang} value={lang}>
            {lang}
          </option>
        ))}
      </select>
    </label>

    {PATH_FIELDS.map(({ key, label }) => (
      <label key={key as string} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <span className="text-brand-text-dark/80 sm:w-32">{label}</span>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-1 sm:items-center">
          <Input
            value={(values?.[key] as string) ?? ''}
            onChange={(val) => !disabled && onChange(key, val as Settings[typeof key])}
            className={`sm:flex-1 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
          />
          {key === 'installPath' ? (
            <Button type="button" onClick={() => values && window.projecthub.openFolder(values.installPath)} disabled={disabled}>
              {openLabel}
            </Button>
          ) : null}
        </div>
      </label>
    ))}
  </div>
);

export default SettingsPathInputs;

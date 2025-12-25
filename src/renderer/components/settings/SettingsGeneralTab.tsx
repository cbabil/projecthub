import type { AccentColor, FontSize, Settings } from '@shared/types';
import { Check } from 'lucide-react';
import React from 'react';

const ACCENT_COLORS: Array<{ value: AccentColor; color: string }> = [
  { value: 'primary', color: '#6a5acd' },
  { value: 'boost', color: '#4f46e5' },
  { value: 'blue', color: '#4c6ef5' },
  { value: 'green', color: '#23ce6b' },
  { value: 'red', color: '#ef4444' }
];

const FONT_SIZES: Array<{ value: FontSize; label: string }> = [
  { value: 'small', label: 'S' },
  { value: 'medium', label: 'M' },
  { value: 'large', label: 'L' }
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
  { value: 'ja', label: 'Japanese' }
];

type Props = {
  settings: Settings;
  onUpdate: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
};

const SettingsGeneralTab: React.FC<Props> = ({ settings, onUpdate }) => {
  const currentAccent = settings.accentColor ?? 'primary';
  const currentFontSize = settings.fontSize ?? 'medium';
  const lineLimitHints = settings.enforceLineLimit ?? true;
  const reduceMotion = settings.reduceMotion ?? false;

  return (
    <div className="space-y-6 text-sm">
      {/* Appearance Section */}
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Appearance</h3>
        <div className="space-y-3">
          {/* Accent Color */}
          <div className="flex items-center justify-between">
            <span className="text-white/70">Accent color</span>
            <div className="flex items-center gap-2">
              {ACCENT_COLORS.map(({ value, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onUpdate('accentColor', value)}
                  className="w-6 h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: color }}
                  aria-label={`${value} accent color`}
                  aria-pressed={currentAccent === value}
                >
                  {currentAccent === value && (
                    <Check size={14} className="text-white" strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <span className="text-white/70">Font size</span>
            <div className="flex items-center gap-1 bg-white/10 rounded-md p-0.5">
              {FONT_SIZES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onUpdate('fontSize', value)}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    currentFontSize === value
                      ? 'bg-brand-accent-primary text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                  aria-pressed={currentFontSize === value}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Line Limit Hints */}
          <div className="flex items-center justify-between">
            <span className="text-white/70">Line limit hints</span>
            <button
              type="button"
              onClick={() => onUpdate('enforceLineLimit', !lineLimitHints)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                lineLimitHints ? 'bg-brand-accent-primary' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={lineLimitHints}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  lineLimitHints ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <span className="text-white/70">Reduce motion</span>
            <button
              type="button"
              onClick={() => onUpdate('reduceMotion', !reduceMotion)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                reduceMotion ? 'bg-brand-accent-primary' : 'bg-white/20'
              }`}
              role="switch"
              aria-checked={reduceMotion}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  reduceMotion ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Language Section */}
      <section>
        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wide mb-3">Language</h3>
        <select
          className="input w-full"
          value={settings.language ?? 'en'}
          onChange={(e) => onUpdate('language', e.target.value)}
        >
          {LANGUAGE_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </section>

    </div>
  );
};

export default SettingsGeneralTab;

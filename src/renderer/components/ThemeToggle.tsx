import { Moon, SunMedium } from 'lucide-react';
import React from 'react';

import { useSettings } from '../context/SettingsContext.js';

type ThemeToggleProps = {
  variant?: 'default' | 'minimal' | 'titlebar';
};

const VARIANT_CLASSES: Record<Required<ThemeToggleProps>['variant'], string> = {
  default:
    'h-10 w-10 border border-brand-divider bg-brand-surface-dark/80 text-brand-text-dark hover:bg-brand-accent-primary/10 hover:text-brand-accent-primary rounded-xl',
  minimal:
    'h-9 w-9 border border-transparent text-brand-text-dark hover:bg-brand-accent-primary/10 hover:text-brand-accent-primary rounded-xl',
  titlebar: 'h-8 w-8 border border-transparent text-current rounded-lg'
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'default' }) => {
  const { settings, update } = useSettings();
  const currentTheme = settings?.theme ?? 'dark';
  const isDark = currentTheme === 'dark';
  const Icon = isDark ? SunMedium : Moon;
  const nextTheme = isDark ? 'light' : 'dark';

  const handleToggle = () => {
    if (!settings) return;
    update({ ...settings, theme: nextTheme });
  };

  const classes = `inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-primary transition ${
    VARIANT_CLASSES[variant]
  }`;

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      className={classes}
    >
      <Icon className={variant === 'titlebar' ? 'h-3.5 w-3.5' : 'h-4 w-4'} aria-hidden />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};

export default ThemeToggle;

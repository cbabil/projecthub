import React from 'react';
import { ThemeToggle as BaseThemeToggle } from 'ui-toolkit';

import { useSettings } from '../context/SettingsContext.js';

type ThemeToggleProps = {
  variant?: 'default' | 'minimal' | 'titlebar';
};

const variantMap: Record<Required<ThemeToggleProps>['variant'], 'default' | 'minimal' | 'ghost'> = {
  default: 'default',
  minimal: 'minimal',
  titlebar: 'ghost'
};

const sizeMap: Record<Required<ThemeToggleProps>['variant'], 'sm' | 'md' | 'lg'> = {
  default: 'md',
  minimal: 'md',
  titlebar: 'sm'
};

const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'default' }) => {
  const { settings, update } = useSettings();
  const currentTheme = settings?.theme ?? 'dark';

  const handleToggle = (nextTheme: 'light' | 'dark') => {
    if (!settings) return;
    update({ ...settings, theme: nextTheme });
  };

  return (
    <BaseThemeToggle
      theme={currentTheme}
      onChange={handleToggle}
      variant={variantMap[variant]}
      size={sizeMap[variant]}
    />
  );
};

export default ThemeToggle;

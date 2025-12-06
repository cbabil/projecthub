import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { SettingsProvider, useSettings } from '../src/renderer/context/SettingsContext.js';

const settings = {
  installPath: '/install',
  projectsPath: '/projects',
  templatesPath: '/templates',
  librariesPath: '/libraries',
  theme: 'dark',
  accentColor: 'green',
  enforceLineLimit: false,
  recentProjects: [],
  appVersion: '1.0.0'
} as const;

const updatedSettings = {
  ...settings,
  theme: 'light',
  accentColor: 'primary'
};

const Consumer: React.FC = () => {
  const { settings: current, loading, error, refresh, update } = useSettings();
  return (
    <div>
      <div data-testid="theme">{current?.theme ?? 'none'}</div>
      <div data-testid="accent">{current?.accentColor ?? 'none'}</div>
      <div data-testid="loading">{String(loading)}</div>
      <div data-testid="error">{error ?? 'none'}</div>
      <button onClick={() => refresh()}>refresh</button>
      <button onClick={() => update(updatedSettings as any)}>update</button>
    </div>
  );
};

describe('SettingsProvider', () => {
  beforeEach(() => {
    if (!('projecthub' in window)) {
      (window as any).projecthub = {};
    }
    (window.projecthub as any).loadSettings = vi.fn().mockResolvedValue({ ok: true, data: settings });
    (window.projecthub as any).updateSettings = vi.fn().mockResolvedValue({ ok: true, data: updatedSettings });
  });

  it('loads settings on mount and applies theme classes', async () => {
    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--color-accent-primary')).toBe('#23ce6b');
  });

  it('updates settings and switches theme', async () => {
    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    const updateBtn = await screen.findByText('update');
    updateBtn.click();

    await waitFor(() => expect(screen.getByTestId('theme').textContent).toBe('light'));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect((window.projecthub as any).updateSettings).toHaveBeenCalledWith(updatedSettings);
  });

  it('surfaces errors when load fails', async () => {
    (window.projecthub as any).loadSettings = vi.fn().mockResolvedValue({ ok: false, error: 'boom' });
    render(
      <SettingsProvider>
        <Consumer />
      </SettingsProvider>
    );

    await waitFor(() => expect(screen.getByTestId('error').textContent).toBe('boom'));
  });
});

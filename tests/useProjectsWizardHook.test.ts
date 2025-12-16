import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useProjectsWizard } from '../src/renderer/hooks/useProjectsWizard.js';

const settings = {
  installPath: '/install',
  projectsPath: '/projects',
  templatesPath: '/templates',
  librariesPath: '/libraries',
  theme: 'dark',
  accentColor: 'blue',
  enforceLineLimit: false,
  recentProjects: ['old'],
  appVersion: '1.0.0'
};

const templates = [
  { id: 'tpl-1', name: 'Workspace', category: 'workspace', description: 'ws', type: 'template', version: '1', lastEdited: '2024-01-01' },
  { id: 'tpl-2', name: 'Config', category: 'config', description: 'cfg', type: 'template', version: '1', lastEdited: '2024-01-01' }
];

const libraries = [{ name: 'lib-one' }];

const updateMock = vi.fn().mockResolvedValue(undefined);

vi.mock('../src/renderer/context/DataContext.js', () => ({
  useData: () => ({ templates, libraries, refreshAll: vi.fn().mockResolvedValue(undefined) })
}));

vi.mock('../src/renderer/context/SettingsContext.js', () => ({
  useSettings: () => ({ settings, update: updateMock })
}));

describe('useProjectsWizard', () => {
  beforeEach(() => {
    if (!('projecthub' in window)) (window as any).projecthub = {};
    (window.projecthub as any).pickProjectLocation = vi.fn().mockResolvedValue({ ok: true, path: '/picked/path' });
    (window.projecthub as any).createProjectFromTemplates = vi.fn().mockResolvedValue({ ok: true });
    updateMock.mockClear();
  });

  it('validates basics and template selection before advancing', () => {
    const { result } = renderHook(() => useProjectsWizard());

    act(() => result.current.goNext()); // basics invalid
    expect(result.current.basicsTouched).toBe(true);
    expect(result.current.step).toBe(0);

    act(() => result.current.setName('My Project'));
    act(() => result.current.setVersion('1.0.0'));
    act(() => result.current.goNext()); // move to template step
    act(() => result.current.goNext()); // should block and mark template touched
    expect(result.current.templateTouched).toBe(true);
    expect(result.current.step).toBe(1);

    act(() => result.current.onTemplateSelectionChange(['tpl-1']));
    act(() => result.current.goNext());
    expect(result.current.step).toBe(2);
  });

  it('derives destination path and locks when picking location', async () => {
    const { result } = renderHook(() => useProjectsWizard());
    expect(result.current.destination).toBe('/projects');

    await act(async () => {
      await result.current.pickLocation();
    });

    expect(window.projecthub.pickProjectLocation).toHaveBeenCalled();
    expect(result.current.destination).toBe('/picked/path');
  });

  it('creates project and updates recent projects list', async () => {
    const { result } = renderHook(() => useProjectsWizard());

    await act(async () => {
      result.current.setName('Awesome');
      result.current.setVersion('1.0.0');
      result.current.onTemplateSelectionChange(['tpl-1']);
    });

    const res = await act(async () => result.current.createProject());
    expect((window.projecthub as any).createProjectFromTemplates).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Awesome',
        destination: '/projects/Awesome',
        templates: expect.arrayContaining([expect.objectContaining({ id: 'tpl-1' })])
      })
    );
    expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ recentProjects: ['Awesome', 'old'] }));
    expect(res?.ok ?? true).toBe(true);
  });

  it('returns error when submission invalid', async () => {
    const { result } = renderHook(() => useProjectsWizard());
    const res = await act(async () => result.current.createProject());
    expect(res).toEqual({ ok: false, error: 'Invalid state' });
  });

  it('propagates IPC errors from createProject', async () => {
    (window.projecthub as any).createProjectFromTemplates = vi.fn().mockResolvedValue({ ok: false, error: 'nope' });
    const { result } = renderHook(() => useProjectsWizard());
    await act(async () => {
      result.current.setName('Oops');
      result.current.setVersion('1.0.0');
      result.current.onTemplateSelectionChange(['tpl-2']);
    });
    const res = await act(async () => result.current.createProject());
    expect(res).toEqual({ ok: false, error: 'nope' });
  });
});

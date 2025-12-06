import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import ProjectsWizard from '../src/renderer/components/ProjectsWizard.js';

const onClose = vi.fn();
const onCreated = vi.fn().mockResolvedValue(undefined);

const wizardState = {
  templates: [{ id: 't1', name: 'Template 1', type: 'template', description: '', version: '1', lastEdited: '2024-01-01' }],
  filteredLibraries: [],
  step: 0,
  goNext: vi.fn(),
  goBack: vi.fn(),
  name: '',
  setName: vi.fn(),
  destination: '/projects',
  selectedTemplates: [],
  selectedLibs: [],
  toggleLibrary: vi.fn(),
  libQuery: '',
  setLibQuery: vi.fn(),
  onTemplateSelectionChange: vi.fn(),
  basicsValid: true,
  basicsTouched: false,
  templateValid: true,
  templateTouched: false,
  canSubmit: true,
  pickLocation: vi.fn(),
  createProject: vi.fn().mockResolvedValue({ ok: true })
};

vi.mock('../src/renderer/hooks/useProjectsWizard.js', () => ({
  useProjectsWizard: () => wizardState
}));

vi.mock('../src/renderer/context/TranslationContext.js', () => ({
  useTranslation: () => ({
    t: (key: string) => key
  })
}));

describe('ProjectsWizard component', () => {
  beforeEach(() => {
    vi.useRealTimers();
    wizardState.step = 0;
    Object.values(wizardState).forEach((value) => {
      if (typeof value === 'function') {
        (value as any).mockClear?.();
      }
    });
    (wizardState.createProject as any).mockResolvedValue({ ok: true });
    onClose.mockClear();
    onCreated.mockClear();
  });

  it('invokes navigation callbacks', async () => {
    const user = userEvent.setup();
    wizardState.step = 0;
    render(<ProjectsWizard onClose={onClose} onCreated={onCreated} />);

    await user.click(screen.getByText('wizardNext'));
    expect(wizardState.goNext).toHaveBeenCalled();

    wizardState.step = 1;
    wizardState.goBack.mockClear();
    render(<ProjectsWizard onClose={onClose} onCreated={onCreated} />);
    await user.click(screen.getByText('wizardBack'));
    expect(wizardState.goBack).toHaveBeenCalled();
  });

  it('shows success status and schedules close after creating project', async () => {
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout').mockImplementation((fn: any) => {
      fn();
      return 0 as any;
    });
    const user = userEvent.setup();
    wizardState.step = 3;
    render(<ProjectsWizard onClose={onClose} onCreated={onCreated} />);

    await user.click(screen.getByText('wizardCreate'));
    await act(async () => {
      await Promise.resolve();
    });
    expect(onCreated).toHaveBeenCalled();
    expect(screen.getByText('wizardStatusSuccess')).toBeInTheDocument();
    expect(onClose).toHaveBeenCalled();
    timeoutSpy.mockRestore();
  });

  it('displays error when createProject fails', async () => {
    wizardState.step = 3;
    (wizardState.createProject as any).mockResolvedValueOnce({ ok: false, error: 'nope' });
    const user = userEvent.setup();
    render(<ProjectsWizard onClose={onClose} onCreated={onCreated} />);
    await user.click(screen.getByText('wizardCreate'));
    await act(async () => {});
    expect(screen.getByText('nope')).toBeInTheDocument();
  });
});

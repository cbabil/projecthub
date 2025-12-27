import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Templates from '../src/renderer/pages/Templates.js';
import Projects from '../src/renderer/pages/Projects.js';
import Grid from '../src/renderer/components/Grid.js';

const t = (key: string) => key;

vi.mock('../src/renderer/components/ProjectsWizard.js', () => ({
  __esModule: true,
  default: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="wizard-mock">
      <button onClick={onClose}>close wizard</button>
    </div>
  )
}));

const dataState: any = {
  filteredTemplates: [],
  libraries: [],
  projects: [],
  loading: false,
  refreshAll: vi.fn().mockResolvedValue(undefined)
};

vi.mock('../src/renderer/context/TranslationContext.js', () => ({
  useTranslation: () => ({ t })
}));

vi.mock('../src/renderer/context/DataContext.js', () => ({
  useData: () => dataState
}));

// Mock ui-toolkit Toast
const mockAddToast = vi.fn();
vi.mock('ui-toolkit', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>;
  return {
    ...actual,
    useToast: () => mockAddToast,
    useToasts: () => ({ toasts: [], removeToast: vi.fn() }),
    ToastProvider: ({ children }: { children: React.ReactNode }) => children,
    ToastContainer: () => null
  };
});

// Mock AIContext
vi.mock('../src/renderer/context/AIContext.js', () => ({
  useAI: () => ({
    isConfigured: false,
    settings: { provider: 'anthropic', anthropic: { apiKey: '', model: 'claude-sonnet-4-20250514' }, openai: { apiKey: '', model: 'gpt-4o' }, ollama: { endpoint: 'http://localhost:11434', model: 'llama3' } },
    messages: [],
    streaming: false,
    streamContent: '',
    sendMessage: vi.fn(),
    clearChat: vi.fn(),
    testConnection: vi.fn(),
    updateProvider: vi.fn()
  }),
  AIProvider: ({ children }: { children: React.ReactNode }) => children
}));

if (!('projecthub' in window)) {
  (window as any).projecthub = {};
}
(window.projecthub as any).deleteTemplate = vi.fn();
(window.projecthub as any).deleteProject = vi.fn();
(window.projecthub as any).readTemplate = vi.fn().mockResolvedValue({ ok: true, data: 'title: ViewMe' });
(window.projecthub as any).updateTemplate = vi.fn().mockResolvedValue({ ok: true });
(window.projecthub as any).ipc = { on: vi.fn(), removeAllListeners: vi.fn() };
if (!window.confirm) window.confirm = (() => true) as any;
const confirmSpy = vi.spyOn(window, 'confirm');

beforeEach(() => {
  dataState.filteredTemplates = [];
  dataState.projects = [];
  dataState.loading = false;
  (window.projecthub.deleteTemplate as any).mockReset();
  (window.projecthub.deleteProject as any).mockReset();
  mockAddToast.mockClear();
  confirmSpy.mockClear();
  confirmSpy.mockImplementation(() => true);
});

describe('Templates page edge cases', () => {
  it('shows toast when deleting template without sourcePath', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [{ name: 'NoPath', description: '', category: 'templates', version: '1', lastEdited: '', editable: true }];
    render(<Templates />);
    await user.click(screen.getByLabelText('Delete template'));
    expect(mockAddToast).toHaveBeenCalledWith('Template path unknown; cannot delete.', 'error');
  });

  it('opens modal on view and closes it', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [
      { name: 'ViewMe', description: '', category: 'templates', version: '1', lastEdited: '', editable: true, sourcePath: 'view.json', content: { foo: 'bar' } }
    ];
    render(<Templates />);
    await user.click(screen.getByLabelText('View template'));
    const viewer = await screen.findAllByRole('textbox');
    const textarea = viewer.find((el: HTMLElement) => el.tagName === 'TEXTAREA') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
    expect(textarea.readOnly).toBe(true);
    await user.click(screen.getByLabelText('Close modal'));
    expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
  });

  it('opens editable modal when clicking edit on editable template', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [
      { name: 'Editable', description: '', category: 'templates', version: '1', lastEdited: '', editable: true, sourcePath: 'edit.json', content: { foo: 'bar' } }
    ];
    render(<Templates />);
    await user.click(screen.getByLabelText('Edit template'));
    const textarea = (await screen.findAllByRole('textbox')).find((el: HTMLElement) => el.tagName === 'TEXTAREA') as HTMLTextAreaElement;
    expect(textarea?.readOnly).toBe(false);
  });

  it('shows backend error when deleteTemplate fails', async () => {
    const user = userEvent.setup();
    (window.projecthub.deleteTemplate as any).mockResolvedValue({ ok: false, error: 'boom' });
    dataState.filteredTemplates = [
      { name: 'Broken', description: '', category: 'templates', version: '1', lastEdited: '', editable: true, sourcePath: 'broken.json' }
    ];
    render(<Templates />);
    await user.click(screen.getByLabelText('Delete template'));
    expect(mockAddToast).toHaveBeenCalledWith('Failed to delete template: boom', 'error');
  });
});

describe('Projects page edge cases', () => {
  it('uses derived filename when sourcePath missing', async () => {
    const user = userEvent.setup();
    (window.projecthub.deleteProject as any).mockResolvedValue({ ok: true });
    dataState.projects = [
      { type: 'project', name: 'My Project', description: '', version: '1', lastEdited: '', path: '/tmp' }
    ];
    render(<Projects />);
    expect(screen.getByText('My Project')).toBeInTheDocument();
    const deleteBtn = screen.getByLabelText('Delete project');
    if (!deleteBtn) throw new Error('delete button not found');
    const userProjects = userEvent.setup();
    await userProjects.click(deleteBtn);
    await waitFor(() =>
      expect(window.projecthub.deleteProject).toHaveBeenCalledWith(
        expect.objectContaining({ relativePath: 'my_project/metadata.yaml', folderPath: '/tmp' })
      )
    );
  });

  it('shows toast when deleteProject fails', async () => {
    const user = userEvent.setup();
    (window.projecthub.deleteProject as any).mockResolvedValue({ ok: false, error: 'nope' });
    dataState.projects = [
      { type: 'project', name: 'Fail', description: '', version: '1', lastEdited: '', path: '/tmp/fail', sourcePath: 'fail.json' }
    ];
    render(<Projects />);
    expect(screen.getByText('Fail')).toBeInTheDocument();
    const deleteBtn = screen.getByLabelText('Delete project');
    if (!deleteBtn) throw new Error('delete button not found');
    const userProjects = userEvent.setup();
    await userProjects.click(deleteBtn);
    await waitFor(() => expect(mockAddToast).toHaveBeenCalledWith('Failed to delete project: nope', 'error'));
  });

  it('opens wizard modal via action button', async () => {
    const user = userEvent.setup();
    dataState.projects = [];
    render(<Projects />);
    expect(screen.queryByTestId('wizard-mock')).not.toBeInTheDocument();
    await user.click(screen.getByText('projectsNewButton'));
    expect(screen.getByTestId('wizard-mock')).toBeInTheDocument();
    await user.click(screen.getByText('close wizard'));
    expect(screen.queryByTestId('wizard-mock')).not.toBeInTheDocument();
  });
});

describe('Grid component', () => {
  it('renders prefix/suffix and loading indicator', () => {
    render(
      <Grid
        items={[]}
        loading
        renderPrefix={<div>prefix</div>}
        renderSuffix={<div>suffix</div>}
      />
    );
    expect(screen.getByText('prefix')).toBeInTheDocument();
    expect(screen.getByText('suffix')).toBeInTheDocument();
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });
});

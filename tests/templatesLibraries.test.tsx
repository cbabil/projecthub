import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Templates from '../src/renderer/pages/Templates.js';
import Libraries from '../src/renderer/pages/Libraries.js';
import Projects from '../src/renderer/pages/Projects.js';

const t = (key: string) => key;

const dataState: {
  filteredTemplates: any[];
  libraries: any[];
  projects: any[];
  loading: boolean;
  refreshAll: () => Promise<void>;
} = {
  filteredTemplates: [] as any[],
  libraries: [] as any[],
  projects: [] as any[],
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
(window.projecthub as any).deleteTemplate = vi.fn().mockResolvedValue({ ok: true });
(window.projecthub as any).deleteProject = vi.fn().mockResolvedValue({ ok: true });
(window.projecthub as any).readTemplate = vi.fn().mockResolvedValue({ ok: true, data: 'name: Sample' });
(window.projecthub as any).updateTemplate = vi.fn().mockResolvedValue({ ok: true });
(window.projecthub as any).ipc = { on: vi.fn(), removeAllListeners: vi.fn() };
// ensure confirm exists for tests
if (!window.confirm) window.confirm = (() => true) as any;

beforeEach(() => {
  dataState.filteredTemplates = [];
  dataState.libraries = [];
  dataState.projects = [];
  dataState.loading = false;
  dataState.refreshAll = vi.fn().mockResolvedValue(undefined);
  (window.projecthub.deleteTemplate as any).mockClear();
  (window.projecthub.deleteProject as any).mockClear();
  (window.projecthub.ipc.on as any).mockClear();
  (window.projecthub.ipc.removeAllListeners as any).mockClear();
  vi.spyOn(window, 'confirm').mockReturnValue(true);
  mockAddToast.mockClear();
});

describe('Templates page empty state', () => {
  it('shows consistent empty title and message', () => {
    dataState.filteredTemplates = [];
    render(<Templates />);
    expect(screen.getByText('templatesEmptyTitle')).toBeInTheDocument();
    expect(screen.getByText('templatesEmptyMessage')).toBeInTheDocument();
  });
});

describe('Libraries page empty state', () => {
  it('shows consistent empty title and message', () => {
    dataState.libraries = [];
    render(<Libraries />);
    expect(screen.getByText('librariesEmptyTitle')).toBeInTheDocument();
    expect(screen.getByText('librariesEmptyMessage')).toBeInTheDocument();
  });

  it('renders a library row', () => {
    dataState.libraries = [
      {
        name: 'Lib A',
        description: 'Desc',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        type: 'library'
      }
    ];
    render(<Libraries />);
    expect(screen.getByText('Lib A')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });
});

describe('Projects page', () => {
  it('shows empty state', () => {
    dataState.projects = [];
    render(<Projects />);
    expect(screen.getByText('projectsEmptyTitle')).toBeInTheDocument();
    expect(screen.getByText('projectsEmptyMessage')).toBeInTheDocument();
  });

  it('renders row and delete action triggers IPC + refresh', async () => {
    const user = userEvent.setup();
    dataState.projects = [
      {
        type: 'project',
        name: 'Proj1',
        description: 'Demo',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        path: '/tmp/proj1',
        templateUsed: ['tpl1']
      }
    ];
    render(<Projects />);
    expect(screen.getByText('Proj1')).toBeInTheDocument();
    const deleteBtn = screen.getByLabelText('Delete project');
    if (!deleteBtn) throw new Error('Delete button not found');
    await user.click(deleteBtn);
    expect(window.projecthub.deleteProject).toHaveBeenCalled();
    expect(dataState.refreshAll).toHaveBeenCalled();
  });
});

describe('Templates page actions and headers', () => {
  it('renders headers including Actions', () => {
    dataState.filteredTemplates = [
      {
        name: 'T1',
        description: 'D',
        category: 'templates',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        editable: true,
        sourcePath: 'templates/t1.json'
      }
    ];
    render(<Templates />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Last Edited')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('renders action buttons and handles delete with confirmation', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [
      {
        name: 'T1',
        description: 'D',
        category: 'templates',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        editable: true,
        sourcePath: 'templates/t1.json'
      }
    ];
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Templates />);

    const viewBtn = screen.getByLabelText('View template');
    const editBtn = screen.getByLabelText('Edit template');
    const deleteBtn = screen.getByLabelText('Delete template');

    expect(viewBtn).toBeInTheDocument();
    expect(editBtn).toBeInTheDocument();
    expect(deleteBtn).toBeInTheDocument();

    await user.click(deleteBtn);
    expect(confirmSpy).toHaveBeenCalled();
    expect(window.projecthub.deleteTemplate).toHaveBeenCalledWith('templates/t1.json');
  });

  it('disables edit when template is not editable', () => {
    dataState.filteredTemplates = [
      {
        name: 'T2',
        description: 'D',
        category: 'templates',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        editable: false,
        sourcePath: 'templates/t2.json'
      }
    ];
    render(<Templates />);
    const editBtn = screen.getByLabelText('Edit template');
    expect(editBtn).toBeDisabled();
  });

  it('shows toast when deleting without a sourcePath', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [
      {
        name: 'T3',
        description: 'D',
        category: 'templates',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        editable: true
      }
    ];
    render(<Templates />);
    await user.click(screen.getByLabelText('Delete template'));
    expect(mockAddToast).toHaveBeenCalledWith('Template path unknown; cannot delete.', 'error');
    expect(window.projecthub.deleteTemplate).not.toHaveBeenCalled();
  });

  it('opens view modal when clicking view', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [
      {
        name: 'T4',
        description: 'D',
        category: 'templates',
        version: '1.0',
        lastEdited: '2024-01-01T00:00:00.000Z',
        editable: true,
        sourcePath: 'templates/t4.json'
      }
    ];
    render(<Templates />);
    await user.click(screen.getByLabelText('View template'));
    expect(screen.getAllByText('T4').length).toBeGreaterThanOrEqual(1);
  });
});

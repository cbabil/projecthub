import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import Grid from '../src/renderer/components/Grid.js';
import type { BaseMeta } from '../src/shared/types.js';
import Templates from '../src/renderer/pages/Templates.js';
import Projects from '../src/renderer/pages/Projects.js';
import Libraries from '../src/renderer/pages/Libraries.js';

const t = (key: string) => key;

const dataState: {
  filteredTemplates: any[];
  libraries: any[];
  projects: any[];
  loading: boolean;
  refreshAll: () => Promise<void>;
} = {
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

// Mock ToastContext
const mockAddToast = vi.fn();
vi.mock('../src/renderer/context/ToastContext.js', () => ({
  useToast: () => mockAddToast,
  useToasts: () => ({ toasts: [], removeToast: vi.fn() }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => children
}));

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

if (!('projecthub' in window)) (window as any).projecthub = {};
(window.projecthub as any).deleteProject = vi.fn().mockResolvedValue({ ok: true });
(window.projecthub as any).deleteTemplate = vi.fn().mockResolvedValue({ ok: true });
(window.projecthub as any).ipc = { on: vi.fn(), removeAllListeners: vi.fn() };
if (!window.confirm) window.confirm = (() => true) as any;
if (!window.alert) window.alert = (() => undefined) as any;

beforeEach(() => {
  dataState.filteredTemplates = [];
  dataState.libraries = [];
  dataState.projects = [];
  dataState.loading = false;
  dataState.refreshAll = vi.fn().mockResolvedValue(undefined);
  (window.projecthub.deleteProject as any).mockClear();
  (window.projecthub.deleteTemplate as any).mockClear();
});

const baseItems: BaseMeta[] = [
  { type: 'template', name: 'Beta', description: 'Second', version: '1', lastEdited: '2024-01-02' },
  { type: 'template', name: 'Alpha', description: 'First', version: '1', lastEdited: '2024-01-01' }
];

describe('Grid component', () => {
  it('filters by search query', async () => {
    const user = userEvent.setup();
    render(
      <Grid
        items={baseItems}
        onSelect={vi.fn()}
        pageSize={10}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    const search = screen.getByPlaceholderText('Search all columns');
    await user.type(search, 'Beta');
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('sorts when header clicked', async () => {
    const user = userEvent.setup();
    render(
      <Grid
        items={baseItems}
        onSelect={vi.fn()}
        pageSize={10}
      />
    );
    // default order Alpha then Beta
    const rowsBefore = screen.getAllByText(/Alpha|Beta/).map((n: HTMLElement) => n.textContent);
    await user.click(screen.getByText('Name'));
    const rowsAfter = screen.getAllByText(/Alpha|Beta/).map((n: HTMLElement) => n.textContent);
    expect(rowsAfter.join('')).not.toBe(rowsBefore.join(''));
  });

  it('renders rows with data from items', () => {
    render(
      <Grid
        items={[
          { type: 'template', name: 'CatRow', description: 'Desc', version: '1', lastEdited: '2024-01-01', category: 'special' }
        ]}
        onSelect={vi.fn()}
        pageSize={5}
      />
    );
    expect(screen.getByText('CatRow')).toBeInTheDocument();
    expect(screen.getByText('Desc')).toBeInTheDocument();
  });
});

describe('Templates page search', () => {
  it('filters templates', async () => {
    const user = userEvent.setup();
    dataState.filteredTemplates = [
      { name: 'Temp1', description: '', category: 'templates', version: '', lastEdited: '', editable: true, sourcePath: 'a' },
      { name: 'Temp2', description: '', category: 'templates', version: '', lastEdited: '', editable: true, sourcePath: 'b' }
    ];
    render(<Templates />);
    await user.type(screen.getByPlaceholderText('Search all columns'), 'Temp2');
    expect(screen.queryByText('Temp1')).not.toBeInTheDocument();
    expect(screen.getByText('Temp2')).toBeInTheDocument();
  });
});

describe('Libraries page search', () => {
  it('filters libraries', async () => {
    const user = userEvent.setup();
    dataState.libraries = [
      { name: 'LibOne', description: 'A', version: '', lastEdited: '', type: 'library' },
      { name: 'LibTwo', description: 'B', version: '', lastEdited: '', type: 'library' }
    ];
    render(<Libraries />);
    await user.type(screen.getByPlaceholderText('Search all columns'), 'Two');
    expect(screen.queryByText('LibOne')).not.toBeInTheDocument();
    expect(screen.getByText('LibTwo')).toBeInTheDocument();
  });
});

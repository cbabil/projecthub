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
        searchPlaceholder="Search grid"
        onSelect={vi.fn()}
        renderCategory={() => 'cat'}
        pageSize={10}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    const search = screen.getByPlaceholderText('Search grid');
    await user.type(search, 'Beta');
    expect(screen.queryByText('Alpha')).not.toBeInTheDocument();
    expect(screen.getByText('Beta')).toBeInTheDocument();
  });

  it('sorts when header clicked', async () => {
    const user = userEvent.setup();
    render(
      <Grid
        items={baseItems}
        searchPlaceholder="Search grid"
        onSelect={vi.fn()}
        renderCategory={() => 'cat'}
        pageSize={10}
      />
    );
    // default order Alpha then Beta
    const rowsBefore = screen.getAllByText(/Alpha|Beta/).map((n: HTMLElement) => n.textContent);
    await user.click(screen.getByText('Name'));
    const rowsAfter = screen.getAllByText(/Alpha|Beta/).map((n: HTMLElement) => n.textContent);
    expect(rowsAfter.join('')).not.toBe(rowsBefore.join(''));
  });

  it('renders categories and actions when provided', async () => {
    const user = userEvent.setup();
    const renderActions = vi.fn().mockReturnValue(<button data-testid="act-btn">Act</button>);
    render(
      <Grid
        items={[
          { type: 'template', name: 'CatRow', description: 'Desc', version: '1', lastEdited: '2024-01-01', category: 'special' }
        ]}
        searchPlaceholder="Search grid"
        onSelect={vi.fn()}
        renderCategory={(row: any) => row.category ?? 'fallback'}
        renderActions={renderActions}
        pageSize={5}
      />
    );
    expect(screen.getByText('special')).toBeInTheDocument();
    expect(screen.getByTestId('act-btn')).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText('Search grid'), 'Cat');
    expect(renderActions).toHaveBeenCalled();
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
    await user.type(screen.getByPlaceholderText('templatesSearchPlaceholder'), 'Temp2');
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
    await user.type(screen.getByPlaceholderText('librariesSearchPlaceholder'), 'Two');
    expect(screen.queryByText('LibOne')).not.toBeInTheDocument();
    expect(screen.getByText('LibTwo')).toBeInTheDocument();
  });
});

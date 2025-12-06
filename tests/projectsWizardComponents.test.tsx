import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import ProjectsWizardContent from '../src/renderer/components/ProjectsWizardContent.js';
import ProjectsWizardFooter from '../src/renderer/components/ProjectsWizardFooter.js';
import StepperProgress from '../src/renderer/components/StepperProgress.js';
import TemplateStep from '../src/renderer/components/TemplateStep.js';
import { LibrariesStep, ReviewStep } from '../src/renderer/components/ProjectsWizardSteps.js';

const basicsProps = {
  name: '',
  destination: '',
  onNameChange: () => undefined,
  onPickLocation: () => undefined,
  labels: { name: 'Name', destination: 'Destination', error: 'Error', choose: 'Choose' },
  showError: false
};

const templateLabels = {
  name: 'Name',
  description: 'Description',
  emptyTitle: 'No templates found',
  emptyMessage: 'Install a pack to add templates',
  searchPlaceholder: 'Search',
  pageLabel: 'Page {current} of {total}',
  prev: 'Prev',
  next: 'Next'
};

describe('ProjectsWizardContent routing', () => {
  it('renders appropriate step component', () => {
    render(
      <ProjectsWizardContent
        step={0}
        basics={basicsProps}
        template={{ templates: [], selected: [], onSelectionChange: () => undefined, errorText: 'err', showError: false, labels: templateLabels }}
        libraries={{
          libraries: [],
          selected: [],
          query: '',
          searchPlaceholder: 'Search libs',
          emptyTitle: 'No libraries found',
          emptyMessage: 'Add libraries',
          onQueryChange: () => undefined,
          onToggle: () => undefined
        }}
        review={{
          name: 'A',
          destination: '/tmp',
          templates: [],
          libraries: [],
          labels: { name: 'Name', template: 'Template', installTree: 'Destination', libraries: 'Libraries', none: 'None' }
        }}
      />
    );
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});

describe('TemplateStep', () => {
  it('shows empty state and error', () => {
    render(
      <TemplateStep
        templates={[]}
        selected={[]}
        onSelectionChange={() => undefined}
        errorText="Select at least one"
        showError
        labels={templateLabels}
      />
    );
    expect(screen.getByText('No templates found')).toBeInTheDocument();
    expect(screen.getByText('Select at least one')).toBeInTheDocument();
  });

  it('renders templates and supports pagination label formatter', async () => {
    const user = userEvent.setup();
    render(
      <TemplateStep
        templates={[
          { id: 'a', name: 'Alpha', description: 'First' },
          { id: 'b', name: 'Beta', description: 'Second' }
        ]}
        selected={[]}
        onSelectionChange={() => undefined}
        errorText="err"
        showError={false}
        labels={templateLabels}
      />
    );
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    const search = screen.getByPlaceholderText('Search');
    await user.type(search, 'alp');
    expect(search).toHaveValue('alp');
  });

  it('sorts by description column', async () => {
    const user = userEvent.setup();
    render(
      <TemplateStep
        templates={[
          { id: 'c', name: 'Gamma', description: 'zzz' },
          { id: 'd', name: 'Delta', description: 'aaa' }
        ]}
        selected={[]}
        onSelectionChange={() => undefined}
        errorText="err"
        showError={false}
        labels={templateLabels}
      />
    );
    await user.click(screen.getByText('Description'));
    const rows = screen.getAllByText(/Gamma|Delta/).map((el: HTMLElement) => el.textContent);
    expect(rows[0]).toBe('Delta');
  });

  it('sorts by name column', async () => {
    const user = userEvent.setup();
    render(
      <TemplateStep
        templates={[
          { id: '1', name: 'Zeta', description: 'zzz' },
          { id: '2', name: 'Alpha', description: 'aaa' }
        ]}
        selected={[]}
        onSelectionChange={() => undefined}
        errorText="err"
        showError={false}
        labels={templateLabels}
      />
    );
    await user.click(screen.getByText('Name'));
    const rows = screen.getAllByText(/Alpha|Zeta/).map((el: HTMLElement) => el.textContent);
    expect(rows[0]).toBe('Alpha');
  });
});

describe('LibrariesStep', () => {
  it('renders checkboxes and toggles selection', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <LibrariesStep
        libraries={[{ name: 'Lib1' }, { name: 'Lib2' }]}
        selected={['Lib1']}
        query=""
        searchPlaceholder="Search libs"
        emptyTitle="No libraries found"
        emptyMessage="Add libs"
        onQueryChange={() => undefined}
        onToggle={onToggle}
      />
    );
    const lib2 = screen.getByLabelText('Lib2');
    await user.click(lib2);
    expect(onToggle).toHaveBeenCalledWith('Lib2');
  });

  it('shows empty state when no libraries', () => {
    render(
      <LibrariesStep
        libraries={[]}
        selected={[]}
        query=""
        searchPlaceholder="Search libs"
        emptyTitle="No libraries found"
        emptyMessage="Add libs"
        onQueryChange={() => undefined}
        onToggle={() => undefined}
      />
    );
    expect(screen.getByText('No libraries found')).toBeInTheDocument();
  });
});

describe('ReviewStep', () => {
  it('formats templates and warns when no workspace template', () => {
    render(
      <ReviewStep
        name="Demo"
        destination="/projects/demo"
        templates={[{ name: 'Config', category: 'config' }]}
        libraries={['lib1', 'lib2']}
        labels={{ name: 'Name', installTree: 'Destination', template: 'Template', libraries: 'Libraries', none: 'None' }}
      />
    );
    expect(screen.getByText('config: Config')).toBeInTheDocument();
    expect(screen.queryByText(/No workspace template/)).not.toBeNull();
    expect(screen.getByText('lib1, lib2')).toBeInTheDocument();
  });
});

describe('ProjectsWizardFooter', () => {
  it('shows next and back buttons based on step and state', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    const onNext = vi.fn();
    const onCreate = vi.fn();

    const { rerender } = render(
      <ProjectsWizardFooter
        step={0}
        totalSteps={3}
        onBack={onBack}
        onNext={onNext}
        onCreate={onCreate}
        canAdvance
        canSubmit={false}
        isSubmitting={false}
        backLabel="Back"
        nextLabel="Next"
        createLabel="Create"
      />
    );

    await user.click(screen.getByText('Next'));
    expect(onNext).toHaveBeenCalled();

    rerender(
      <ProjectsWizardFooter
        step={2}
        totalSteps={3}
        onBack={onBack}
        onNext={onNext}
        onCreate={onCreate}
        canAdvance
        canSubmit
        isSubmitting={false}
        backLabel="Back"
        nextLabel="Next"
        createLabel="Create"
        status="ok"
      />
    );

    expect(screen.getByText('ok')).toBeInTheDocument();
    await user.click(screen.getByText('Back'));
    await user.click(screen.getByText('Create'));
    expect(onBack).toHaveBeenCalled();
    expect(onCreate).toHaveBeenCalled();
  });
});

describe('StepperProgress', () => {
  it('marks active and completed steps', () => {
    render(<StepperProgress steps={['One', 'Two', 'Three']} currentIndex={1} />);
    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
  });
});

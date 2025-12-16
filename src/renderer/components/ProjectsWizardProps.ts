import type { LibraryMeta, TemplateMeta } from '@shared/types';

import type {
  BasicsStepProps,
  LibrariesStepProps,
  ReviewStepProps,
  TemplateStepProps,
  TranslateFn
} from './ProjectsWizardTypes.js';

export type { BasicsStepProps, LibrariesStepProps, ReviewStepProps, TemplateStepProps, TranslateFn };

/** Build basics step props */
export const buildBasicsProps = (
  t: TranslateFn,
  data: {
    name: string;
    version: string;
    destination: string;
    setName: (v: string) => void;
    setVersion: (v: string) => void;
    pickLocation: () => void;
    showError: boolean;
  }
): BasicsStepProps => ({
  name: data.name,
  version: data.version,
  destination: data.destination,
  onNameChange: data.setName,
  onVersionChange: data.setVersion,
  onPickLocation: data.pickLocation,
  showError: data.showError,
  labels: {
    name: t('wizardProjectName'),
    version: t('wizardReviewVersion'),
    destination: t('wizardDestinationPath'),
    error: t('wizardBasicsError') ?? 'Name, version, and destination are required.',
    choose: t('wizardChooseFolder') ?? 'Choose…'
  }
});

/** Build template step props */
export const buildTemplateProps = (
  t: TranslateFn,
  data: {
    templates: TemplateMeta[];
    selected: string[];
    onSelectionChange: (ids: string[]) => void;
    showError: boolean;
  }
): TemplateStepProps => ({
  templates: data.templates,
  selected: data.selected,
  onSelectionChange: data.onSelectionChange,
  errorText: t('wizardTemplateError') ?? 'Select a template.',
  showError: data.showError,
  labels: {
    name: t('wizardTemplateGridName') ?? 'Name',
    description: t('wizardTemplateGridDescription') ?? 'Description',
    emptyTitle: t('templatesEmptyTitle') ?? 'No templates',
    emptyMessage: t('templatesEmptyMessage') ?? 'Add template JSON files to ~/.projecthub/templates',
    searchPlaceholder: t('wizardTemplateSearchPlaceholder') ?? 'Search templates',
    pageLabel: t('wizardTemplatePageLabel') ?? 'Page {current} of {total}',
    prev: t('wizardBack'),
    next: t('wizardNext')
  }
});

/** Build libraries step props */
export const buildLibrariesProps = (
  t: TranslateFn,
  data: {
    libraries: LibraryMeta[];
    selected: string[];
    query: string;
    onQueryChange: (v: string) => void;
    onToggle: (id: string) => void;
  }
): LibrariesStepProps => ({
  libraries: data.libraries,
  selected: data.selected,
  query: data.query,
  onQueryChange: data.onQueryChange,
  onToggle: data.onToggle,
  emptyTitle: t('librariesEmptyTitle'),
  emptyMessage: t('librariesEmptyMessage'),
  searchPlaceholder: t('wizardFilterLibraries')
});

/** Build review step props */
export const buildReviewProps = (
  t: TranslateFn,
  data: {
    name: string;
    version: string;
    destination: string;
    templates: TemplateMeta[];
    libraries: string[];
  }
): ReviewStepProps => ({
  name: data.name,
  version: data.version,
  destination: data.destination,
  templates: data.templates,
  libraries: data.libraries,
  labels: {
    name: t('wizardReviewName'),
    template: t('wizardReviewTemplate'),
    version: t('wizardReviewVersion'),
    installTree: t('wizardReviewDestination'),
    libraries: t('wizardReviewLibraries'),
    none: t('wizardReviewNone')
  }
});

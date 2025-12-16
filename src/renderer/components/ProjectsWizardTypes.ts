import type { LibraryMeta, TemplateMeta } from '@shared/types';

import type { TranslationKeys } from '../../i18n/index.js';

/** Translation function type */
export type TranslateFn = (key: TranslationKeys) => string;

/** Basics step props */
export interface BasicsStepProps {
  name: string;
  version: string;
  destination: string;
  onNameChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onPickLocation: () => void;
  showError: boolean;
  labels: {
    name: string;
    version: string;
    destination: string;
    error: string;
    choose: string;
  };
}

/** Template step props */
export interface TemplateStepProps {
  templates: TemplateMeta[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  errorText: string;
  showError: boolean;
  labels: {
    name: string;
    description: string;
    emptyTitle: string;
    emptyMessage: string;
    searchPlaceholder: string;
    pageLabel: string;
    prev: string;
    next: string;
  };
}

/** Libraries step props */
export interface LibrariesStepProps {
  libraries: LibraryMeta[];
  selected: string[];
  query: string;
  onQueryChange: (value: string) => void;
  onToggle: (id: string) => void;
  emptyTitle: string;
  emptyMessage: string;
  searchPlaceholder: string;
}

/** Review step props */
export interface ReviewStepProps {
  name: string;
  version: string;
  destination: string;
  templates: TemplateMeta[];
  libraries: string[];
  labels: {
    name: string;
    template: string;
    version: string;
    installTree: string;
    libraries: string;
    none: string;
  };
}

import { describe, expect, it } from 'vitest';

import en from '../src/i18n/en/common.js';

describe('empty state copy', () => {
  it('matches templates messaging', () => {
    expect(en.templatesEmptyTitle).toBe('No templates found');
    expect(en.templatesEmptyMessage).toBe('Install a pack from Settings to load templates automatically.');
  });

  it('matches libraries messaging', () => {
    expect(en.librariesEmptyTitle).toBe('No libraries found');
    expect(en.librariesEmptyMessage).toBe('Install a pack from Settings to load libraries automatically.');
  });
});

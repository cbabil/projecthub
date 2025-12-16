import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import EditorModal from '../src/renderer/components/EditorModal.js';

describe('EditorModal', () => {
  it('lets the user edit YAML text and save it', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const onClose = vi.fn();
    render(<EditorModal open title="Edit" value="foo: bar" editable onSave={onSave} onClose={onClose} languageLabel="YAML" />);

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'foo: baz');
    await user.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith('foo: baz');
    expect(onClose).toHaveBeenCalled();
  });
});

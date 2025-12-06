import { describe, expect, it } from 'vitest';

import { useTemplateSelection } from '../src/renderer/hooks/useTemplateSelection.js';
import { renderHook, act } from '@testing-library/react';

describe('useTemplateSelection', () => {
  it('toggles and replaces selection', () => {
    const { result } = renderHook(() => useTemplateSelection());
    act(() => result.current.toggle('a'));
    expect(result.current.selected).toEqual(['a']);

    act(() => result.current.toggle('a'));
    expect(result.current.selected).toEqual([]);

    act(() => result.current.replace(['x', 'y']));
    expect(result.current.selected).toEqual(['x', 'y']);
  });
});

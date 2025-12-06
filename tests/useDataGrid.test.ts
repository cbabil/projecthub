import { renderHook, act } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useDataGrid } from '../src/renderer/hooks/useDataGrid.js';

const columns = [
  { id: 'name', label: 'Name', accessor: (row: any) => row.name, sortable: true, sortValue: (row: any) => row.name }
];

const rows = [{ name: 'Bravo' }, { name: 'Alpha' }, { name: 'Charlie' }];

describe('useDataGrid', () => {
  it('filters by query and sorts ascending/descending', () => {
    const { result } = renderHook(() => useDataGrid(rows, columns, { pageSize: 2 }));

    act(() => result.current.toggleSort('name'));
    expect(result.current.visibleRows[0].name).toBe('Alpha');

    act(() => result.current.toggleSort('name'));
    expect(result.current.visibleRows[0].name).toBe('Charlie');

    act(() => result.current.setQuery('br'));
    expect(result.current.visibleRows[0].name).toBe('Bravo');
    expect(result.current.pageCount).toBe(1);
  });

  it('handles pagination boundaries', () => {
    const { result } = renderHook(() => useDataGrid(rows, columns, { pageSize: 1 }));
    expect(result.current.visibleRows).toHaveLength(1);

    act(() => result.current.goToNextPage());
    expect(result.current.page).toBe(1);
    act(() => result.current.goToNextPage());
    expect(result.current.page).toBe(2);

    act(() => result.current.goToPrevPage());
    expect(result.current.page).toBe(1);
    act(() => result.current.setPage(10));
    expect(result.current.page).toBe(result.current.pageCount - 1);
  });
});

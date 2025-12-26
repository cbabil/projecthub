import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

import DataGrid from '../src/renderer/components/DataGrid.js';
import DataGridRow from '../src/renderer/components/DataGridRow.js';
import { Input } from 'ui-toolkit';

describe('Input component', () => {
  it('invokes onChange handler with new value', () => {
    const onChange = vi.fn();
    render(<Input value="abc" onChange={onChange} placeholder="Type" />);
    fireEvent.change(screen.getByPlaceholderText('Type'), { target: { value: 'hello' } });
    expect(onChange).toHaveBeenCalledWith('hello');
  });
});

describe('DataGridRow selection', () => {
  it('renders selection controls based on mode and toggles on click', () => {
    const onToggle = vi.fn();
    render(
      <DataGridRow
        row={{ name: 'Row' }}
        rowId="1"
        columns={[{ id: 'name', label: 'Name', accessor: (r) => r.name }]}
        selectionMode="single"
        isSelected={false}
        gridTemplateColumns="auto 1fr"
        onToggle={onToggle}
      />
    );
    fireEvent.click(screen.getByText('Row'));
    expect(onToggle).toHaveBeenCalled();
    expect(screen.getByRole('radio')).toBeInTheDocument();
  });
});

describe('DataGrid integration', () => {
  const columns = [
    { id: 'name', label: 'Name', accessor: (row: any) => row.name, sortable: true, sortValue: (row: any) => row.name }
  ];

  it('calls onRowClick when selectionMode is none', () => {
    const onRowClick = vi.fn();
    render(
      <DataGrid
        rows={[{ name: 'Alpha' }]}
        columns={columns}
        getRowId={(row) => row.name}
        selectionMode="none"
        onRowClick={onRowClick}
        enableSearch={false}
        enablePagination={false}
      />
    );
    fireEvent.click(screen.getByText('Alpha'));
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ name: 'Alpha' }));
  });

  it('shows filler rows to maintain height', () => {
    render(
      <DataGrid
        rows={[]}
        columns={columns}
        getRowId={(row) => row.name}
        selectionMode="multi"
        defaultSelectedRowIds={[]}
        onSelectionChange={() => undefined}
        enableSearch={false}
        enablePagination={false}
        pageSize={2}
        rowHeight={10}
      />
    );
    expect(screen.getByText('No results')).toBeInTheDocument();
  });

  it('tracks multi-selection when uncontrolled', async () => {
    const user = userEvent.setup();
    render(
      <DataGrid
        rows={[{ name: 'One' }, { name: 'Two' }]}
        columns={columns}
        getRowId={(row) => row.name}
        selectionMode="multi"
        enableSearch={false}
        enablePagination={false}
        pageSize={5}
      />
    );
    const firstRow = screen.getByText('One');
    await user.click(firstRow);
    expect(firstRow.closest('.grid-row')?.classList.contains('grid-row--selected')).toBe(true);
    await user.click(firstRow);
    expect(firstRow.closest('.grid-row')?.classList.contains('grid-row--selected')).toBe(false);
  });

  it('supports single selection mode', async () => {
    const user = userEvent.setup();
    const onSelectionChange = vi.fn();
    render(
      <DataGrid
        rows={[{ name: 'Solo' }]}
        columns={columns}
        getRowId={(row) => row.name}
        selectionMode="single"
        onSelectionChange={onSelectionChange}
        enableSearch={false}
        enablePagination={false}
      />
    );
    await user.click(screen.getByText('Solo'));
    expect(onSelectionChange).toHaveBeenCalledWith(['Solo']);
    await user.click(screen.getByText('Solo'));
    expect(onSelectionChange).toHaveBeenLastCalledWith([]);
  });
});

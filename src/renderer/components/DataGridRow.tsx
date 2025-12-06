import React from 'react';

import type { GridColumn, GridSelectionMode } from '../hooks/useDataGrid.js';

const SelectionCell: React.FC<{ mode: GridSelectionMode; checked: boolean; onChange: () => void }> = ({ mode, checked, onChange }) => {
  if (mode === 'none') return null;
  if (mode === 'multi') return <input type="checkbox" checked={checked} onChange={onChange} />;
  return <input type="radio" checked={checked} onChange={onChange} />;
};

interface DataGridRowProps<T> {
  row: T;
  rowId: string;
  columns: GridColumn<T>[];
  selectionMode: GridSelectionMode;
  isSelected: boolean;
  gridTemplateColumns: string;
  onToggle: () => void;
}

const DataGridRow = <T,>({ row, rowId, columns, selectionMode, isSelected, gridTemplateColumns, onToggle }: DataGridRowProps<T>) => (
  <div
    key={rowId}
    className={`grid-row gap-3 px-4 py-2 items-center cursor-pointer ${isSelected ? 'grid-row--selected text-white' : ''}`}
    style={{ display: 'grid', gridTemplateColumns }}
    onClick={onToggle}
  >
    {selectionMode === 'none' ? null : <SelectionCell mode={selectionMode} checked={isSelected} onChange={onToggle} />}
    {columns.map((col) => (
      <div key={col.id} className="text-sm whitespace-nowrap overflow-hidden text-ellipsis min-w-0">
        {col.accessor(row)}
      </div>
    ))}
  </div>
);

export default DataGridRow;

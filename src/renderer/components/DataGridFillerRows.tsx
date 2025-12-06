import React from 'react';

import type { GridColumn, GridSelectionMode } from '../hooks/useDataGrid.js';

interface Props<T> {
  count: number;
  columns: GridColumn<T>[];
  selectionMode: GridSelectionMode;
  gridTemplateColumns: string;
  rowHeight: number;
}

const DataGridFillerRows = <T,>({ count, columns, selectionMode, gridTemplateColumns, rowHeight }: Props<T>) => {
  if (count <= 0) return null;
  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`filler-${idx}`}
          className="grid-row opacity-0"
          style={{ display: 'grid', gridTemplateColumns, minHeight: rowHeight }}
          aria-hidden="true"
        >
          {selectionMode === 'none' ? null : <span />}
          {columns.map((col) => (
            <div key={col.id} />
          ))}
        </div>
      ))}
    </>
  );
};

export default DataGridFillerRows;

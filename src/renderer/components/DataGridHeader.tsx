import { ArrowUpDown } from 'lucide-react';
import React from 'react';

import type { GridColumn, SortDirection } from '../hooks/useDataGrid.js';

interface Props<T> {
  columns: GridColumn<T>[];
  selectionMode: 'none' | 'single' | 'multi';
  gridTemplateColumns: string;
  onToggleSort: (columnId: string) => void;
  renderSortIndicator: (columnId: string) => SortDirection | undefined;
}

const DataGridHeader = <T,>({ columns, selectionMode, gridTemplateColumns, onToggleSort, renderSortIndicator }: Props<T>) => (
  <div
    className="grid gap-3 px-4 py-2 text-xs uppercase tracking-wide text-brand-text-dark/70 border-b border-white/5"
    style={{ gridTemplateColumns }}
  >
    {selectionMode === 'none' ? null : <span></span>}
    {columns.map((col) => {
      const direction = renderSortIndicator(col.id);
      return (
        <button
          key={col.id}
          type="button"
          className={`flex items-center gap-2 whitespace-nowrap overflow-hidden ${
            col.headerAlign === 'right'
              ? 'justify-end text-right pr-2'
              : col.headerAlign === 'center'
                ? 'justify-center text-center'
                : 'text-left'
          } ${direction ? 'text-white' : ''}`}
          onClick={() => col.sortable && onToggleSort(col.id)}
          disabled={!col.sortable}
        >
          {col.sortable && <ArrowUpDown size={12} className="text-brand-text-dark/60" />}
          {col.label}
          {direction && <span className="text-[10px]">{direction === 'asc' ? '↑' : '↓'}</span>}
        </button>
      );
    })}
  </div>
);

export default DataGridHeader;

import React, { useMemo, useState } from 'react';

import type { SortDirection } from '../hooks/useDataGrid.js';
import { useDataGrid } from '../hooks/useDataGrid.js';
import type { DataGridProps } from './DataGrid.types.js';
import DataGridFillerRows from './DataGridFillerRows.js';
import DataGridHeader from './DataGridHeader.js';
import DataGridPagination from './DataGridPagination.js';
import DataGridRow from './DataGridRow.js';
import Search from './Search.js';

const DataGrid = <T,>({
  rows,
  columns,
  getRowId,
  selectionMode = 'none',
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  enableSearch = false,
  searchInsideCard = false,
  searchPlaceholder = 'Search',
  enablePagination = true,
  pageSize = 10,
  filterRows,
  rowHeight = 52,
  className,
  headerActions,
  footer,
  onRowClick,
  pageLabelFormatter,
  paginationLabels,
  fillContainer = false,
  searchPrefix
}: DataGridProps<T>) => {
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelectedRowIds ?? []);
  const selection = selectedRowIds ?? internalSelected;
  const setSelection = (next: string[]) => {
    if (!selectedRowIds) {
      setInternalSelected(next);
    }
    onSelectionChange?.(next);
  };

  const dataGrid = useDataGrid(rows, columns, { pageSize, filterRows, rowHeight });
  const { query, setQuery, page, pageCount, goToPrevPage, goToNextPage, visibleRows, toggleSort, sortState } = dataGrid;
  const fillerCount = enablePagination ? Math.max(0, pageSize - visibleRows.length) : 0;

  const gridTemplateColumns = useMemo(() => {
    const parts = columns.map((col) => col.width ?? 'minmax(0,1fr)');
    if (selectionMode !== 'none') {
      parts.unshift('auto');
    }
    return parts.join(' ');
  }, [columns, selectionMode]);

  const toggleRow = (row: T) => {
    const id = getRowId(row);
  if (selectionMode === 'none') {
    onRowClick?.(row);
    return;
  }
    if (selectionMode === 'single') {
      const next = selection.includes(id) ? [] : [id];
      setSelection(next);
    } else {
      const exists = selection.includes(id);
      const next = exists ? selection.filter((item) => item !== id) : [...selection, id];
      setSelection(next);
    }
  };

  const renderSortIndicator = (columnId: string): SortDirection | undefined => (sortState?.columnId === columnId ? sortState.direction : undefined);
  const rootClasses = fillContainer ? 'flex flex-col gap-3' : 'space-y-3';
  const rootClassName = className ? `${rootClasses} ${className}` : rootClasses;
  const bodyMinHeight = rowHeight * pageSize;
  const constrainedBodyMinHeight = `min(100%, ${bodyMinHeight}px)`;
  // When pagination is enabled, hide vertical scroll and rely on paging to keep height steady.
  // Otherwise allow vertical scroll if content exceeds available height.
  const bodyOverflowClass = enablePagination ? 'overflow-x-hidden overflow-y-hidden' : 'overflow-x-hidden overflow-y-auto';

  return (
    <div className={rootClassName} style={fillContainer ? { height: '100%' } : undefined}>
      {enableSearch && !searchInsideCard && (
        <div className="flex items-center gap-3 mb-3">
          {searchPrefix}
          <Search value={query} onChange={setQuery} placeholder={searchPlaceholder} className="flex-1" />
          {headerActions}
        </div>
      )}
      <div className={fillContainer ? 'flex-1 min-h-0 overflow-hidden' : 'overflow-hidden'}>
        <div
          className="flex flex-col w-full overflow-hidden"
          style={fillContainer ? { height: '100%', width: '100%' } : { width: '100%' }}
        >
          {enableSearch && searchInsideCard && (
            <div className="px-4 pt-4 flex items-center gap-3">
              {searchPrefix}
              <Search value={query} onChange={setQuery} placeholder={searchPlaceholder} className="flex-1" />
              {headerActions}
            </div>
          )}
          <DataGridHeader
            columns={columns}
            selectionMode={selectionMode}
            gridTemplateColumns={gridTemplateColumns}
            onToggleSort={toggleSort}
            renderSortIndicator={renderSortIndicator}
          />
          <div className={`flex-1 ${fillContainer ? bodyOverflowClass : 'overflow-x-hidden'}`} style={fillContainer ? { minHeight: constrainedBodyMinHeight } : undefined}>
            {visibleRows.map((row) => {
              const id = getRowId(row);
              const isSelected = selection.includes(id);
              return (
                <DataGridRow
                  key={id}
                  row={row}
                  rowId={id}
                  columns={columns}
                  selectionMode={selectionMode}
                  isSelected={isSelected}
                  gridTemplateColumns={gridTemplateColumns}
                  onToggle={() => toggleRow(row)}
                />
              );
            })}
            <DataGridFillerRows
              count={fillerCount}
              columns={columns}
              selectionMode={selectionMode}
              gridTemplateColumns={gridTemplateColumns}
              rowHeight={rowHeight}
            />
            {visibleRows.length === 0 && <div className="px-4 py-4 text-sm text-brand-text-dark/70">No results</div>}
          </div>
          {enablePagination && (
            <div className="border-t border-brand-divider/40 px-3 py-2">
              <DataGridPagination
                page={page}
                pageCount={pageCount}
                onPrev={goToPrevPage}
                onNext={goToNextPage}
                pageLabelFormatter={pageLabelFormatter}
                labels={paginationLabels}
              />
            </div>
          )}
        </div>
      </div>
      {footer}
    </div>
  );
};

export default DataGrid;

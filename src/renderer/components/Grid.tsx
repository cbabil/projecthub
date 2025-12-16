import { BaseMeta } from '@shared/types';
import { ArrowUpDown, LucideIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import type { GridColumn } from '../hooks/useDataGrid.js';
import DataGrid from './DataGrid.js';
import type { DataGridProps } from './DataGrid.types.js';
import EmptyState from './EmptyState.js';
import { buildDefaultColumns } from './GridColumns.js';

interface Props<T extends BaseMeta> {
  items: T[];
  onSelect?: (item: T) => void;
  loading?: boolean;
  searchPlaceholder?: string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyMessage?: string;
  searchInsideCard?: boolean;
  renderPrefix?: React.ReactNode;
  renderSuffix?: React.ReactNode;
  renderCategory?: (item: T) => string | undefined;
  pageSize?: number;
  enablePagination?: boolean;
  renderActions?: (item: T) => React.ReactNode;
  searchPrefix?: React.ReactNode;
  fillContainer?: boolean;
  columns?: GridColumn<T>[];
}

const Grid = <T extends BaseMeta>({
  items,
  onSelect,
  loading,
  searchPlaceholder,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  renderPrefix,
  renderSuffix,
  renderCategory,
  pageSize = 10,
  renderActions,
  searchPrefix,
  fillContainer = false,
  columns: overrideColumns,
  enablePagination = true,
  searchInsideCard = true
}: Props<T>) => {
  const columns = useMemo(
    () => (overrideColumns ? overrideColumns : buildDefaultColumns(renderCategory, renderActions)),
    [overrideColumns, renderActions, renderCategory]
  );

  const filterRows = (row: T, query: string) => {
    if (!query.trim()) return true;
    const lower = query.toLowerCase();
    const values = [row.name, row.description ?? '', row.version ?? '', row.lastEdited ?? '', renderCategory?.(row) ?? ''];
    return values.some((value) => value.toLowerCase().includes(lower));
  };

  const gridProps: DataGridProps<T> = {
    rows: items,
    columns,
    getRowId: (row) => `${row.name}-${row.lastEdited ?? ''}`,
    selectionMode: 'none',
    enableSearch: true,
    searchPlaceholder: searchPlaceholder ?? 'Search',
    searchPrefix,
    enablePagination,
    searchInsideCard,
    pageSize,
    filterRows,
    onRowClick: onSelect,
    className: searchInsideCard ? 'app-surface' : undefined,
    fillContainer
  };

  return (
    <div className={`flex flex-col ${fillContainer ? 'h-full gap-3' : 'space-y-3'}`}>
      {(renderPrefix || renderSuffix) && (
        <div className="flex items-center justify-between">
          <div>{renderPrefix}</div>
          <div>{renderSuffix}</div>
        </div>
      )}
      <div className="flex-1">
        {items.length ? (
          searchInsideCard ? (
            <DataGrid {...gridProps} />
          ) : (
            <div className="app-surface p-4">
              <DataGrid {...gridProps} />
            </div>
          )
        ) : (
          <div className="app-surface flex flex-col items-center justify-center h-full">
            <EmptyState
              icon={emptyIcon ?? ArrowUpDown}
              title={emptyTitle ?? 'No entries yet'}
              message={emptyMessage ?? 'Add content to see it listed'}
            />
          </div>
        )}
      </div>
      {loading && <span className="text-xs text-brand-text-dark/60">Loading…</span>}
    </div>
  );
};

export default Grid;

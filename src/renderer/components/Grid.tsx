import { BaseMeta } from '@shared/types';
import { ArrowUpDown, LucideIcon } from 'lucide-react';
import React, { useMemo } from 'react';

import type { GridColumn } from '../hooks/useDataGrid.js';
import { formatDate, truncate } from '../utils/text.js';
import DataGrid from './DataGrid.js';
import type { DataGridProps } from './DataGrid.types.js';
import EmptyState from './EmptyState.js';

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
  const columns = useMemo(() => {
    if (overrideColumns) return overrideColumns;
    const base: GridColumn<T>[] = [
      { id: 'name', label: 'Name', accessor: (row) => row.name, sortable: true, sortValue: (row) => row.name, width: 'minmax(180px, 1.4fr)' },
      {
        id: 'description',
        label: 'Description',
        accessor: (row) => truncate(row.description),
        sortable: true,
        sortValue: (row) => row.description,
        width: 'minmax(320px, 2.4fr)'
      },
      {
        id: 'category',
        label: 'Category',
        accessor: (row) => renderCategory?.(row) ?? '',
        sortable: true,
        sortValue: (row) => renderCategory?.(row) ?? '',
        width: 'minmax(160px, 1.2fr)'
      },
      {
        id: 'version',
        label: 'Version',
        accessor: (row) => (row as any).version ?? '—',
        sortable: true,
        sortValue: (row) => (row as any).version ?? '',
        width: 'minmax(90px, 0.9fr)'
      },
      {
        id: 'releasedOn',
        label: 'Released On',
        accessor: (row) => formatDate((row as any).releasedOn ?? row.lastEdited ?? (row as any).updatedAt),
        sortable: true,
        sortValue: (row) => (row as any).releasedOn ?? row.lastEdited ?? (row as any).updatedAt ?? '',
        width: 'minmax(180px, 1.2fr)'
      }
    ];
    if (!renderActions) return base;
    return [
      ...base,
      {
        id: 'actions',
        label: 'Actions',
        accessor: (row) => (
          <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
            {renderActions(row)}
          </div>
        ),
        width: '72px'
      }
    ];
  }, [overrideColumns, renderActions, renderCategory]);

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

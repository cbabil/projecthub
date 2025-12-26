import { BaseMeta } from '@shared/types';
import { ArrowUpDown, LucideIcon } from 'lucide-react';
import React, { ReactNode, useMemo } from 'react';
import { Table, type TableColumn } from 'ui-toolkit';

import { formatDate, truncate } from '../utils/text.js';
import EmptyState from './EmptyState.js';

interface Props<T extends BaseMeta> {
  items: T[];
  onSelect?: (item: T) => void;
  loading?: boolean;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyMessage?: string;
  renderPrefix?: React.ReactNode;
  renderSuffix?: React.ReactNode;
  renderCategory?: (item: T) => string | undefined;
  pageSize?: number;
  renderActions?: (item: T) => React.ReactNode;
  fillContainer?: boolean;
  columns?: TableColumn[];
  /** Custom row mapper for complex transformations */
  rowMapper?: (item: T, index: number) => Record<string, ReactNode>;
}

const Grid = <T extends BaseMeta>({
  items,
  onSelect,
  loading,
  emptyIcon,
  emptyTitle,
  emptyMessage,
  renderPrefix,
  renderSuffix,
  renderCategory,
  pageSize = 10,
  renderActions,
  fillContainer = false,
  columns: overrideColumns,
  rowMapper
}: Props<T>) => {
  // Build default columns if not overridden
  const columns: TableColumn[] = useMemo(() => {
    if (overrideColumns) return overrideColumns;
    const base: TableColumn[] = [
      { label: 'Name', value: 'name', sortable: true, width: '180px' },
      { label: 'Description', value: 'description', sortable: true, width: '1fr' },
      { label: 'Category', value: 'category', sortable: true, width: '160px' },
      { label: 'Version', value: 'version', sortable: true, width: '90px' },
      { label: 'Released On', value: 'releasedOn', sortable: true, width: '180px' }
    ];
    if (renderActions) {
      base.push({ label: 'Actions', value: 'actions', sortable: false, width: '100px' });
    }
    return base;
  }, [overrideColumns, renderActions]);

  // Transform items to plain row objects for Table
  const rows = useMemo(() => {
    return items.map((item, idx) => {
      // Use custom rowMapper if provided
      if (rowMapper) {
        const row = rowMapper(item, idx);
        row.__index = idx;
        return row;
      }

      // Default transformation
      const row: Record<string, React.ReactNode> = {
        __index: idx,
        name: item.name,
        description: truncate(item.description ?? ''),
        category: renderCategory?.(item) ?? '',
        version: item.version ?? '—',
        releasedOn: formatDate(item.lastEdited)
      };
      if (renderActions) {
        row.actions = (
          <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
            {renderActions(item)}
          </div>
        );
      }
      return row;
    });
  }, [items, renderCategory, renderActions, rowMapper]);

  // Handle row click - map back to original item
  const handleRowClick = onSelect
    ? (row: Record<string, React.ReactNode>) => {
        const idx = row.__index as number;
        if (idx !== undefined && items[idx]) {
          onSelect(items[idx]);
        }
      }
    : undefined;

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
          <Table
            columns={columns}
            rows={rows}
            globalSearch
            showColumnControls
            pageSize={pageSize}
            sortable
            onRowClick={handleRowClick}
            className="app-surface"
          />
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

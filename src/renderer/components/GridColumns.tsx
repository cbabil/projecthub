import { BaseMeta } from '@shared/types';
import React from 'react';

import type { GridColumn } from '../hooks/useDataGrid.js';
import { formatDate, truncate } from '../utils/text.js';

/** Extended row type with optional date fields for Grid display */
interface ExtendedRowData {
  releasedOn?: string;
  updatedAt?: string;
}

/** Build default columns for Grid component */
export function buildDefaultColumns<T extends BaseMeta>(
  renderCategory?: (item: T) => string | undefined,
  renderActions?: (item: T) => React.ReactNode
): GridColumn<T>[] {
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
    { id: 'version', label: 'Version', accessor: (row) => row.version ?? '—', sortable: true, sortValue: (row) => row.version ?? '', width: 'minmax(90px, 0.9fr)' },
    {
      id: 'releasedOn',
      label: 'Released On',
      accessor: (row) => {
        const ext = row as T & ExtendedRowData;
        return formatDate(ext.releasedOn ?? row.lastEdited ?? ext.updatedAt);
      },
      sortable: true,
      sortValue: (row) => {
        const ext = row as T & ExtendedRowData;
        return ext.releasedOn ?? row.lastEdited ?? ext.updatedAt ?? '';
      },
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
}

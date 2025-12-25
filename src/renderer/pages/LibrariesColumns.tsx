import { LibraryMeta } from '@shared/types';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React from 'react';

import type { GridColumn } from '../hooks/useDataGrid.js';
import { formatDate, truncate } from '../utils/text.js';

interface ActionHandlers {
  onView: (row: LibraryMeta) => void;
  onEdit: (row: LibraryMeta) => void;
  onDelete: (row: LibraryMeta) => void;
}

/** Build columns for Libraries page grid */
export const buildLibrariesColumns = (handlers: ActionHandlers): GridColumn<LibraryMeta>[] => [
  { id: 'name', label: 'Name', accessor: (row) => row.name, sortable: true, sortValue: (row) => row.name, width: '160px' },
  {
    id: 'description',
    label: 'Description',
    accessor: (row) => truncate(row.description ?? ''),
    sortable: true,
    sortValue: (row) => row.description ?? '',
    width: '220px'
  },
  {
    id: 'category',
    label: 'Category',
    accessor: (row) => row.category ?? 'library',
    sortable: true,
    sortValue: (row) => row.category ?? '',
    width: '120px'
  },
  { id: 'version', label: 'Version', accessor: (row) => row.version ?? '-', sortable: true, sortValue: (row) => row.version ?? '', width: '90px' },
  {
    id: 'lastEdited',
    label: 'Last Edited',
    accessor: (row) => formatDate(row.lastEdited),
    sortable: true,
    sortValue: (row) => row.lastEdited ?? '',
    width: '140px'
  },
  {
    id: 'actions',
    label: 'Actions',
    headerAlign: 'center',
    accessor: (row) => (
      <div className="flex justify-center gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
        <button className="p-1 text-brand-text-dark hover:text-brand-accent-boost" onClick={() => handlers.onView(row)} aria-label="View library">
          <Eye size={16} />
        </button>
        <button
          className={`p-1 ${row.editable ? 'text-brand-text-dark hover:text-brand-accent-primary' : 'text-brand-divider/70 cursor-default'}`}
          onClick={() => handlers.onEdit(row)}
          aria-label="Edit library"
          disabled={!row.editable}
        >
          <Pencil size={16} />
        </button>
        <button className="p-1 text-brand-text-dark hover:text-brand-accent-red" onClick={() => handlers.onDelete(row)} aria-label="Delete library">
          <Trash2 size={16} />
        </button>
      </div>
    ),
    width: '118px'
  }
];

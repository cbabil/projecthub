import { LibraryMeta } from '@shared/types';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { ReactNode } from 'react';
import type { TableColumn } from 'ui-toolkit';

import { formatDate, truncate } from '../utils/text.js';

interface ActionHandlers {
  onView: (row: LibraryMeta) => void;
  onEdit: (row: LibraryMeta) => void;
  onDelete: (row: LibraryMeta) => void;
}

/** Column definitions for Libraries page grid */
export const librariesColumns: TableColumn[] = [
  { label: 'Name', value: 'name', sortable: true, width: '140px' },
  { label: 'Description', value: 'description', sortable: true, width: '1fr' },
  { label: 'Category', value: 'category', sortable: true, width: '110px' },
  { label: 'Version', value: 'version', sortable: true, width: '80px' },
  { label: 'Last Edited', value: 'lastEdited', sortable: true, width: '130px' },
  { label: 'Actions', value: 'actions', sortable: false, width: '100px' }
];

/** Build row mapper for Libraries page grid */
export const buildLibrariesRowMapper = (handlers: ActionHandlers) => {
  return (library: LibraryMeta): Record<string, ReactNode> => ({
    name: library.name,
    description: truncate(library.description ?? ''),
    category: library.category ?? 'library',
    version: library.version ?? '—',
    lastEdited: formatDate(library.lastEdited),
    actions: (
      <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="p-1 text-brand-text-dark hover:text-brand-accent-boost" onClick={() => handlers.onView(library)} aria-label="View library">
          <Eye size={16} />
        </button>
        <button
          className={`p-1 ${library.editable ? 'text-brand-text-dark hover:text-brand-accent-primary' : 'text-brand-divider/70 cursor-default'}`}
          onClick={() => handlers.onEdit(library)}
          aria-label="Edit library"
          disabled={!library.editable}
        >
          <Pencil size={16} />
        </button>
        <button className="p-1 text-brand-text-dark hover:text-brand-accent-red" onClick={() => handlers.onDelete(library)} aria-label="Delete library">
          <Trash2 size={16} />
        </button>
      </div>
    )
  });
};

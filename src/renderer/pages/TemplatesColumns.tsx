import { TemplateMeta } from '@shared/types';
import { Eye, Pencil, Trash2 } from 'lucide-react';
import React, { ReactNode } from 'react';
import type { TableColumn } from 'ui-toolkit';

import { formatDate, truncate } from '../utils/text.js';

interface ActionHandlers {
  onView: (row: TemplateMeta) => void;
  onEdit: (row: TemplateMeta) => void;
  onDelete: (row: TemplateMeta) => void;
}

/** Column definitions for Templates page grid */
export const templatesColumns: TableColumn[] = [
  { label: 'Name', value: 'name', sortable: true, width: '140px' },
  { label: 'Description', value: 'description', sortable: true, width: '1fr' },
  { label: 'Category', value: 'category', sortable: true, width: '110px' },
  { label: 'Version', value: 'version', sortable: true, width: '80px' },
  { label: 'Last Edited', value: 'lastEdited', sortable: true, width: '130px' },
  { label: 'Actions', value: 'actions', sortable: false, width: '100px' }
];

/** Build row mapper for Templates page grid */
export const buildTemplatesRowMapper = (handlers: ActionHandlers) => {
  return (template: TemplateMeta): Record<string, ReactNode> => ({
    name: template.name,
    description: truncate(template.description ?? ''),
    category: template.category ?? 'templates',
    version: template.version ?? '—',
    lastEdited: formatDate(template.lastEdited),
    actions: (
      <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button className="p-1 text-brand-text-dark hover:text-brand-accent-boost" onClick={() => handlers.onView(template)} aria-label="View template">
          <Eye size={16} />
        </button>
        <button
          className={`p-1 ${template.editable ? 'text-brand-text-dark hover:text-brand-accent-primary' : 'text-brand-divider/70 cursor-default'}`}
          onClick={() => handlers.onEdit(template)}
          aria-label="Edit template"
          disabled={!template.editable}
        >
          <Pencil size={16} />
        </button>
        <button className="p-1 text-brand-text-dark hover:text-brand-accent-red" onClick={() => handlers.onDelete(template)} aria-label="Delete template">
          <Trash2 size={16} />
        </button>
      </div>
    )
  });
};

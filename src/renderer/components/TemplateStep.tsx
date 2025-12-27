import { FileJson } from 'lucide-react';
import React from 'react';
import { DataGrid, type DataGridProps, EmptyState } from 'ui-toolkit';

import { TEMPLATES_PER_PAGE } from '../hooks/useTemplateSelection.js';

export type TemplateStepLabels = {
  name: string;
  description: string;
  emptyTitle: string;
  emptyMessage: string;
  searchPlaceholder: string;
  pageLabel: string;
  prev: string;
  next: string;
};

type Template = { id?: string; name: string; description?: string };

type TemplateStepProps = {
  templates: Template[];
  selected: string[];
  onSelectionChange: (ids: string[]) => void;
  errorText: string;
  showError: boolean;
  labels: TemplateStepLabels;
};

const TemplateStep: React.FC<TemplateStepProps> = ({ templates, selected, onSelectionChange, errorText, showError, labels }) => {
  const columns: DataGridProps<Template>['columns'] = [
    {
      id: 'name',
      label: labels.name,
      accessor: (row) => <span className="text-sm font-normal text-white">{row.name}</span>,
      sortable: true,
      sortValue: (row) => row.name,
      width: 'minmax(160px, 0.45fr)'
    },
    {
      id: 'description',
      label: labels.description,
      accessor: (row) => (
        <span className="text-sm font-normal text-white/80 line-clamp-2">{row.description || labels.description}</span>
      ),
      sortable: true,
      sortValue: (row) => row.description ?? '',
      width: 'minmax(0, 1fr)'
    }
  ];

  const pageLabelFormatter = ({ page, pageCount }: { page: number; pageCount: number }) =>
    labels.pageLabel.replace('{current}', String(page)).replace('{total}', String(pageCount));

  return (
    <div className="flex flex-col h-full">
      {templates.length ? (
        <div className="flex-1 min-h-0">
          <DataGrid
            rows={templates}
            columns={columns}
            getRowId={(tpl) => tpl.id ?? tpl.name}
            selectionMode="multi"
            selectedRowIds={selected}
            onSelectionChange={onSelectionChange}
            enableSearch
            searchPlaceholder={labels.searchPlaceholder}
            enablePagination
            pageSize={TEMPLATES_PER_PAGE}
            filterRows={(tpl, query) =>
              [tpl.name, tpl.description ?? ''].some((field) => field.toLowerCase().includes(query.toLowerCase()))
            }
            rowHeight={48}
            pageLabelFormatter={pageLabelFormatter}
            paginationLabels={{ prev: labels.prev, next: labels.next }}
            fillContainer
            className="h-full"
          />
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <EmptyState icon={FileJson} title={labels.emptyTitle} message={labels.emptyMessage} />
        </div>
      )}
      {showError && <p className="text-xs text-brand-accent-red">{errorText}</p>}
    </div>
  );
};

export default TemplateStep;

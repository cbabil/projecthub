/* eslint-disable max-lines */
import { TemplateMeta } from '@shared/types';
import { Eye, FileJson, Pencil, Trash2 } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import YAML from 'yaml';

import Button from '../components/Button.js';
import EditorModal from '../components/EditorModal.js';
import Grid from '../components/Grid.js';
import { useData } from '../context/DataContext.js';
import { useTranslation } from '../context/TranslationContext.js';
import type { GridColumn } from '../hooks/useDataGrid.js';
import { formatDate, truncate } from '../utils/text.js';

const Templates: React.FC = () => {
  const { filteredTemplates, loading } = useData();
  const { refreshAll } = useData();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<TemplateMeta | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  // Trigger one cache read when Templates is opened
  const didTemplatesClickLoad = React.useRef(false);
  React.useEffect(() => {
    if (didTemplatesClickLoad.current) return;
    didTemplatesClickLoad.current = true;
    refreshAll('renderer:templatesClick');
  }, [refreshAll]);

  // Removed page-mount refresh to avoid double cache reads; initial load handled by DataContext

  const handleSelect = React.useCallback(async (template: TemplateMeta) => {
    const content = await loadTemplateContent(template);
    setModalValue(content);
    setMode('view');
    setSelected(template);
  }, []);

  const handleClose = () => {
    setSelected(null);
    setMode('view');
  };

  const handleEdit = React.useCallback(async (template: TemplateMeta) => {
    if (!template.editable) {
      window.alert('This template is read-only.');
      return;
    }
    const content = await loadTemplateContent(template);
    setModalValue(content);
    setMode('edit');
    setSelected(template);
  }, []);

  const handleDelete = React.useCallback(async (template: TemplateMeta) => {
    if (!template.sourcePath) {
      window.alert('Template path unknown; cannot delete.');
      return;
    }
    const confirm = window.confirm(
      `Delete template “${template.name}”? This removes only the template from its pack; the pack itself stays installed.`
    );
    if (!confirm) return;
    const res = await window.projecthub.deleteTemplate(template.sourcePath);
    if (!res.ok) {
      window.alert(res.error ?? 'Failed to delete template');
    }
  }, []);

  const [modalValue, setModalValue] = useState<string>('');

  const loadTemplateContent = async (template: TemplateMeta) => {
    if (!template.sourcePath) return '';
    const res = await window.projecthub.readTemplate(template.sourcePath);
    if (res.ok && res.data) return res.data;
    // fallback to yaml dump of known data
    return YAML.stringify(template);
  };

  const columns = useMemo<GridColumn<TemplateMeta>[]>(
    () => [
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
        accessor: (row) => row.category ?? 'templates',
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
            <button
              className="p-1 text-brand-text-dark hover:text-brand-accent-boost"
              onClick={() => handleSelect(row)}
              aria-label="View template"
            >
              <Eye size={16} />
            </button>
            <button
              className={`p-1 ${row.editable ? 'text-brand-text-dark hover:text-brand-accent-primary' : 'text-brand-divider/70 cursor-default'}`}
              onClick={() => handleEdit(row)}
              aria-label="Edit template"
              disabled={!row.editable}
            >
              <Pencil size={16} />
            </button>
            <button
              className="p-1 text-brand-text-dark hover:text-brand-accent-red"
              onClick={() => handleDelete(row)}
              aria-label="Delete template"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
        width: '118px'
      }
    ],
    [handleDelete, handleEdit, handleSelect]
  );

  return (
    <div className="min-h-full flex flex-col space-y-4 flex-1">
      <Grid
        items={filteredTemplates}
        onSelect={handleSelect}
        loading={loading}
        searchPlaceholder={t('templatesSearchPlaceholder')}
        emptyIcon={FileJson}
        emptyTitle={t('templatesEmptyTitle')}
        emptyMessage={t('templatesEmptyMessage')}
        renderPrefix={<h2 className="text-lg font-semibold">{t('templatesTitle')}</h2>}
        renderSuffix={<Button>{t('templatesNewButton')}</Button>}
        renderCategory={(item) => (item as TemplateMeta).category || 'templates'}
        pageSize={10}
        columns={columns}
        fillContainer
      />
      {selected && (
        <EditorModal
          open={!!selected}
          onClose={handleClose}
          title={selected.name}
          value={modalValue}
          editable={mode === 'edit' && selected.editable}
          onSave={async (content) => {
            if (!selected?.sourcePath) return;
            const res = await window.projecthub.updateTemplate({ templatePath: selected.sourcePath, content });
            if (!res.ok) {
              window.alert(res.error ?? 'Failed to save template');
              return;
            }
            await refreshAll();
          }}
          languageLabel="YAML"
        />
      )}
    </div>
  );
};

export default Templates;

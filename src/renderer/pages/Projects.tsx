import { ProjectMeta } from '@shared/types';
import { Folder, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import Grid from '../components/Grid.js';
import Modal from '../components/Modal.js';
import ProjectsWizard from '../components/ProjectsWizard.js';
import { useData } from '../context/DataContext.js';
import { useToast } from '../context/ToastContext.js';
import { useTranslation } from '../context/TranslationContext.js';
import type { GridColumn } from '../hooks/useDataGrid.js';
import { safeIpcVoid } from '../utils/ipc.js';
import { formatDate } from '../utils/text.js';

const Projects: React.FC = () => {
  const { projects, loading, refreshAll } = useData();
  const { t } = useTranslation();
  const toast = useToast();
  const [wizardOpen, setWizardOpen] = useState(false);

  React.useEffect(() => {
    refreshAll('renderer:projectsPage');
  }, [refreshAll]);

  const resolveProjectFile = (project: ProjectMeta) =>
    project.sourcePath ?? `${project.name.replace(/\s+/g, '_').toLowerCase()}/metadata.yaml`;

  const handleDelete = async (project: ProjectMeta) => {
    const success = await safeIpcVoid(
      () => window.projecthub.deleteProject({ relativePath: resolveProjectFile(project), folderPath: project.path }),
      { toast, errorPrefix: 'Failed to delete project', showSuccess: true, successMessage: 'Project deleted successfully' }
    );
    if (success) await refreshAll();
  };

  const columns: GridColumn<ProjectMeta>[] = [
    { id: 'name', label: 'Name', accessor: (row) => row.name, sortable: true, sortValue: (row) => row.name, width: '160px' },
    {
      id: 'description',
      label: 'Description',
      accessor: (row) => <span className="whitespace-nowrap overflow-hidden text-ellipsis block max-w-[320px]">{row.description ?? '—'}</span>,
      sortable: true,
      sortValue: (row) => row.description ?? '',
      width: '320px'
    },
    {
      id: 'category',
      label: 'Category',
      accessor: (row) => {
        const templates = Array.isArray(row.templateUsed) ? row.templateUsed : row.templateUsed ? [row.templateUsed] : [];
        return templates.length ? templates[0] : '—';
      },
      sortable: true,
      sortValue: (row) => {
        const templates = Array.isArray(row.templateUsed) ? row.templateUsed : row.templateUsed ? [row.templateUsed] : [];
        return templates[0] ?? '';
      },
      width: '120px'
    },
    {
      id: 'version',
      label: 'Version',
      accessor: (row) => <span className="flex justify-center">{row.version ?? '—'}</span>,
      sortable: true,
      sortValue: (row) => row.version ?? '',
      width: '90px'
    },
    {
      id: 'releasedOn',
      label: 'Released On',
      accessor: (row) => formatDate(row.lastEdited ?? row.updatedAt),
      sortable: true,
      sortValue: (row) => row.lastEdited ?? row.updatedAt ?? '',
      width: '140px'
    },
    {
      id: 'actions',
      label: 'Actions',
      accessor: (row) => (
        <div className="flex justify-center gap-2 pr-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1 text-brand-text-dark hover:text-brand-accent-red"
            onClick={() => handleDelete(row)}
            aria-label="Delete project"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
      headerAlign: 'center',
      // match templates actions column (no fixed width)
    }
  ];

  return (
    <div className="min-h-full flex flex-col space-y-4 flex-1">
      <Grid<ProjectMeta>
        items={projects}
        loading={loading}
        searchPlaceholder={t('projectsSearchPlaceholder')}
        emptyIcon={Folder}
        emptyTitle={t('projectsEmptyTitle')}
        emptyMessage={t('projectsEmptyMessage')}
        renderPrefix={<h2 className="text-lg font-semibold">{t('projectsTitle')}</h2>}
        renderSuffix={<button className="button-primary text-sm" onClick={() => setWizardOpen(true)}>{t('projectsNewButton')}</button>}
        columns={columns}
        pageSize={10}
        fillContainer
      />
      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title={t('projectsNewButton')}>
        <ProjectsWizard onClose={() => setWizardOpen(false)} onCreated={refreshAll} />
      </Modal>
    </div>
  );
};

export default Projects;

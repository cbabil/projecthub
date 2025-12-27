import { ProjectMeta } from '@shared/types';
import { Folder, Trash2 } from 'lucide-react';
import React, { ReactNode, useMemo,useState } from 'react';
import { Button, Modal, type TableColumn,Typography } from 'ui-toolkit';
import { useToast } from 'ui-toolkit';

import Grid from '../components/Grid.js';
import ProjectsWizard from '../components/ProjectsWizard.js';
import { useData } from '../context/DataContext.js';
import { useTranslation } from '../context/TranslationContext.js';
import { safeIpcVoid } from '../utils/ipc.js';
import { formatDate, truncate } from '../utils/text.js';

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

  const columns: TableColumn[] = useMemo(() => [
    { label: 'Name', value: 'name', sortable: true, width: '160px' },
    { label: 'Description', value: 'description', sortable: true, width: '1fr' },
    { label: 'Category', value: 'category', sortable: true, width: '120px' },
    { label: 'Version', value: 'version', sortable: true, width: '90px' },
    { label: 'Released On', value: 'releasedOn', sortable: true, width: '140px' },
    { label: 'Actions', value: 'actions', sortable: false, width: '80px' }
  ], []);

  const rowMapper = useMemo(() => {
    return (project: ProjectMeta): Record<string, ReactNode> => {
      const templates = Array.isArray(project.templateUsed) ? project.templateUsed : project.templateUsed ? [project.templateUsed] : [];
      return {
        name: project.name,
        description: truncate(project.description ?? ''),
        category: templates.length ? templates[0] : '—',
        version: project.version ?? '—',
        releasedOn: formatDate(project.lastEdited ?? project.updatedAt),
        actions: (
          <div className="flex justify-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              className="p-1 text-brand-text-dark hover:text-brand-accent-red"
              onClick={() => handleDelete(project)}
              aria-label="Delete project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )
      };
    };
  }, []);

  return (
    <div className="min-h-full flex flex-col space-y-4 flex-1">
      <Grid<ProjectMeta>
        items={projects}
        loading={loading}
        emptyIcon={Folder}
        emptyTitle={t('projectsEmptyTitle')}
        emptyMessage={t('projectsEmptyMessage')}
        renderPrefix={<Typography variant="title">{t('projectsTitle')}</Typography>}
        renderSuffix={<Button size="sm" onClick={() => setWizardOpen(true)}>{t('projectsNewButton')}</Button>}
        columns={columns}
        rowMapper={rowMapper}
        pageSize={10}
        fillContainer
      />
      <Modal open={wizardOpen} onClose={() => setWizardOpen(false)} title={t('projectsNewButton')} size="lg">
        <ProjectsWizard onClose={() => setWizardOpen(false)} onCreated={refreshAll} />
      </Modal>
    </div>
  );
};

export default Projects;

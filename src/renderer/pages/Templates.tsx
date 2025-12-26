import { TemplateMeta } from '@shared/types';
import { FileJson, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import YAML from 'yaml';

import AIChat from '../components/ai/AIChat.js';
import AISetupWizard from '../components/ai/AISetupWizard.js';
import EditorModal from '../components/EditorModal.js';
import Grid from '../components/Grid.js';
import { useAI } from '../context/AIContext.js';
import { useData } from '../context/DataContext.js';
import { useToast } from '../context/ToastContext.js';
import { useTranslation } from '../context/TranslationContext.js';
import { safeIpc, safeIpcVoid } from '../utils/ipc.js';
import { buildTemplatesRowMapper,templatesColumns } from './TemplatesColumns.js';

const Templates: React.FC = () => {
  const { filteredTemplates, loading } = useData();
  const { refreshAll } = useData();
  const { t } = useTranslation();
  const toast = useToast();
  const { isConfigured } = useAI();
  const [selected, setSelected] = useState<TemplateMeta | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAISetup, setShowAISetup] = useState(false);

  const handleAIClick = () => {
    if (isConfigured) {
      setShowAIChat(true);
    } else {
      setShowAISetup(true);
    }
  };

  // Trigger one cache read when Templates is opened
  const didTemplatesClickLoad = React.useRef(false);
  React.useEffect(() => {
    if (didTemplatesClickLoad.current) return;
    didTemplatesClickLoad.current = true;
    refreshAll('renderer:templatesClick');
  }, [refreshAll]);

  // Removed page-mount refresh to avoid double cache reads; initial load handled by DataContext

  const [modalValue, setModalValue] = useState<string>('');

  const loadTemplateContent = React.useCallback(async (template: TemplateMeta) => {
    if (!template.sourcePath) return '';
    const content = await safeIpc(() => window.projecthub.readTemplate(template.sourcePath!), {
      toast,
      errorPrefix: 'Failed to load template',
      showError: false // silently fall back
    });
    return content ?? YAML.stringify(template);
  }, [toast]);

  const handleSelect = React.useCallback(async (template: TemplateMeta) => {
    const content = await loadTemplateContent(template);
    setModalValue(content);
    setMode('view');
    setSelected(template);
  }, [loadTemplateContent]);

  const handleClose = () => {
    setSelected(null);
    setMode('view');
  };

  const handleEdit = React.useCallback(async (template: TemplateMeta) => {
    if (!template.editable) {
      toast('This template is read-only.', 'warning');
      return;
    }
    const content = await loadTemplateContent(template);
    setModalValue(content);
    setMode('edit');
    setSelected(template);
  }, [toast, loadTemplateContent]);

  const handleDelete = React.useCallback(async (template: TemplateMeta) => {
    if (!template.sourcePath) {
      toast('Template path unknown; cannot delete.', 'error');
      return;
    }
    const confirm = window.confirm(
      `Delete template "${template.name}"? This removes only the template from its pack; the pack itself stays installed.`
    );
    if (!confirm) return;
    await safeIpcVoid(() => window.projecthub.deleteTemplate(template.sourcePath!), {
      toast,
      errorPrefix: 'Failed to delete template'
    });
  }, [toast]);

  const rowMapper = useMemo(
    () => buildTemplatesRowMapper({ onView: handleSelect, onEdit: handleEdit, onDelete: handleDelete }),
    [handleDelete, handleEdit, handleSelect]
  );

  return (
    <div className="min-h-full flex flex-col space-y-4 flex-1">
      <Grid<TemplateMeta>
        items={filteredTemplates}
        onSelect={handleSelect}
        loading={loading}
        emptyIcon={FileJson}
        emptyTitle={t('templatesEmptyTitle')}
        emptyMessage={t('templatesEmptyMessage')}
        renderPrefix={<h2 className="text-lg font-semibold">{t('templatesTitle')}</h2>}
        renderSuffix={
          <button onClick={handleAIClick} className="button-primary flex items-center gap-2 text-sm">
            <Sparkles size={16} />
            Generate with AI
          </button>
        }
        columns={templatesColumns}
        rowMapper={rowMapper}
        pageSize={10}
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
            const success = await safeIpcVoid(
              () => window.projecthub.updateTemplate({ templatePath: selected.sourcePath!, content }),
              { toast, errorPrefix: 'Failed to save template', showSuccess: true, successMessage: 'Template saved successfully' }
            );
            if (success) await refreshAll();
          }}
          languageLabel="YAML"
        />
      )}
      {showAISetup && (
        <AISetupWizard
          onClose={() => setShowAISetup(false)}
          onSuccess={() => {
            setShowAISetup(false);
            setShowAIChat(true);
          }}
        />
      )}
      {showAIChat && (
        <AIChat
          onClose={() => setShowAIChat(false)}
          onSaveTemplate={() => {}}
          onCreateProject={() => {}}
        />
      )}
    </div>
  );
};

export default Templates;

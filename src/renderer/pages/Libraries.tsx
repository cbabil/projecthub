import { LibraryMeta } from '@shared/types';
import { Library, Sparkles } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Button } from 'ui-toolkit';
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
import { buildLibrariesColumns } from './LibrariesColumns.js';

const Libraries: React.FC = () => {
  const { libraries, loading, refreshAll } = useData();
  const { t } = useTranslation();
  const toast = useToast();
  const { isConfigured } = useAI();
  const [selected, setSelected] = useState<LibraryMeta | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [modalValue, setModalValue] = useState<string>('');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showAISetup, setShowAISetup] = useState(false);

  const handleAIClick = () => {
    if (isConfigured) {
      setShowAIChat(true);
    } else {
      setShowAISetup(true);
    }
  };

  // Trigger one cache read when Libraries is opened
  const didLibrariesClickLoad = React.useRef(false);
  React.useEffect(() => {
    if (didLibrariesClickLoad.current) return;
    didLibrariesClickLoad.current = true;
    refreshAll('renderer:librariesClick');
  }, [refreshAll]);

  const loadLibraryContent = React.useCallback(async (library: LibraryMeta) => {
    if (!library.sourcePath) return '';
    const content = await safeIpc(() => window.projecthub.readLibrary(library.sourcePath!), {
      toast,
      errorPrefix: 'Failed to load library',
      showError: false
    });
    return content ?? YAML.stringify(library);
  }, [toast]);

  const handleSelect = React.useCallback(async (library: LibraryMeta) => {
    const content = await loadLibraryContent(library);
    setModalValue(content);
    setMode('view');
    setSelected(library);
  }, [loadLibraryContent]);

  const handleClose = () => {
    setSelected(null);
    setMode('view');
  };

  const handleEdit = React.useCallback(async (library: LibraryMeta) => {
    if (!library.editable) {
      toast('This library is read-only.', 'warning');
      return;
    }
    const content = await loadLibraryContent(library);
    setModalValue(content);
    setMode('edit');
    setSelected(library);
  }, [toast, loadLibraryContent]);

  const handleDelete = React.useCallback(async (library: LibraryMeta) => {
    if (!library.sourcePath) {
      toast('Library path unknown; cannot delete.', 'error');
      return;
    }
    const confirm = window.confirm(
      `Delete library "${library.name}"? This removes only the library from its pack; the pack itself stays installed.`
    );
    if (!confirm) return;
    await safeIpcVoid(() => window.projecthub.deleteLibrary(library.sourcePath!), {
      toast,
      errorPrefix: 'Failed to delete library'
    });
  }, [toast]);

  const columns = useMemo(
    () => buildLibrariesColumns({ onView: handleSelect, onEdit: handleEdit, onDelete: handleDelete }),
    [handleDelete, handleEdit, handleSelect]
  );

  return (
    <div className="min-h-full flex flex-col space-y-4 flex-1">
      <Grid
        items={libraries}
        onSelect={handleSelect}
        loading={loading}
        searchPlaceholder={t('librariesSearchPlaceholder')}
        emptyIcon={Library}
        emptyTitle={t('librariesEmptyTitle')}
        emptyMessage={t('librariesEmptyMessage')}
        renderPrefix={<h2 className="text-lg font-semibold">{t('librariesTitle')}</h2>}
        renderSuffix={
          <Button size="sm" onClick={handleAIClick}>
            <Sparkles size={16} />
            Generate with AI
          </Button>
        }
        renderCategory={(item) => (item as LibraryMeta).category || 'library'}
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
            const success = await safeIpcVoid(
              () => window.projecthub.updateLibrary({ libraryPath: selected.sourcePath!, content }),
              { toast, errorPrefix: 'Failed to save library', showSuccess: true, successMessage: 'Library saved successfully' }
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

export default Libraries;

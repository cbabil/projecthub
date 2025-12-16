import { LibraryMeta } from '@shared/types';
import { Library } from 'lucide-react';
import React from 'react';

import Button from '../components/Button.js';
import Grid from '../components/Grid.js';
import { useData } from '../context/DataContext.js';
import { useTranslation } from '../context/TranslationContext.js';

const Libraries: React.FC = () => {
  const { libraries, loading } = useData();
  const { t } = useTranslation();
  // TODO: Implement library selection handler
  const handleSelect = (_lib: LibraryMeta) => void _lib;

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
        renderSuffix={<Button>{t('librariesNewButton')}</Button>}
        renderCategory={(item) => (item as unknown as { category?: string }).category || 'libraries'}
        pageSize={10}
        fillContainer
      />
    </div>
  );
};

export default Libraries;

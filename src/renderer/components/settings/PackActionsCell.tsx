import { Download, Loader2, Trash2 } from 'lucide-react';
import React from 'react';

import type { PackRow } from '../../hooks/usePacksList.js';

interface Props {
  pack: PackRow;
  refreshing: boolean;
  installingId?: string;
  removingId?: string;
  onInstall: (pack: PackRow) => void;
  onRemove: (pack: PackRow) => void;
}

const PackActionsCell: React.FC<Props> = ({ pack, refreshing, installingId, removingId, onInstall, onRemove }) => {
  const isInstalling = installingId === pack.name;
  const isRemoving = removingId === pack.name;
  const isInstalled = pack.status === 'installed';

  return (
    <div className="flex justify-center gap-1" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className="text-brand-text-dark/70 hover:text-emerald-500 cursor-pointer"
        aria-label={`Import ${pack.name}`}
        onClick={() => onInstall(pack)}
        disabled={refreshing || isInstalling}
      >
        {isInstalling ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
      </button>
      <button
        type="button"
        className={isInstalled ? 'hover:text-brand-accent-red cursor-pointer' : 'text-brand-text-dark/50 hover:text-brand-text-dark/60 cursor-default'}
        aria-label={`Remove ${pack.name}`}
        onClick={() => onRemove(pack)}
        disabled={refreshing || isRemoving || !isInstalled}
      >
        {isRemoving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
      </button>
    </div>
  );
};

export default PackActionsCell;

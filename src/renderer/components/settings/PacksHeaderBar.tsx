import { Loader2, RefreshCw } from 'lucide-react';
import React from 'react';

interface Props {
  refreshing: boolean;
  onRefresh: () => void;
}

const PacksHeaderBar: React.FC<Props> = ({ refreshing, onRefresh }) => (
  <div className="flex justify-between items-center gap-3">
    <p className="text-sm text-brand-text-dark/70">Pull the latest packs from GitHub releases.</p>
    <button
      type="button"
      className="text-sm text-brand-text-dark/70 hover:text-white inline-flex items-center gap-2 disabled:opacity-40"
      onClick={onRefresh}
      disabled={refreshing}
    >
      {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
      Refresh
    </button>
  </div>
);

export default PacksHeaderBar;

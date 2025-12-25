import type { Marketplace } from '@shared/types';
import { Package, Trash2 } from 'lucide-react';
import React from 'react';

interface Props {
  marketplace: Marketplace;
  error?: string;
  packCount?: { total: number; installed: number };
  onToggle: (enabled: boolean) => void;
  onRemove: () => void;
}

const MarketplaceRow: React.FC<Props> = ({ marketplace, error, packCount, onToggle, onRemove }) => {
  return (
    <div
      className={`
        rounded-lg border px-3 py-2.5 bg-white/5
        ${error ? 'border-brand-accent-red/50' : 'border-brand-divider/40'}
      `}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={marketplace.enabled}
          onChange={(e) => onToggle(e.target.checked)}
          className="rounded accent-brand-accent-primary shrink-0"
        />

        <div className="flex-1 min-w-0" title={marketplace.url}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white truncate">{marketplace.name}</span>
            {marketplace.isOfficial && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-accent-primary/20 text-brand-accent-primary shrink-0">
                Official
              </span>
            )}
            {error && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-brand-accent-red/20 text-brand-accent-red shrink-0">
                Error
              </span>
            )}
          </div>
          {packCount && (
            <div className="flex items-center gap-3 mt-1 text-[11px] text-brand-text-dark/50">
              <span className="inline-flex items-center gap-1">
                <Package size={10} />
                {packCount.total} pack{packCount.total !== 1 ? 's' : ''}
              </span>
              {packCount.installed > 0 && (
                <span className="text-green-400/70">
                  {packCount.installed} installed
                </span>
              )}
            </div>
          )}
        </div>

        {!marketplace.isOfficial && (
          <button
            type="button"
            onClick={onRemove}
            className="text-brand-text-dark/50 hover:text-brand-accent-red shrink-0"
            aria-label={`Remove ${marketplace.name}`}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {error && <div className="mt-1.5 text-xs text-brand-accent-red/80">{error}</div>}
    </div>
  );
};

export default MarketplaceRow;

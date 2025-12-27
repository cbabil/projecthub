import type { Marketplace } from '@shared/types';
import { Plus } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Input, useToast } from 'ui-toolkit';

import { deriveMarketplaceId, deriveMarketplaceName, resolveMarketplaceUrl } from '../../utils/marketplace.js';
import MarketplaceRow from './MarketplaceRow.js';

interface Props {
  marketplaces: Marketplace[];
  onChange: (marketplaces: Marketplace[]) => void;
  errors: Record<string, string>;
  packCounts?: Record<string, { total: number; installed: number }>;
}

const MarketplaceList: React.FC<Props> = ({ marketplaces, onChange, errors, packCounts }) => {
  const toast = useToast();
  const [newUrl, setNewUrl] = useState('');

  const handleToggle = (id: string, enabled: boolean) => {
    onChange(marketplaces.map((m) => (m.id === id ? { ...m, enabled } : m)));
  };

  const handleRemove = (id: string) => {
    const marketplace = marketplaces.find((m) => m.id === id);
    if (marketplace?.isOfficial) {
      toast('Cannot remove the official marketplace.', 'warning');
      return;
    }
    onChange(marketplaces.filter((m) => m.id !== id));
  };

  const handleAdd = () => {
    const trimmed = newUrl.trim();
    if (!trimmed) return;

    try {
      const resolvedUrl = resolveMarketplaceUrl(trimmed);

      // Check for duplicates
      if (marketplaces.some((m) => m.url === resolvedUrl)) {
        toast('This marketplace is already added.', 'warning');
        return;
      }

      const newMarketplace: Marketplace = {
        id: deriveMarketplaceId(resolvedUrl),
        name: deriveMarketplaceName(resolvedUrl),
        url: resolvedUrl,
        isOfficial: false,
        enabled: true
      };

      onChange([...marketplaces, newMarketplace]);
      setNewUrl('');
      toast(`Marketplace "${newMarketplace.name}" added.`, 'success');
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-brand-text-dark/80">Marketplaces</div>
        <div className="text-xs text-brand-text-dark/50">{marketplaces.length} source{marketplaces.length !== 1 ? 's' : ''}</div>
      </div>

      <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
        {marketplaces.map((marketplace) => (
          <MarketplaceRow
            key={marketplace.id}
            marketplace={marketplace}
            error={errors[marketplace.id]}
            packCount={packCounts?.[marketplace.id]}
            onToggle={(enabled) => handleToggle(marketplace.id, enabled)}
            onRemove={() => handleRemove(marketplace.id)}
          />
        ))}
      </div>

      <div className="flex gap-3" onKeyDown={handleKeyDown}>
        <Input
          value={newUrl}
          onChange={setNewUrl}
          placeholder="owner/repo or https://..."
          className="flex-1"
        />
        <Button type="button" onClick={handleAdd} disabled={!newUrl.trim()}>
          <Plus size={16} className="inline mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
};

export default MarketplaceList;

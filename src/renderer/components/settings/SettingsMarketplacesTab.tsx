import { Store } from 'lucide-react';
import React, { useMemo } from 'react';

import { useMarketplaces } from '../../context/MarketplaceContext.js';
import { usePacksList } from '../../hooks/usePacksList.js';
import MarketplaceList from './MarketplaceList.js';

const SettingsMarketplacesTab: React.FC = () => {
  const { marketplaces, update } = useMarketplaces();
  const { packs, errors } = usePacksList(marketplaces);

  // Count packs per marketplace
  const packCounts = useMemo(() => {
    const counts: Record<string, { total: number; installed: number }> = {};
    packs.forEach((pack) => {
      const id = pack.marketplaceId || 'unknown';
      if (!counts[id]) counts[id] = { total: 0, installed: 0 };
      counts[id].total++;
      if (pack.status === 'installed') counts[id].installed++;
    });
    return counts;
  }, [packs]);

  return (
    <div className="flex flex-col gap-6">
      <MarketplaceList marketplaces={marketplaces} onChange={update} errors={errors} packCounts={packCounts} />

      <div className="border-t border-brand-divider/30 pt-4">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-accent-primary/10 border border-brand-accent-primary/20">
          <Store size={20} className="text-brand-accent-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Browse packs in the Marketplace</p>
            <p className="text-sm text-brand-text-dark/60 mt-1">
              Use the <strong>Marketplace</strong> in the sidebar to browse, install, and manage packs from your configured sources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsMarketplacesTab;

import { OFFICIAL_MARKETPLACE } from '@shared/marketplace.constants.js';
import type { Marketplace } from '@shared/types';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface MarketplaceContextValue {
  marketplaces: Marketplace[];
  refresh: () => Promise<void>;
  update: (next: Marketplace[]) => Promise<void>;
  loading: boolean;
  error?: string;
}

const MarketplaceContext = createContext<MarketplaceContextValue>({
  marketplaces: [OFFICIAL_MARKETPLACE],
  loading: true,
  refresh: async () => undefined,
  update: async () => undefined
});

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [marketplaces, setMarketplaces] = useState<Marketplace[]>([OFFICIAL_MARKETPLACE]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setLoading(true);
    const res = await window.projecthub.loadMarketplaces();
    if (res.ok && res.data) {
      setMarketplaces(res.data);
      setError(undefined);
    } else {
      setError(res.error || 'Unable to load marketplaces');
    }
    setLoading(false);
  }, []);

  const update = useCallback(async (next: Marketplace[]) => {
    const res = await window.projecthub.saveMarketplaces(next);
    if (res.ok && res.data) {
      setMarketplaces(res.data);
      setError(undefined);
    } else {
      setError(res.error || 'Failed to update marketplaces');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ marketplaces, refresh, update, loading, error }),
    [marketplaces, refresh, update, loading, error]
  );

  return (
    <MarketplaceContext.Provider value={value}>
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplaces = () => useContext(MarketplaceContext);

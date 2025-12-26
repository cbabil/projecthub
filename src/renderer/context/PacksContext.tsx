import React, { createContext, useContext, useMemo } from 'react';

import { PackRow, usePacksList } from '../hooks/usePacksList.js';
import { useMarketplaces } from './MarketplaceContext.js';

interface PacksContextValue {
  packs: PackRow[];
  refreshing: boolean;
  installingId?: string;
  removingId?: string;
  errors: Record<string, string>;
  updateCount: number;
  refresh: () => void;
  installPack: (pack: PackRow) => Promise<void>;
  removePack: (pack: PackRow) => Promise<void>;
}

const PacksContext = createContext<PacksContextValue>({
  packs: [],
  refreshing: false,
  errors: {},
  updateCount: 0,
  refresh: () => undefined,
  installPack: async () => undefined,
  removePack: async () => undefined
});

export const PacksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { marketplaces } = useMarketplaces();
  const packsData = usePacksList(marketplaces);

  const updateCount = useMemo(() => {
    return packsData.packs.filter(
      (p) => p.status === 'installed' && p.installedVersion && p.version && p.installedVersion !== p.version
    ).length;
  }, [packsData.packs]);

  const value = useMemo(
    () => ({ ...packsData, updateCount }),
    [packsData, updateCount]
  );

  return <PacksContext.Provider value={value}>{children}</PacksContext.Provider>;
};

export const usePacks = () => useContext(PacksContext);

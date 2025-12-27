import { Loader2, RefreshCw, Store } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Typography, useToast } from 'ui-toolkit';

import { PACK_CATEGORIES } from '../../shared/marketplace.constants.js';
import MarketplaceFilters, { SortBy, StatusFilter } from '../components/MarketplaceFilters.js';
import PackCard from '../components/PackCard.js';
import { usePacks } from '../context/PacksContext.js';

const Marketplace: React.FC = () => {
  const { packs, refreshing, installingId, removingId, errors, refresh, installPack, removePack } = usePacks();
  const addToast = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const shownErrorsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const newErrors = errorKeys.filter((key) => !shownErrorsRef.current.has(key));
      if (newErrors.length > 0) {
        addToast('Some marketplaces failed to load. Check Settings for details.', 'warning');
        newErrors.forEach((key) => shownErrorsRef.current.add(key));
      }
    }
  }, [errors, addToast]);

  const visibleCategories = useMemo(() => {
    const packCategories = new Set(packs.map((p) => p.category || 'Other'));
    return PACK_CATEGORIES.filter((cat) => packCategories.has(cat));
  }, [packs]);

  const filteredPacks = useMemo(() => {
    let result = packs;

    if (statusFilter === 'installed') {
      result = result.filter((p) => p.status === 'installed');
    } else if (statusFilter === 'not-installed') {
      result = result.filter((p) => p.status !== 'installed');
    } else if (statusFilter === 'updates') {
      result = result.filter(
        (p) => p.status === 'installed' && p.installedVersion && p.version && p.installedVersion !== p.version
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((p) => (p.category || 'Other') === selectedCategory);
    }

    if (searchQuery.trim()) {
      const lower = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(lower) ||
          p.description?.toLowerCase().includes(lower) ||
          p.marketplaceName?.toLowerCase().includes(lower)
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'category') return (a.category || 'Other').localeCompare(b.category || 'Other');
      if (sortBy === 'date') {
        const dateA = a.releasedOn ? new Date(a.releasedOn).getTime() : 0;
        const dateB = b.releasedOn ? new Date(b.releasedOn).getTime() : 0;
        return dateB - dateA;
      }
      return 0;
    });
  }, [packs, selectedCategory, searchQuery, statusFilter, sortBy]);

  const showLoading = refreshing && packs.length === 0;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Store size={24} className="text-brand-accent-primary" />
          <div>
            <Typography variant="h1">Marketplace</Typography>
            <Typography variant="small">Browse and install template packs</Typography>
          </div>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={refreshing}
          className="px-3 py-2 text-sm text-brand-text-dark/70 hover:text-white inline-flex items-center gap-2 disabled:opacity-50"
        >
          {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          Refresh
        </button>
      </div>

      <Search value={searchQuery} onChange={setSearchQuery} placeholder="Search packs..." />

      <MarketplaceFilters
        categories={visibleCategories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {showLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-brand-text-dark/60">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" />
            <p>Loading packs from marketplaces...</p>
          </div>
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-brand-text-dark/60">
            <Store size={48} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium">No packs found</p>
            <p className="text-sm mt-1">
              {searchQuery ? 'Try a different search term' : 'Add a marketplace in Settings to browse packs'}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredPacks.map((pack) => (
              <PackCard
                key={`${pack.marketplaceId}-${pack.name}`}
                pack={pack}
                installing={installingId === pack.name}
                removing={removingId === pack.name}
                onInstall={() => installPack(pack)}
                onRemove={() => removePack(pack)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

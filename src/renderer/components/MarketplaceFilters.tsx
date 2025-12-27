import React from 'react';
import { Dropdown } from 'ui-toolkit';

import CategoryFilter from './CategoryFilter.js';

type StatusFilter = 'all' | 'installed' | 'not-installed' | 'updates';
type SortBy = 'name' | 'category' | 'date';

interface Props {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sortBy: SortBy;
  onSortChange: (sort: SortBy) => void;
}

const STATUS_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'installed', label: 'Installed' },
  { key: 'not-installed', label: 'Not Installed' },
  { key: 'updates', label: 'Updates' }
] as const;

const MarketplaceFilters: React.FC<Props> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  statusFilter,
  onStatusChange,
  sortBy,
  onSortChange
}) => (
  <div className="flex flex-wrap items-center gap-4">
    {categories.length > 0 && (
      <CategoryFilter categories={categories} selected={selectedCategory} onChange={onCategoryChange} />
    )}

    <div className="flex items-center gap-2">
      <span className="text-xs text-brand-text-dark/60">Status:</span>
      <div className="flex gap-1">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onStatusChange(opt.key as StatusFilter)}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              statusFilter === opt.key
                ? 'bg-brand-accent-primary text-white'
                : 'bg-white/5 text-brand-text-dark/70 hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>

    <div className="flex items-center gap-2 ml-auto">
      <span className="text-xs text-brand-text-dark/60">Sort:</span>
      <Dropdown
        value={sortBy}
        onChange={(value) => onSortChange(value as SortBy)}
        options={[
          { value: 'name', label: 'Name' },
          { value: 'category', label: 'Category' },
          { value: 'date', label: 'Release Date' }
        ]}
      />
    </div>
  </div>
);

export type { SortBy, StatusFilter };
export default MarketplaceFilters;

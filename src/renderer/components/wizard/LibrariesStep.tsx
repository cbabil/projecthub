import { Library } from 'lucide-react';
import React from 'react';
import { Search } from 'ui-toolkit';

import EmptyState from '../EmptyState.js';

type Props = {
  libraries: { name: string }[];
  selected: string[];
  query: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyMessage: string;
  onQueryChange: (value: string) => void;
  onToggle: (value: string) => void;
};

const LibrariesStep: React.FC<Props> = ({ libraries, selected, query, searchPlaceholder, emptyTitle, emptyMessage, onQueryChange, onToggle }) => (
  <div className="flex h-full flex-col gap-3">
    <div className="shrink-0">
      <Search value={query} onChange={onQueryChange} placeholder={searchPlaceholder} />
    </div>
    {libraries.length ? (
      <div className="flex-1 overflow-auto pr-1">
        <div className="flex flex-col gap-2">
          {libraries.map((lib) => (
            <label key={lib.name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(lib.name)} onChange={() => onToggle(lib.name)} />
              {lib.name}
            </label>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={Library} title={emptyTitle} message={emptyMessage} />
      </div>
    )}
  </div>
);

export default LibrariesStep;

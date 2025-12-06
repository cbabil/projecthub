import { Search as SearchIcon } from 'lucide-react';
import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

const Search: React.FC<Props> = ({ value, onChange, placeholder = 'Search', className }) => (
  <label className={`input flex items-center gap-2 ${className ?? ''}`}>
    <SearchIcon size={16} className="text-brand-text-dark/70" />
    <input
      className="bg-transparent flex-1 outline-none"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);

export default Search;

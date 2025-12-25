import React from 'react';

interface Props {
  categories: string[];
  selected: string;
  onChange: (category: string) => void;
}

const CategoryFilter: React.FC<Props> = ({ categories, selected, onChange }) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={() => onChange('All')}
        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
          selected === 'All'
            ? 'bg-brand-accent-primary text-white'
            : 'bg-white/5 text-brand-text-dark/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => onChange(category)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
            selected === category
              ? 'bg-brand-accent-primary text-white'
              : 'bg-white/5 text-brand-text-dark/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;

import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

interface Props {
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  pageLabelFormatter?: (info: { page: number; pageCount: number }) => React.ReactNode;
  labels?: { prev: string; next: string };
}

const DataGridPagination: React.FC<Props> = ({ page, pageCount, onPrev, onNext, pageLabelFormatter, labels }) => (
  <div className="flex items-center justify-between text-xs text-brand-text-dark/70">
    <span>{pageLabelFormatter ? pageLabelFormatter({ page: page + 1, pageCount }) : `Page ${page + 1} of ${pageCount}`}</span>
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onPrev}
        disabled={page === 0}
        aria-label={labels?.prev ?? 'Previous page'}
        className={`p-2 rounded-full border border-white/10 transition ${
          page === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:border-brand-accent-primary hover:text-brand-accent-primary'
        }`}
      >
        <ChevronLeft size={14} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={page >= pageCount - 1}
        aria-label={labels?.next ?? 'Next page'}
        className={`p-2 rounded-full border border-white/10 transition ${
          page >= pageCount - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:border-brand-accent-primary hover:text-brand-accent-primary'
        }`}
      >
        <ChevronRight size={14} />
      </button>
    </div>
  </div>
);

export default DataGridPagination;

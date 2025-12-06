import React from 'react';

type GridPaginationProps = {
  start: number;
  pageSize: number;
  total: number;
  currentPage: number;
  pageCount: number;
  onChange: (delta: number) => void;
};

const GridPagination: React.FC<GridPaginationProps> = ({ start, pageSize, total, currentPage, pageCount, onChange }) => {
  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-brand-text-dark/70 mt-auto">
      <span>
        Showing {start + 1}-{Math.min(start + pageSize, total)} of {total}
      </span>
      <div className="flex items-center gap-2">
        <button
          className="px-2 py-1 rounded border border-brand-divider/60 disabled:opacity-40"
          onClick={() => onChange(-1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} / {pageCount}
        </span>
        <button
          className="px-2 py-1 rounded border border-brand-divider/60 disabled:opacity-40"
          onClick={() => onChange(1)}
          disabled={currentPage === pageCount}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GridPagination;

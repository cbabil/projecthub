import { useEffect, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export type GridColumn<T> = {
  id: string;
  label: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  sortValue?: (row: T) => string | number;
  headerAlign?: 'left' | 'right' | 'center';
};

export type GridSelectionMode = 'none' | 'single' | 'multi';

export interface UseDataGridOptions<T> {
  pageSize?: number;
  initialSort?: { columnId: string; direction: SortDirection };
  filterRows?: (row: T, query: string) => boolean;
  rowHeight?: number;
}

export interface UseDataGridResult<T> {
  query: string;
  setQuery: (next: string) => void;
  page: number;
  pageCount: number;
  setPage: (next: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  visibleRows: T[];
  allRows: T[];
  toggleSort: (columnId: string) => void;
  sortState?: { columnId: string; direction: SortDirection };
  rowHeight: number;
}

const defaultFilter = <T,>(row: T, query: string) => {
  if (!query.trim()) return true;
  const haystack = JSON.stringify(row).toLowerCase();
  return haystack.includes(query.toLowerCase());
};

export const useDataGrid = <T,>(rows: T[], columns: GridColumn<T>[], options: UseDataGridOptions<T> = {}): UseDataGridResult<T> => {
  const pageSize = options.pageSize ?? 10;
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [sortState, setSortState] = useState<UseDataGridOptions<T>['initialSort']>(options.initialSort);

  const filtered = useMemo(() => {
    const filter = options.filterRows ?? defaultFilter;
    const filteredRows = rows.filter((row) => filter(row, query));
    if (!sortState) return filteredRows;
    const column = columns.find((col) => col.id === sortState.columnId);
    if (!column || !column.sortable) return filteredRows;
    const getValue = column.sortValue ?? column.accessor;
    return [...filteredRows].sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);
      const leftString = typeof left === 'number' ? left : String(left ?? '').toLowerCase();
      const rightString = typeof right === 'number' ? right : String(right ?? '').toLowerCase();
      if (leftString < rightString) return sortState.direction === 'asc' ? -1 : 1;
      if (leftString > rightString) return sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [rows, query, columns, sortState, options.filterRows]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * pageSize;
  const visibleRows = filtered.slice(start, start + pageSize);

  useEffect(() => {
    setPage(0);
  }, [query, rows.length, pageSize]);

  useEffect(() => {
    if (safePage !== page) {
      setPage(safePage);
    }
  }, [safePage, page]);

  const toggleSort = (columnId: string) => {
    setSortState((prev) => {
      if (!prev || prev.columnId !== columnId) {
        return { columnId, direction: 'asc' };
      }
      return { columnId, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  const goToPrevPage = () => setPage((prev) => Math.max(0, prev - 1));
  const goToNextPage = () => setPage((prev) => Math.min(pageCount - 1, prev + 1));

  return {
    query,
    setQuery,
    page: safePage,
    pageCount,
    setPage,
    goToPrevPage,
    goToNextPage,
    visibleRows,
    allRows: filtered,
    toggleSort,
    sortState,
    rowHeight: options.rowHeight ?? 52
  };
};

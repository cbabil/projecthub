import type { ReactNode } from 'react';

import type { GridColumn, GridSelectionMode } from '../hooks/useDataGrid.js';

export interface DataGridProps<T> {
  rows: T[];
  columns: GridColumn<T>[];
  getRowId: (row: T) => string;
  selectionMode?: GridSelectionMode;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  enableSearch?: boolean;
  searchInsideCard?: boolean;
  searchPlaceholder?: string;
  enablePagination?: boolean;
  pageSize?: number;
  filterRows?: (row: T, query: string) => boolean;
  rowHeight?: number;
  className?: string;
  headerActions?: ReactNode;
  footer?: ReactNode;
  onRowClick?: (row: T) => void;
  pageLabelFormatter?: (info: { page: number; pageCount: number }) => ReactNode;
  paginationLabels?: { prev: string; next: string };
  fillContainer?: boolean;
  searchPrefix?: ReactNode;
}

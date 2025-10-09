// types/table.ts
export interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  sortable?: boolean | "custom";

  type?: "selection" | "index" | "expand" | "action";
  formatter?: (
    row: any,
    column: TableColumn,
    cellValue: any,
    index: number,
  ) => any;
  render?: (scope: { row: any; column: TableColumn; $index: number }) => any;

  slot?: string;
  headerSlot?: string;

  [key: string]: any;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface TableProps {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: Pagination;
  showPagination?: boolean;
  border?: boolean;
  stripe?: boolean;
  height?: string | number;
  maxHeight?: string | number;
  rowKey?: string;
  selection?: boolean;
  index?: boolean;
  expand?: boolean;
}

export interface TableEmits {
  (e: "selection-change", selection: any[]): void;
  (e: "sort-change", sort: { prop: string; order: string }): void;
  (e: "page-change", pagination: Pagination): void;
  (e: "row-click", row: any, column: TableColumn, event: Event): void;
  (e: "edit", row: any): void;
  (e: "delete", row: any): void;
  (e: "custom", event: string, data: any): void;
}

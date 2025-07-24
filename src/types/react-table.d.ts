import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  interface ColumnMeta<TData extends unknown, TValue> {
    cellClassName?: string;
  }
} 
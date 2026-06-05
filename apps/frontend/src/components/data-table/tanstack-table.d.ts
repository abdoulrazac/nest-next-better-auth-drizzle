import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Human-readable label shown in the view-options column toggle */
    label?: string;
  }
}

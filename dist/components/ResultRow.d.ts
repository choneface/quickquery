import type { ColumnInfo } from '../types.js';
interface ResultRowProps {
    row: Record<string, unknown>;
    columns: ColumnInfo[];
    isSelected?: boolean;
}
export declare const ResultRow: ({ row, columns, isSelected }: ResultRowProps) => import("react/jsx-runtime").JSX.Element;
export {};

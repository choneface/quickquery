import type { ColumnInfo } from '../types.js';
interface ResultFooterProps {
    columns: ColumnInfo[];
    rowCount: number;
    executionTime: number;
    viewStart: number;
    viewEnd: number;
}
export declare const ResultFooter: ({ columns, rowCount, executionTime, viewStart, viewEnd }: ResultFooterProps) => import("react/jsx-runtime").JSX.Element;
export {};

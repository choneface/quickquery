import type { QueryResult } from 'pg';
export interface ColumnInfo {
    name: string;
    dataTypeID: number;
    width: number;
}
export interface QueryResultData {
    columns: ColumnInfo[];
    rows: Record<string, unknown>[];
    rowCount: number;
    executionTime: number;
}
export interface CellValue {
    value: unknown;
    type: 'string' | 'number' | 'boolean' | 'null' | 'date' | 'json' | 'unknown';
}
export declare function parseQueryResult(result: QueryResult, executionTime: number): QueryResultData;
export declare function formatValue(value: unknown): string;
export declare function getCellType(value: unknown): CellValue['type'];
export declare function truncate(str: string, maxLength: number): string;
export declare function padCell(value: string, width: number, type: CellValue['type']): string;

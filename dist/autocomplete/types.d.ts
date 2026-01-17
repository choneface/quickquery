export interface ColumnMeta {
    name: string;
    dataType: string;
    isNullable: boolean;
}
export interface TableInfo {
    name: string;
    schema: string;
    columns: ColumnMeta[];
}
export interface DatabaseSchema {
    tables: TableInfo[];
    keywords: string[];
    functions: string[];
}
export type SQLContext = {
    type: 'SELECT_COLUMNS';
    tables: string[];
    partial: string;
} | {
    type: 'FROM_TABLE';
    partial: string;
} | {
    type: 'JOIN_TABLE';
    partial: string;
} | {
    type: 'WHERE_COLUMN';
    tables: string[];
    partial: string;
} | {
    type: 'TABLE_COLUMN';
    table: string;
    partial: string;
} | {
    type: 'KEYWORD';
    partial: string;
} | {
    type: 'UNKNOWN';
    partial: string;
};

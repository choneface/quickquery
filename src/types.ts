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

export function parseQueryResult(result: QueryResult, executionTime: number): QueryResultData {
	const columns: ColumnInfo[] = result.fields.map((field) => ({
		name: field.name,
		dataTypeID: field.dataTypeID,
		width: field.name.length,
	}));

	// Calculate column widths based on data
	for (const row of result.rows) {
		for (let i = 0; i < columns.length; i++) {
			const col = columns[i];
			const value = row[col.name];
			const strValue = formatValue(value);
			col.width = Math.max(col.width, strValue.length);
		}
	}

	// Cap column widths at a reasonable maximum
	const MAX_COL_WIDTH = 40;
	for (const col of columns) {
		col.width = Math.min(col.width, MAX_COL_WIDTH);
	}

	return {
		columns,
		rows: result.rows,
		rowCount: result.rowCount ?? result.rows.length,
		executionTime,
	};
}

export function formatValue(value: unknown): string {
	if (value === null) {
		return 'NULL';
	}
	if (value === undefined) {
		return '';
	}
	if (typeof value === 'boolean') {
		return value ? 'true' : 'false';
	}
	if (typeof value === 'number') {
		return String(value);
	}
	if (value instanceof Date) {
		return value.toISOString();
	}
	if (typeof value === 'object') {
		return JSON.stringify(value);
	}
	return String(value);
}

export function getCellType(value: unknown): CellValue['type'] {
	if (value === null) return 'null';
	if (value === undefined) return 'null';
	if (typeof value === 'boolean') return 'boolean';
	if (typeof value === 'number') return 'number';
	if (value instanceof Date) return 'date';
	if (typeof value === 'object') return 'json';
	if (typeof value === 'string') return 'string';
	return 'unknown';
}

export function truncate(str: string, maxLength: number): string {
	if (str.length <= maxLength) {
		return str;
	}
	return str.slice(0, maxLength - 1) + '…';
}

export function padCell(value: string, width: number, type: CellValue['type']): string {
	const truncated = truncate(value, width);
	// Right-align numbers, left-align everything else
	if (type === 'number') {
		return truncated.padStart(width);
	}
	return truncated.padEnd(width);
}

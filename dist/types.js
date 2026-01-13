export function parseQueryResult(result, executionTime) {
    const columns = result.fields.map((field) => ({
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
export function formatValue(value) {
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
export function getCellType(value) {
    if (value === null)
        return 'null';
    if (value === undefined)
        return 'null';
    if (typeof value === 'boolean')
        return 'boolean';
    if (typeof value === 'number')
        return 'number';
    if (value instanceof Date)
        return 'date';
    if (typeof value === 'object')
        return 'json';
    if (typeof value === 'string')
        return 'string';
    return 'unknown';
}
export function truncate(str, maxLength) {
    if (str.length <= maxLength) {
        return str;
    }
    return str.slice(0, maxLength - 1) + '…';
}
export function padCell(value, width, type) {
    const truncated = truncate(value, width);
    // Right-align numbers, left-align everything else
    if (type === 'number') {
        return truncated.padStart(width);
    }
    return truncated.padEnd(width);
}

import pg from 'pg';
import { formatValue } from './types.js';
function escapeCSVField(value) {
    // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
    if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
        return '"' + value.replace(/"/g, '""') + '"';
    }
    return value;
}
function formatRowAsCSV(row, columns) {
    return columns.map((col) => escapeCSVField(formatValue(row[col]))).join(',');
}
function isSelectQuery(query) {
    const trimmed = query.trim().toUpperCase();
    return trimmed.startsWith('SELECT') || trimmed.startsWith('WITH');
}
export async function runHeadless(config) {
    const client = new pg.Client({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password,
    });
    try {
        await client.connect();
        const result = await client.query(config.query);
        if (isSelectQuery(config.query)) {
            // For SELECT queries, output CSV
            if (result.fields && result.fields.length > 0) {
                const columns = result.fields.map((f) => f.name);
                // Print header
                console.log(columns.map(escapeCSVField).join(','));
                // Print rows
                for (const row of result.rows) {
                    console.log(formatRowAsCSV(row, columns));
                }
            }
        }
        else {
            // For non-SELECT queries (INSERT, UPDATE, DELETE, etc.)
            if (result.rowCount !== null && result.rowCount !== undefined) {
                console.log(`${result.rowCount} row(s) affected`);
            }
            else {
                console.log('Query executed successfully');
            }
        }
    }
    catch (err) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
    }
    finally {
        await client.end();
    }
}

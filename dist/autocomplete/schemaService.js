import { SQL_KEYWORDS, SQL_FUNCTIONS } from './keywords.js';
export async function loadSchema(client) {
    const tablesResult = await client.query(`
		SELECT table_name
		FROM information_schema.tables
		WHERE table_schema = current_schema()
		  AND table_type = 'BASE TABLE'
		ORDER BY table_name
	`);
    const columnsResult = await client.query(`
		SELECT table_name, column_name, data_type, is_nullable
		FROM information_schema.columns
		WHERE table_schema = current_schema()
		ORDER BY table_name, ordinal_position
	`);
    const tableMap = new Map();
    for (const row of tablesResult.rows) {
        tableMap.set(row.table_name, {
            name: row.table_name,
            schema: 'public',
            columns: [],
        });
    }
    for (const row of columnsResult.rows) {
        const table = tableMap.get(row.table_name);
        if (table) {
            const column = {
                name: row.column_name,
                dataType: row.data_type,
                isNullable: row.is_nullable === 'YES',
            };
            table.columns.push(column);
        }
    }
    return {
        tables: Array.from(tableMap.values()),
        keywords: SQL_KEYWORDS,
        functions: SQL_FUNCTIONS,
    };
}
export function createEmptySchema() {
    return {
        tables: [],
        keywords: SQL_KEYWORDS,
        functions: SQL_FUNCTIONS,
    };
}

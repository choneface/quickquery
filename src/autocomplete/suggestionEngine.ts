import type { DatabaseSchema, SQLContext } from './types.js';
import { parseContext } from './sqlParser.js';

interface Candidate {
	text: string;
	priority: number;
}

export function getSuggestion(query: string, schema: DatabaseSchema): string | undefined {
	if (!query.trim()) {
		return undefined;
	}

	const context = parseContext(query);
	const candidates = getCandidates(context, schema);
	const ranked = rankCandidates(candidates, context.partial);

	if (ranked.length === 0) {
		return undefined;
	}

	// Build the complete suggestion by replacing the partial with the match
	const suggestion = ranked[0].text;
	if (!context.partial) {
		// No partial word - just append the suggestion
		return query + suggestion;
	}

	// Replace the partial word with the full suggestion
	const beforePartial = query.slice(0, query.length - context.partial.length);
	return beforePartial + suggestion;
}

function getCandidates(context: SQLContext, schema: DatabaseSchema): Candidate[] {
	const candidates: Candidate[] = [];

	switch (context.type) {
		case 'SELECT_COLUMNS': {
			// Add columns from known tables
			const columns = getColumnsForTables(context.tables, schema);
			for (const col of columns) {
				candidates.push({ text: col, priority: 1 });
			}
			// Add functions (high priority in SELECT)
			for (const fn of schema.functions) {
				candidates.push({ text: fn, priority: 2 });
			}
			// Add keywords
			for (const kw of schema.keywords) {
				candidates.push({ text: kw, priority: 3 });
			}
			// Add all table columns if no specific tables
			if (context.tables.length === 0) {
				for (const table of schema.tables) {
					for (const col of table.columns) {
						candidates.push({ text: col.name, priority: 1 });
					}
				}
			}
			break;
		}

		case 'FROM_TABLE':
		case 'JOIN_TABLE': {
			// Suggest table names
			for (const table of schema.tables) {
				candidates.push({ text: table.name, priority: 1 });
			}
			break;
		}

		case 'WHERE_COLUMN': {
			// Add columns from known tables
			const columns = getColumnsForTables(context.tables, schema);
			for (const col of columns) {
				candidates.push({ text: col, priority: 1 });
			}
			// Add functions (useful in WHERE)
			for (const fn of schema.functions) {
				candidates.push({ text: fn, priority: 2 });
			}
			// Add keywords
			for (const kw of schema.keywords) {
				candidates.push({ text: kw, priority: 3 });
			}
			// Add all table columns if no specific tables
			if (context.tables.length === 0) {
				for (const table of schema.tables) {
					for (const col of table.columns) {
						candidates.push({ text: col.name, priority: 1 });
					}
				}
			}
			break;
		}

		case 'TABLE_COLUMN': {
			// Suggest columns for the specific table
			const table = schema.tables.find(
				(t) => t.name.toLowerCase() === context.table.toLowerCase()
			);
			if (table) {
				for (const col of table.columns) {
					candidates.push({ text: col.name, priority: 1 });
				}
			}
			break;
		}

		case 'KEYWORD':
		case 'UNKNOWN':
		default: {
			// Suggest keywords first, then functions
			for (const kw of schema.keywords) {
				candidates.push({ text: kw, priority: 1 });
			}
			for (const fn of schema.functions) {
				candidates.push({ text: fn, priority: 2 });
			}
			// Also suggest table names
			for (const table of schema.tables) {
				candidates.push({ text: table.name, priority: 3 });
			}
			break;
		}
	}

	return candidates;
}

function getColumnsForTables(tableNames: string[], schema: DatabaseSchema): string[] {
	const columns: string[] = [];

	for (const tableName of tableNames) {
		const table = schema.tables.find(
			(t) => t.name.toLowerCase() === tableName.toLowerCase()
		);
		if (table) {
			for (const col of table.columns) {
				columns.push(col.name);
			}
		}
	}

	return columns;
}

function rankCandidates(candidates: Candidate[], partial: string): Candidate[] {
	if (!partial) {
		// No partial - return candidates sorted by priority then alphabetically
		return candidates
			.sort((a, b) => {
				if (a.priority !== b.priority) {
					return a.priority - b.priority;
				}
				return a.text.localeCompare(b.text);
			});
	}

	const upperPartial = partial.toUpperCase();

	// Filter to only candidates that match the partial (case-insensitive prefix)
	const matching = candidates.filter((c) =>
		c.text.toUpperCase().startsWith(upperPartial)
	);

	// Don't suggest if the partial is already a complete match
	if (matching.length === 1 && matching[0].text.toUpperCase() === upperPartial) {
		return [];
	}

	// Sort by priority, then by length (shorter = more likely), then alphabetically
	return matching.sort((a, b) => {
		if (a.priority !== b.priority) {
			return a.priority - b.priority;
		}
		if (a.text.length !== b.text.length) {
			return a.text.length - b.text.length;
		}
		return a.text.localeCompare(b.text);
	});
}

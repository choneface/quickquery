const CLAUSE_KEYWORDS = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE', 'SET', 'VALUES', 'INTO'];
export function parseContext(query) {
    const upperQuery = query.toUpperCase();
    const trimmed = query.trimEnd();
    // Get the partial word being typed (last word fragment)
    const partial = getPartialWord(trimmed);
    const beforePartial = trimmed.slice(0, trimmed.length - partial.length).trimEnd();
    // Check for table.column pattern (e.g., "users.")
    const dotMatch = beforePartial.match(/(\w+)\.\s*$/);
    if (dotMatch) {
        return {
            type: 'TABLE_COLUMN',
            table: dotMatch[1],
            partial,
        };
    }
    // Find the last clause keyword
    const lastClause = findLastClause(upperQuery, beforePartial.length);
    const tables = extractTables(query);
    switch (lastClause) {
        case 'SELECT':
            return {
                type: 'SELECT_COLUMNS',
                tables,
                partial,
            };
        case 'FROM':
        case 'INTO':
            return {
                type: 'FROM_TABLE',
                partial,
            };
        case 'JOIN':
        case 'LEFT':
        case 'RIGHT':
        case 'INNER':
        case 'OUTER':
        case 'FULL':
        case 'CROSS':
            // Check if we're after JOIN keyword or after ON
            if (isAfterJoinKeyword(upperQuery, beforePartial.length)) {
                return {
                    type: 'JOIN_TABLE',
                    partial,
                };
            }
            return {
                type: 'WHERE_COLUMN',
                tables,
                partial,
            };
        case 'WHERE':
        case 'AND':
        case 'OR':
        case 'ON':
        case 'HAVING':
        case 'SET':
            return {
                type: 'WHERE_COLUMN',
                tables,
                partial,
            };
        case 'ORDER':
        case 'GROUP':
            // Check if BY follows
            if (upperQuery.includes('BY', upperQuery.lastIndexOf(lastClause))) {
                return {
                    type: 'WHERE_COLUMN',
                    tables,
                    partial,
                };
            }
            return {
                type: 'KEYWORD',
                partial,
            };
        default:
            // No clause found - suggest keywords
            return {
                type: 'KEYWORD',
                partial,
            };
    }
}
function getPartialWord(query) {
    // Match the last word fragment (alphanumeric and underscore)
    const match = query.match(/[\w]*$/);
    return match ? match[0] : '';
}
function findLastClause(upperQuery, beforePosition) {
    const queryUpToPosition = upperQuery.slice(0, beforePosition + 1);
    let lastClause = null;
    let lastPosition = -1;
    for (const keyword of CLAUSE_KEYWORDS) {
        // Use word boundary to match whole keywords
        const regex = new RegExp(`\\b${keyword}\\b`, 'g');
        let match;
        while ((match = regex.exec(queryUpToPosition)) !== null) {
            if (match.index > lastPosition) {
                lastPosition = match.index;
                lastClause = keyword;
            }
        }
    }
    return lastClause;
}
function extractTables(query) {
    const tables = [];
    const upperQuery = query.toUpperCase();
    // Match tables after FROM (with optional alias)
    const fromMatch = upperQuery.match(/\bFROM\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/i);
    if (fromMatch) {
        const tableName = query.slice(upperQuery.indexOf(fromMatch[1]), upperQuery.indexOf(fromMatch[1]) + fromMatch[1].length);
        tables.push(tableName.toLowerCase());
    }
    // Match tables after JOIN keywords (with optional alias)
    const joinRegex = /\b(?:LEFT|RIGHT|INNER|OUTER|FULL|CROSS)?\s*JOIN\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?/gi;
    let joinMatch;
    while ((joinMatch = joinRegex.exec(query)) !== null) {
        tables.push(joinMatch[1].toLowerCase());
    }
    return tables;
}
function isAfterJoinKeyword(upperQuery, position) {
    const queryUpToPosition = upperQuery.slice(0, position + 1);
    // Find the last JOIN-related keyword
    const joinKeywords = ['JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'FULL JOIN', 'CROSS JOIN'];
    for (const keyword of joinKeywords) {
        const lastIndex = queryUpToPosition.lastIndexOf(keyword);
        if (lastIndex !== -1) {
            // Check if there's an ON clause after this JOIN
            const afterJoin = queryUpToPosition.slice(lastIndex + keyword.length);
            if (!afterJoin.includes(' ON ')) {
                // Check if there's already a table name after JOIN
                const tableMatch = afterJoin.match(/^\s+\w+/);
                if (!tableMatch) {
                    return true;
                }
            }
        }
    }
    return false;
}

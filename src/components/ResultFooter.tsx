import React from 'react';
import { Box, Text } from 'ink';
import type { ColumnInfo } from '../types.js';

interface ResultFooterProps {
	columns: ColumnInfo[];
	rowCount: number;
	executionTime: number;
	viewStart: number;
	viewEnd: number;
}

export const ResultFooter = ({ columns, rowCount, executionTime, viewStart, viewEnd }: ResultFooterProps) => {
	const bottomBorder = buildBorder(columns, '└', '┴', '┘');

	return (
		<Box flexDirection="column">
			<Text color="gray">{' ' + bottomBorder}</Text>
			<Box marginTop={1} gap={2}>
				<Text dimColor>
					Showing {viewStart + 1}-{Math.min(viewEnd, rowCount)} of {rowCount} rows
				</Text>
				<Text dimColor>({executionTime.toFixed(0)}ms)</Text>
			</Box>
			<Box marginTop={1}>
				<Text dimColor>↑↓ scroll • PgUp/PgDn page • q back to query</Text>
			</Box>
		</Box>
	);
};

function buildBorder(columns: ColumnInfo[], left: string, mid: string, right: string): string {
	const segments = columns.map((col) => '─'.repeat(col.width + 2));
	return left + segments.join(mid) + right;
}

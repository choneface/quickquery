import React from 'react';
import { Box, Text } from 'ink';
import { truncate } from '../types.js';
import type { ColumnInfo } from '../types.js';

interface ResultHeaderProps {
	columns: ColumnInfo[];
}

export const ResultHeader = ({ columns }: ResultHeaderProps) => {
	const topBorder = buildBorder(columns, '┌', '┬', '┐');
	const bottomBorder = buildBorder(columns, '├', '┼', '┤');

	return (
		<Box flexDirection="column">
			<Text color="gray">{' ' + topBorder}</Text>
			<Box>
				<Text> </Text>
				<Text color="gray">│</Text>
				{columns.map((col) => (
					<Box key={col.name}>
						<Text> </Text>
						<Text bold color="white">
							{truncate(col.name, col.width).padEnd(col.width)}
						</Text>
						<Text> </Text>
						<Text color="gray">│</Text>
					</Box>
				))}
			</Box>
			<Text color="gray">{' ' + bottomBorder}</Text>
		</Box>
	);
};

function buildBorder(columns: ColumnInfo[], left: string, mid: string, right: string): string {
	const segments = columns.map((col) => '─'.repeat(col.width + 2));
	return left + segments.join(mid) + right;
}

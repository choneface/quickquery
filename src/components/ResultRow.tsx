import React from 'react';
import { Box, Text } from 'ink';
import { ResultCell } from './ResultCell.js';
import type { ColumnInfo } from '../types.js';

interface ResultRowProps {
	row: Record<string, unknown>;
	columns: ColumnInfo[];
	isSelected?: boolean;
}

export const ResultRow = ({ row, columns, isSelected = false }: ResultRowProps) => {
	return (
		<Box>
			<Text>{isSelected ? '▶' : ' '}</Text>
			<Text color="gray">│</Text>
			{columns.map((col, idx) => (
				<Box key={col.name}>
					<Text> </Text>
					<ResultCell value={row[col.name]} width={col.width} />
					<Text> </Text>
					<Text color="gray">│</Text>
				</Box>
			))}
		</Box>
	);
};

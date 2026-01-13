import React from 'react';
import { Text } from 'ink';
import { formatValue, getCellType, padCell, type CellValue } from '../types.js';

interface ResultCellProps {
	value: unknown;
	width: number;
}

export const ResultCell = ({ value, width }: ResultCellProps) => {
	const type = getCellType(value);
	const formatted = formatValue(value);
	const padded = padCell(formatted, width, type);

	return (
		<Text color={getCellColor(type)} dimColor={type === 'null'}>
			{padded}
		</Text>
	);
};

function getCellColor(type: CellValue['type']): string | undefined {
	switch (type) {
		case 'null':
			return 'gray';
		case 'number':
			return 'cyan';
		case 'boolean':
			return 'yellow';
		case 'date':
			return 'magenta';
		case 'json':
			return 'green';
		default:
			return undefined;
	}
}

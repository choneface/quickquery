import React from 'react';
import { Box, Text } from 'ink';

interface ScrollIndicatorProps {
	currentRow: number;
	visibleRows: number;
	totalRows: number;
}

export const ScrollIndicator = ({ currentRow, visibleRows, totalRows }: ScrollIndicatorProps) => {
	if (totalRows <= visibleRows) {
		return null;
	}

	const scrollbarHeight = Math.max(1, Math.floor((visibleRows / totalRows) * visibleRows));
	const scrollPosition = Math.floor((currentRow / (totalRows - visibleRows)) * (visibleRows - scrollbarHeight));

	const lines: string[] = [];
	for (let i = 0; i < visibleRows; i++) {
		if (i >= scrollPosition && i < scrollPosition + scrollbarHeight) {
			lines.push('█');
		} else {
			lines.push('░');
		}
	}

	return (
		<Box flexDirection="column" marginLeft={1}>
			{lines.map((char, idx) => (
				<Text key={idx} color="gray">
					{char}
				</Text>
			))}
		</Box>
	);
};

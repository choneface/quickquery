import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ScrollIndicator = ({ currentRow, visibleRows, totalRows }) => {
    if (totalRows <= visibleRows) {
        return null;
    }
    const scrollbarHeight = Math.max(1, Math.floor((visibleRows / totalRows) * visibleRows));
    const scrollPosition = Math.floor((currentRow / (totalRows - visibleRows)) * (visibleRows - scrollbarHeight));
    const lines = [];
    for (let i = 0; i < visibleRows; i++) {
        if (i >= scrollPosition && i < scrollPosition + scrollbarHeight) {
            lines.push('█');
        }
        else {
            lines.push('░');
        }
    }
    return (_jsx(Box, { flexDirection: "column", marginLeft: 1, children: lines.map((char, idx) => (_jsx(Text, { color: "gray", children: char }, idx))) }));
};

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { truncate } from '../types.js';
export const ResultHeader = ({ columns }) => {
    const topBorder = buildBorder(columns, '┌', '┬', '┐');
    const bottomBorder = buildBorder(columns, '├', '┼', '┤');
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "gray", children: ' ' + topBorder }), _jsxs(Box, { children: [_jsx(Text, { children: " " }), _jsx(Text, { color: "gray", children: "\u2502" }), columns.map((col) => (_jsxs(Box, { children: [_jsx(Text, { children: " " }), _jsx(Text, { bold: true, color: "white", children: truncate(col.name, col.width).padEnd(col.width) }), _jsx(Text, { children: " " }), _jsx(Text, { color: "gray", children: "\u2502" })] }, col.name)))] }), _jsx(Text, { color: "gray", children: ' ' + bottomBorder })] }));
};
function buildBorder(columns, left, mid, right) {
    const segments = columns.map((col) => '─'.repeat(col.width + 2));
    return left + segments.join(mid) + right;
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ResultFooter = ({ columns, rowCount, executionTime, viewStart, viewEnd }) => {
    const bottomBorder = buildBorder(columns, '└', '┴', '┘');
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "gray", children: ' ' + bottomBorder }), _jsxs(Box, { marginTop: 1, gap: 2, children: [_jsxs(Text, { dimColor: true, children: ["Showing ", viewStart + 1, "-", Math.min(viewEnd, rowCount), " of ", rowCount, " rows"] }), _jsxs(Text, { dimColor: true, children: ["(", executionTime.toFixed(0), "ms)"] })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "\u2191\u2193 scroll \u2022 PgUp/PgDn page \u2022 q back to query" }) })] }));
};
function buildBorder(columns, left, mid, right) {
    const segments = columns.map((col) => '─'.repeat(col.width + 2));
    return left + segments.join(mid) + right;
}

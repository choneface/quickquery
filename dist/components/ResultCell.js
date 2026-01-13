import { jsx as _jsx } from "react/jsx-runtime";
import { Text } from 'ink';
import { formatValue, getCellType, padCell } from '../types.js';
export const ResultCell = ({ value, width }) => {
    const type = getCellType(value);
    const formatted = formatValue(value);
    const padded = padCell(formatted, width, type);
    return (_jsx(Text, { color: getCellColor(type), dimColor: type === 'null', children: padded }));
};
function getCellColor(type) {
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

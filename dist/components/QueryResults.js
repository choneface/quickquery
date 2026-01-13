import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { ResultHeader } from './ResultHeader.js';
import { ResultRow } from './ResultRow.js';
import { ResultFooter } from './ResultFooter.js';
import { ScrollIndicator } from './ScrollIndicator.js';
const DEFAULT_VISIBLE_ROWS = 15;
const PAGE_SIZE = 10;
export const QueryResults = ({ data, onBack }) => {
    const { stdout } = useStdout();
    const [scrollOffset, setScrollOffset] = useState(0);
    const [selectedRow, setSelectedRow] = useState(0);
    // Calculate visible rows based on terminal height (reserve space for header/footer)
    const terminalHeight = stdout?.rows ?? 24;
    const visibleRows = Math.max(5, Math.min(DEFAULT_VISIBLE_ROWS, terminalHeight - 12));
    const maxScroll = Math.max(0, data.rows.length - visibleRows);
    useInput((input, key) => {
        if (input === 'q' || key.escape) {
            onBack();
            return;
        }
        if (key.upArrow) {
            setSelectedRow((prev) => Math.max(0, prev - 1));
            // Scroll up if selected row is above visible area
            setScrollOffset((prev) => {
                const newSelected = Math.max(0, selectedRow - 1);
                if (newSelected < prev) {
                    return newSelected;
                }
                return prev;
            });
        }
        if (key.downArrow) {
            setSelectedRow((prev) => Math.min(data.rows.length - 1, prev + 1));
            // Scroll down if selected row is below visible area
            setScrollOffset((prev) => {
                const newSelected = Math.min(data.rows.length - 1, selectedRow + 1);
                if (newSelected >= prev + visibleRows) {
                    return Math.min(maxScroll, newSelected - visibleRows + 1);
                }
                return prev;
            });
        }
        if (key.pageUp) {
            setSelectedRow((prev) => Math.max(0, prev - PAGE_SIZE));
            setScrollOffset((prev) => Math.max(0, prev - PAGE_SIZE));
        }
        if (key.pageDown) {
            setSelectedRow((prev) => Math.min(data.rows.length - 1, prev + PAGE_SIZE));
            setScrollOffset((prev) => Math.min(maxScroll, prev + PAGE_SIZE));
        }
        // Home - go to first row
        if (key.ctrl && input === 'a') {
            setSelectedRow(0);
            setScrollOffset(0);
        }
        // End - go to last row
        if (key.ctrl && input === 'e') {
            setSelectedRow(data.rows.length - 1);
            setScrollOffset(maxScroll);
        }
    });
    // Keep selected row in view
    useEffect(() => {
        if (selectedRow < scrollOffset) {
            setScrollOffset(selectedRow);
        }
        else if (selectedRow >= scrollOffset + visibleRows) {
            setScrollOffset(selectedRow - visibleRows + 1);
        }
    }, [selectedRow, scrollOffset, visibleRows]);
    const visibleData = data.rows.slice(scrollOffset, scrollOffset + visibleRows);
    if (data.rows.length === 0) {
        return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { color: "yellow", children: "Query executed successfully." }), _jsx(Text, { dimColor: true, children: "No rows returned." }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press q to go back" }) })] }));
    }
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(ResultHeader, { columns: data.columns }), _jsxs(Box, { children: [_jsx(Box, { flexDirection: "column", children: visibleData.map((row, idx) => (_jsx(ResultRow, { row: row, columns: data.columns, isSelected: scrollOffset + idx === selectedRow }, scrollOffset + idx))) }), _jsx(ScrollIndicator, { currentRow: scrollOffset, visibleRows: visibleRows, totalRows: data.rows.length })] }), _jsx(ResultFooter, { columns: data.columns, rowCount: data.rowCount, executionTime: data.executionTime, viewStart: scrollOffset, viewEnd: scrollOffset + visibleRows })] }));
};

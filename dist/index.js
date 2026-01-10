#!/usr/bin/env node
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { render, Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-mini-code-editor';
import pg from 'pg';
function parseJdbcUrl(url) {
    // Parse jdbc:postgresql://host:port/database
    const match = url.match(/^jdbc:postgresql:\/\/([^:]+):(\d+)\/(.+)$/);
    if (!match) {
        throw new Error(`Invalid JDBC URL format. Expected: jdbc:postgresql://host:port/database`);
    }
    return {
        host: match[1],
        port: parseInt(match[2], 10),
        database: match[3],
    };
}
const App = ({ config }) => {
    const { exit } = useApp();
    const [state, setState] = useState('username');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [client, setClient] = useState(null);
    const [query, setQuery] = useState('SELECT 1');
    useInput((input, key) => {
        if (key.ctrl && input === 'c') {
            if (client) {
                client.end();
            }
            exit();
        }
    });
    const handleUsernameSubmit = () => {
        setState('password');
    };
    const handlePasswordSubmit = () => {
        setState('connecting');
    };
    useEffect(() => {
        if (state !== 'connecting')
            return;
        const newClient = new pg.Client({
            host: config.host,
            port: config.port,
            database: config.database,
            user: username,
            password: password,
        });
        newClient
            .connect()
            .then(() => {
            setClient(newClient);
            setState('connected');
        })
            .catch((err) => {
            setError(err.message);
            setState('error');
        });
        return () => {
            if (newClient) {
                newClient.end().catch(() => { });
            }
        };
    }, [state, config, username, password]);
    const handleQuerySubmit = async () => {
        // Query execution will be implemented next
        console.log('Query:', query);
    };
    // Error state
    if (state === 'error') {
        return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { bold: true, color: "red", children: "Connection Failed" }), _jsx(Text, { color: "red", children: error }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Press Ctrl+C to exit" }) })] }));
    }
    // Connecting state
    if (state === 'connecting') {
        return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { bold: true, children: "QuickQuery" }), _jsxs(Text, { dimColor: true, children: [config.host, ":", config.port, "/", config.database] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "yellow", children: "Connecting..." }) })] }));
    }
    // Connected - show query editor
    if (state === 'connected') {
        return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, color: "green", children: "Connected" }), _jsxs(Text, { dimColor: true, children: [" ", username, "@", config.host, ":", config.port, "/", config.database] })] }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: "Enter SQL query (press Enter to execute):" }), _jsxs(Box, { children: [_jsx(Text, { color: "cyan", children: "> " }), _jsx(TextInput, { value: query, onChange: setQuery, onSubmit: handleQuerySubmit, language: "sql", placeholder: "SELECT * FROM ..." })] })] }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: "Ctrl+C to exit" }) })] }));
    }
    // Login prompts
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [_jsx(Text, { bold: true, children: "QuickQuery" }), _jsxs(Text, { dimColor: true, children: [config.host, ":", config.port, "/", config.database] }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [_jsxs(Box, { children: [_jsx(Text, { children: "Username: " }), state === 'username' ? (_jsx(TextInput, { value: username, onChange: setUsername, onSubmit: handleUsernameSubmit, placeholder: "Enter username" })) : (_jsx(Text, { children: username }))] }), state === 'password' && (_jsxs(Box, { children: [_jsx(Text, { children: "Password: " }), _jsx(TextInput, { value: password, onChange: setPassword, onSubmit: handlePasswordSubmit, placeholder: "Enter password", mask: "*" })] }))] })] }));
};
// Parse CLI arguments
const args = process.argv.slice(2);
const databaseUrl = args[0];
if (!databaseUrl) {
    console.error('Usage: qq <database-url>');
    console.error('Example: qq jdbc:postgresql://localhost:5432/postgres');
    process.exit(1);
}
let config;
try {
    config = parseJdbcUrl(databaseUrl);
}
catch (err) {
    console.error(err.message);
    process.exit(1);
}
render(_jsx(App, { config: config }));

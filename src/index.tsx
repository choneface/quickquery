import React, {useState} from 'react';
import {render, Box, Text} from 'ink';
import CodeEditor from 'ink-mini-code-editor';

const SQLEditor = () => {
	const [code, setCode] = useState('SELECT * FROM users WHERE id = 1');

	return (
		<Box flexDirection="column">
			<Text>SQL Query Editor:</Text>
			<Box>
				<Text>{'> '}</Text>
				<CodeEditor
					value={code}
					onChange={setCode}
					placeholder="Enter SQL query..."
					language="sql"
					onSubmit={(val) => {
						console.log('Submitted:', val);
					}}
				/>
			</Box>
		</Box>
	);
};

render(<SQLEditor />);

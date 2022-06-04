import React, { useRef, useState } from 'react';
import './App.css';
import Editor, { Monaco } from "@monaco-editor/react";
import { emit, listen } from '@tauri-apps/api/event';
import { VSCodeButton, VSCodePanels, VSCodePanelView } from '@vscode/webview-ui-toolkit/react'

function App() {
	const [code, setCode] = useState(``);
	const [files, setFiles] = useState<string[]>([]);
	const [selectedFile, setSelectedFile] = useState<string | null>(null);
	const monacoRef = useRef(null);
	
	
	const handleEditorWillMount = (monaco: Monaco) => {
		monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
	}
	
	/*loader.config({ monaco })*/
	
	listen('file_open', (msg: any) => {
		setCode(msg.payload.value);
	}).then(() => {
		console.log("Opened file")
	});
	
	listen<{ files: string[] }>('folder_open', (data) => {
		console.log(data.payload)
		setFiles(data.payload.files);
	}).then(() => {
		console.log("Opened folder")
	})
	
	const handleOpenFolder = async () => {
		await emit('new_folder');
	}
	
	const regEx = new RegExp(/^[^.]*$/)
	
	return (
		<div className="App">
			<div className="explorer">
				{!files.length && <div className="openfolder">
					<VSCodeButton onClick={handleOpenFolder}>
						Open folder
						<span slot="start" className="codicon codicon-folder"/>
					</VSCodeButton>
				</div>}
				<div className="file-list">
					<h3>Files</h3>
					{files.map((file) => {
						return (
							<>
								<p className={selectedFile === file ? "file-item-selected" : "file-item"}>
									{!file.match(regEx) && <span slot="start" className="codicon codicon-file-code"/>}
									{file}
									{file.match(regEx) && <span slot="start" className="codicon codicon-chevron-down"/>}
								</p>
							</>
						)
					})}
				</div>
			</div>
			<div style={{ width: '100%' }}>
				<VSCodePanels style={{ backgroundColor: '#232323' }}>
					<VSCodePanelView id="view-1">
						<Editor
							width="100%"
							height="100vh"
							defaultLanguage="typescript"
							beforeMount={handleEditorWillMount}
							value={code}
							theme='vs-dark'
						/>
					</VSCodePanelView>
				</VSCodePanels>
			</div>
		</div>
	);
}

export default App;

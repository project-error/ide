import React, { useState } from 'react';
import './App.css';
import Editor from "@monaco-editor/react";
import { listen } from '@tauri-apps/api/event';

function App() {
  const [code, setCode] = useState(``);

  listen('file_open', (msg: any) => {
      setCode(msg.payload.value);
    }) 

  return (
    <div className="App">
      <Editor
        height="90vh"
        defaultLanguage="typescript"
        value={code}
        theme='vs-dark'
      />
    </div>
  );
}

export default App;

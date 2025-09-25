import React from 'react'
import ReactDOM from 'react-dom/client'
import QueryEditor from './QueryEditor'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <h1>Trino Query Editor - Example app</h1>
        <QueryEditor />
    </React.StrictMode>
)

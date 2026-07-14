import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const staticExternals = new Set([
    'react',
    'react-dom',
    'react-dom/client',
    'react-dom/server',
    'react/jsx-runtime',
    'react/jsx-dev-runtime',
    'monaco-editor',
    '@monaco-editor/react',
])

// Used for local debugging against Trino also running on localhost at port 8080:
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    server: {
        proxy: {
            '/v1': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            // Don't bundle peer dependencies like React, MUI, Emotion, or Monaco
            external: (id: string) => {
                return (
                    staticExternals.has(id) ||
                    id.startsWith('monaco-editor/') ||
                    id.startsWith('@monaco-editor/') ||
                    id.startsWith('@mui/') ||
                    id.startsWith('@emotion/')
                )
            },
            output: {},
        },
    },
})

// Used for integration into Trino
// // https://vitejs.dev/config/
// export default defineConfig({
//   base: '/query/', // This tells your app it's served from the /query/ path
//   plugins: [react()]
// });

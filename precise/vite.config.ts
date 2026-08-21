import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const peerDependencies = [
  '@emotion/react',
  '@emotion/styled',
  '@monaco-editor/react',
  '@mui/icons-material',
  '@mui/material',
  '@mui/x-data-grid',
  '@mui/x-tree-view',
  'monaco-editor',
  'react',
  'react-dom',
]

const isPeerDependency = (id: string) =>
  peerDependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`))

// Used for local debugging against Trino also running on localhost at port 8080:
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
      external: isPeerDependency,
    },
  },
})

// Used for integration into Trino
// // https://vitejs.dev/config/
// export default defineConfig({
//   base: '/query/', // This tells your app it's served from the /query/ path
//   plugins: [react()]
// });
